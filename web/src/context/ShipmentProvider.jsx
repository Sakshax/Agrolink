import { useState, useCallback, useEffect, useRef } from "react";
import { database, ref, set, onValue } from "../api/firebaseConfig";
import { ShipmentContext } from "./ShipmentContext";

/* ── Default shipment data (used as fallback & initial seed) ─ */
const INITIAL_SHIPMENTS = [
  {
    id: "TRK-900A",
    crop: "Premium Wheat",
    weight: "500 kg",
    from: "Farm Gate, Pune",
    to: "Mumbai Warehouse",
    eta: "2 hrs",
    status: "in-transit",
    price: "₹ 4,500",
    vehicle: "MH-12-PQ-4567",
    buyer: "Ravi Traders, Mumbai",
    buyerPhone: "+91 98765 43210",
    driver: "Suresh K.",
    driverPhone: "+91 91111 22222",
    farmer: "Ramesh Patil",
    farmerPhone: "+918108637182",
    dispatchDate: "10 Apr, 10:00 AM",
    etaFull: "10 Apr, 3:30 PM",
    qrPayload: "https://agrolink.app/track/TRK-900A",
    timeline: [
      { label: "Pick Up: Farm Gate, Pune", time: "10:00 AM", done: true },
      { label: "Checkpoint 1: Lonavala", time: "11:15 AM", done: true },
      { label: "Checkpoint 2: Panvel", time: "1:30 PM", done: false },
      { label: "Final Delivery: Mumbai Warehouse", time: "ETA 3:30 PM", done: false },
    ],
  },
  {
    id: "TRK-812C",
    crop: "Basmati Rice",
    weight: "1,200 kg",
    from: "Farm Gate, Pune",
    to: "Mumbai Warehouse",
    eta: "5 hrs",
    status: "pending",
    price: "₹ 12,800",
    vehicle: "MH-14-AB-9012",
    buyer: "GreenMart Mumbai",
    buyerPhone: "+91 91234 56789",
    driver: "Not assigned",
    driverPhone: "—",
    farmer: "Eknath Shinde",
    farmerPhone: "+91 90000 22222",
    dispatchDate: "—",
    etaFull: "—",
    qrPayload: "https://agrolink.app/track/TRK-812C",
    timeline: [
      { label: "Pick Up: Farm Gate, Pune", time: "Pending", done: false },
      { label: "Checkpoint 1: Lonavala", time: "Pending", done: false },
      { label: "Checkpoint 2: Panvel", time: "Pending", done: false },
      { label: "Final Delivery: Mumbai Warehouse", time: "ETA 5 hrs", done: false },
    ],
  },
  {
    id: "TRK-637D",
    crop: "Organic Jowar",
    weight: "300 kg",
    from: "Farm Gate, Pune",
    to: "Mumbai Warehouse",
    eta: "—",
    status: "delivered",
    price: "₹ 3,200",
    vehicle: "MH-11-XY-3344",
    buyer: "Deccan Fresh, Mumbai",
    buyerPhone: "+91 99887 76655",
    driver: "Ajay M.",
    driverPhone: "+91 93333 44444",
    farmer: "Prakash Pawar",
    farmerPhone: "+91 90000 33333",
    dispatchDate: "9 Apr, 6:00 AM",
    etaFull: "9 Apr, 12:10 PM",
    qrPayload: "https://agrolink.app/track/TRK-637D",
    timeline: [
      { label: "Pick Up: Farm Gate, Pune", time: "6:00 AM", done: true },
      { label: "Checkpoint 1: Lonavala", time: "8:45 AM", done: true },
      { label: "Checkpoint 2: Panvel", time: "10:30 AM", done: true },
      { label: "Final Delivery: Mumbai Warehouse", time: "12:10 PM", done: true },
    ],
  },
];

/* helper — build a keyed object for Firebase */
const toMap = (arr) => Object.fromEntries(arr.map((s) => [s.id, s]));

/* helper — ensure timeline arrays survive Firebase (which stores arrays as objects) */
const fixTimeline = (tl) => {
  if (!tl) return undefined;
  if (Array.isArray(tl)) return tl;
  // Firebase may store arrays as { 0: {...}, 1: {...} }
  return Object.keys(tl)
    .sort((a, b) => Number(a) - Number(b))
    .map((k) => tl[k]);
};

const STORAGE_KEY = "agrolink_shipments_v6";

/* Load persisted shipments from localStorage, falling back to INITIAL */
const loadShipments = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge saved data on top of INITIAL to pick up any new fields added in code
      return INITIAL_SHIPMENTS.map((defaults) => {
        const saved_s = parsed.find((s) => s.id === defaults.id);
        return saved_s ? { ...defaults, ...saved_s } : defaults;
      });
    }
  } catch (e) {
    console.warn("Failed to load shipments from localStorage:", e);
  }
  return INITIAL_SHIPMENTS;
};

/* Persist shipments to localStorage */
const saveShipments = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("Failed to save shipments to localStorage:", e);
  }
};

export function ShipmentProvider({ children }) {
  const [shipments, setShipments] = useState(loadShipments);
  const seeded = useRef(false);

  // Save to localStorage whenever shipments change
  useEffect(() => {
    saveShipments(shipments);
  }, [shipments]);

  /* ─────────────────────────────────────────────────────────────
   * REAL-TIME LISTENER — Firebase syncs across devices.
   * Also saves incoming Firebase data to localStorage.
   * ──────────────────────────────────────────────────────────── */
  useEffect(() => {
    const shipmentsRef = ref(database, "shipments_v6");

    const unsubscribe = onValue(shipmentsRef, (snapshot) => {
      if (snapshot.exists()) {
        const fbData = snapshot.val();

        // Rebuild shipments array from Firebase, falling back to INITIAL for missing fields
        const merged = INITIAL_SHIPMENTS.map((defaults) => {
          const remote = fbData[defaults.id];
          if (!remote) return defaults;
          
          // Force labels to come from defaults, keep progress from remote
          const remoteTl = fixTimeline(remote.timeline) || [];
          const safeTimeline = defaults.timeline.map((dt, idx) => {
             const rt = remoteTl[idx];
             return rt ? { ...dt, done: rt.done, time: rt.time } : dt;
          });

          return {
            ...defaults,       // local defaults as base
            ...remote,         // Firebase overwrites other fields
            timeline: safeTimeline,
          };
        });

        setShipments(merged);
      } else if (!seeded.current) {
        // First time ever — push default data to Firebase
        seeded.current = true;
        const initial = loadShipments(); // use localStorage data if available
        set(shipmentsRef, toMap(initial)).catch((e) =>
          console.warn("Firebase seed failed:", e.message)
        );
      }
    });

    return () => unsubscribe();
  }, []);

  /* ─────────────────────────────────────────────────────────────
   * updateStatus — Updates local state immediately AND writes
   * to Firebase for cross-device sync.
   * ──────────────────────────────────────────────────────────── */
  const updateStatus = useCallback((id, newStatus) => {
    const now = () =>
      new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

    setShipments((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;

        const updated = { ...s, status: newStatus };
        const tl = s.timeline.map((t) => ({ ...t }));

        if (newStatus === "pending") {
          tl.forEach((t) => { t.done = false; t.time = "Pending"; });
        } else if (newStatus === "in-transit") {
          if (tl.length > 0 && !tl[0].done) {
            tl[0].done = true;
            tl[0].time = now();
          }

        } else if (newStatus === "delivered") {
          tl.forEach((t) => { if (!t.done) t.time = now(); t.done = true; });
        }
        // "delayed" — keep current progress untouched

        updated.timeline = tl;

        // ── Also write to Firebase for cross-device sync ──
        set(ref(database, `shipments_v6/${id}`), updated).catch((e) =>
          console.warn("Firebase write failed:", e.message)
        );

        // ── Async notifications (fire-and-forget) ──
        const notify = async (phone, name) => {
          if (!phone || phone === "—") return;
          try {
            const res = await fetch("http://localhost:3001/api/notify/status", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                recipientPhone: phone,
                name,
                cropType: updated.crop,
                status: newStatus,
                trackingId: updated.id,
              }),
            });
            if (!res.ok) {
              const errData = await res.json();
              console.error(`Twilio Server Error (${res.status}):`, errData);
            }
          } catch (e) {
            console.warn("Failed to reach mock notification server:", e.message);
          }
        };

        notify(updated.buyerPhone, updated.buyer);
        notify(updated.farmerPhone, updated.farmer);

        return updated;
      })
    );
  }, []);

  const updateCheckpoint = useCallback((id, checkpointIdx) => {
    setShipments((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        // Skip if not in-transit
        if (s.status !== "in-transit" && s.status !== "pending") return s;

        const updated = { ...s };
        const tl = s.timeline.map((t) => ({ ...t }));
        
        if (checkpointIdx >= 0 && checkpointIdx < tl.length) {
          if (!tl[checkpointIdx].done) {
            tl[checkpointIdx].done = true;
            tl[checkpointIdx].time = new Date().toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            });
          }
        }
        updated.timeline = tl;
        // Make sure status is at least in-transit if they scanned a mid-checkpoint
        if (updated.status === "pending") {
           updated.status = "in-transit";
        }

        // ── Firebase write ──
        set(ref(database, `shipments_v6/${id}`), updated).catch((e) =>
          console.warn("Firebase write failed:", e.message)
        );

        return updated;
      })
    );
  }, []);

  const getShipment = useCallback(
    (id) => shipments.find((s) => s.id === id) ?? null,
    [shipments]
  );

  const byStatus = useCallback(
    (status) => shipments.filter((s) => s.status === status),
    [shipments]
  );

  return (
    <ShipmentContext.Provider value={{ shipments, updateStatus, updateCheckpoint, getShipment, byStatus }}>
      {children}
    </ShipmentContext.Provider>
  );
}
