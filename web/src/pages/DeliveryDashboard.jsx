import { useState } from "react";
import {
  Truck,
  Package,
  MapPin,
  Clock,
  CheckCircle2,
  Circle,
  ChevronRight,
  Phone,
  Navigation,
  AlertTriangle,
  Camera,
  X,
} from "lucide-react";
import { Scanner } from '@yudiel/react-qr-scanner';
import MapTracker from "../components/MapTracker";
import { useShipments } from "../context/ShipmentContext";
import { useI18n } from "../i18n/I18nContext";

export default function DeliveryDashboard() {
  const { shipments, updateStatus, updateCheckpoint } = useShipments();
  const { t } = useI18n();
  const [selected, setSelected] = useState(shipments[0]);
  const [mobileView, setMobileView] = useState("list");

  // Scanner state: null = closed, shipment id = targeted scan
  const [scanTarget, setScanTarget] = useState(null);

  // Keep selected in sync with context
  const currentSelected = shipments.find((s) => s.id === selected.id) ?? shipments[0];

  const STATUS_META = {
    "in-transit": { label: t("statusInTransit"), bg: "bg-blue-100", text: "text-blue-700" },
    pending:      { label: t("statusPending"),   bg: "bg-amber-100", text: "text-amber-700" },
    delivered:    { label: t("statusDelivered"),  bg: "bg-green-100", text: "text-green-700" },
    delayed:      { label: t("statusDelayed"),   bg: "bg-red-100",   text: "text-red-700" },
  };

  const selectShipment = (s) => {
    setSelected(s);
    setMobileView("detail");
  };

  // Open scanner for a specific shipment
  const openScannerFor = (shipmentId, e) => {
    if (e) e.stopPropagation(); // don't trigger card select
    setScanTarget(shipmentId);
  };

  const handleScan = (result) => {
    if (!result || !result.length) return;
    const url = result[0].rawValue || result[0];
    const scannedValue = typeof url === 'string' ? url : (typeof result === 'string' ? result : '');
    if (!scannedValue) return;

    const parts = scannedValue.split('/');
    let scannedId = "";
    let cpIdx = -1;

    if (scannedValue.includes("/checkpoint/")) {
      cpIdx = parseInt(parts[parts.length - 1], 10);
      scannedId = parts[parts.length - 3];
    } else {
      scannedId = parts[parts.length - 1];
    }

    // Validate scanned QR matches the targeted shipment
    if (scanTarget && scannedId !== scanTarget) {
      alert(`${t("wrongQr")} ${scanTarget}, ${t("butScanned")} ${scannedId}`);
      return;
    }
    
    const found = shipments.find(s => s.id === scannedId);
    if (found) {
      if (cpIdx >= 0) {
        updateCheckpoint(found.id, cpIdx);
        selectShipment({ ...found, status: "in-transit" });
        alert(`Checkpoint ${cpIdx} ${t("checkpointComplete")} ${found.id}!`);
      } else {
        // QR scan ONLY allows pending → in-transit
        if (found.status === "pending") {
          updateStatus(found.id, "in-transit");
          selectShipment({ ...found, status: "in-transit" });
        } else {
          // Already in-transit, delivered, or delayed — no change
          selectShipment(found);
        }
      }
      setScanTarget(null);
    } else {
      alert(t("shipmentNotFound") + " " + scannedId);
      setScanTarget(null);
    }
  };

  const meta = (s) => STATUS_META[s.status] ?? STATUS_META.pending;

  const totalAssigned = shipments.length;
  const inTransit = shipments.filter((s) => s.status === "in-transit").length;
  const delivered = shipments.filter((s) => s.status === "delivered").length;
  const pending   = shipments.filter((s) => s.status === "pending").length;

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex justify-between items-start sm:items-center flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-text">
            {t("deliveryTitle")}
          </h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">
            {t("deliverySubtitle")}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 md:gap-2 text-[10px] md:text-sm font-semibold text-primary bg-green-50 border border-green-200 rounded-full px-2.5 md:px-4 py-1 md:py-2">
          <span className="relative flex h-2 w-2 md:h-2.5 md:w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-full w-full bg-green-500"></span>
          </span>
          {t("online")}
        </span>
      </div>

      {/* ── QR Scanner Modal ────────────────────────────── */}
      {scanTarget !== null && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 shrink-0">
              <div>
                <h3 className="font-heading font-bold text-gray-800">{t("scanQrCode")}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{t("shipment")} #{scanTarget}</p>
              </div>
              <button onClick={() => setScanTarget(null)} className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative w-full aspect-[4/5] bg-black shrink-0">
              <Scanner 
                onScan={handleScan}
                onError={(err) => console.error(err)}
                formats={['qr_code']}
                constraints={{ facingMode: 'environment' }}
                components={{ 
                  audio: true,
                  finder: true,
                }}
                styles={{ container: { width: '100%', height: '100%' } }}
              />
            </div>
            <div className="p-4 text-center text-sm font-medium text-gray-600 bg-gray-50 shrink-0">
              {t("scanLabel")} <strong>#{scanTarget}</strong>
            </div>
          </div>
        </div>
      )}

      {/* ── KPI Cards ───────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <KpiCard icon={Package}      label={t("kpiTotalAssigned")} value={totalAssigned} color="text-primary"    bg="bg-green-50" />
        <KpiCard icon={Truck}        label={t("kpiInTransit")}     value={inTransit}     color="text-blue-600"   bg="bg-blue-50" />
        <KpiCard icon={Clock}        label={t("kpiPending")}       value={pending}       color="text-amber-600"  bg="bg-amber-50" />
        <KpiCard icon={CheckCircle2} label={t("kpiDelivered")}     value={delivered}     color="text-green-600"  bg="bg-green-50" />
      </div>

      {/* ── Mobile Back Button ──────────────────────────── */}
      {mobileView === "detail" && (
        <button
          onClick={() => setMobileView("list")}
          className="lg:hidden flex items-center gap-1 text-sm font-semibold text-primary"
        >
          <ChevronRight className="w-4 h-4 rotate-180" /> {t("backToList")}
        </button>
      )}

      {/* ── Main Grid ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">

        {/* ── Shipment List ──────────────────────────────── */}
        <div className={`card lg:col-span-1 flex flex-col max-h-[540px] md:max-h-[620px] ${mobileView === "detail" ? "hidden lg:flex" : "flex"}`}>
          <h3 className="font-heading font-semibold mb-3 md:mb-4 text-primary text-sm md:text-base">
            {t("assignedShipments")}
          </h3>

          <div className="flex-1 overflow-y-auto space-y-2.5 md:space-y-3 pr-1 -mr-1">
            {shipments.map((s) => {
              const isActive = currentSelected.id === s.id;
              const m = meta(s);
              return (
                <button
                  key={s.id}
                  onClick={() => selectShipment(s)}
                  className={`w-full text-left p-3 md:p-4 rounded-lg border-2 transition-all duration-200 group
                    ${isActive
                      ? "border-primary bg-green-50/60 shadow-md"
                      : "border-gray-100 bg-white hover:border-primary/30 hover:shadow-sm"
                    }`}
                >
                  <div className="flex items-center justify-between mb-1.5 md:mb-2">
                    <span className="font-bold text-xs md:text-sm">#{s.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] md:text-xs font-bold ${m.bg} ${m.text}`}>
                      {m.label}
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-gray-600 truncate">{s.crop} · {s.weight}</p>
                  <div className="flex items-center gap-1 text-[10px] md:text-xs text-gray-400 mt-1">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{s.from} → {s.to}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2 md:mt-2.5">
                    <span className="text-[10px] md:text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {t("eta")} {s.eta}
                    </span>
                    {/* Scan QR button — for pending & in-transit */}
                    {s.status !== "delivered" && s.status !== "delayed" ? (
                      <span
                        role="button"
                        onClick={(e) => openScannerFor(s.id, e)}
                        className="flex items-center gap-1 bg-primary text-white text-[10px] md:text-xs font-bold px-2.5 py-1 md:px-3 md:py-1.5 rounded-md hover:bg-primary-dark transition-colors shadow-sm"
                      >
                        <Camera className="w-3 h-3 md:w-3.5 md:h-3.5" />
                        {t("scanQr")}
                      </span>
                    ) : s.status === "delivered" ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? "text-primary rotate-90" : "text-gray-300 group-hover:text-primary"}`} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Map + Details (right) ─────────────────────── */}
        <div className={`lg:col-span-2 flex flex-col gap-5 md:gap-6 ${mobileView === "list" ? "hidden lg:flex" : "flex"}`}>
          {/* Live Map */}
          <div className="card flex flex-col">
            <div className="flex items-center justify-between mb-3 md:mb-4 flex-wrap gap-2">
              <h3 className="font-heading font-semibold text-primary text-sm md:text-base">
                {t("liveRoute")} — #{currentSelected.id}
              </h3>
              <a
                href={`https://www.google.com/maps/dir/${encodeURIComponent(currentSelected.from)}/${encodeURIComponent(currentSelected.to)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] md:text-xs flex items-center gap-1 text-primary hover:underline"
              >
                <Navigation className="w-3 h-3" /> {t("openInMaps")}
              </a>
            </div>
            <MapTracker shipmentId={currentSelected.id} height="250px" />
          </div>

          {/* Bottom: Details + Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            {/* Shipment Details + Timeline */}
            <div className="card">
              <h3 className="font-heading font-semibold mb-3 md:mb-4 text-primary text-sm md:text-base">
                {t("shipmentDetails")}
              </h3>

              <div className="space-y-1.5 md:space-y-2 text-xs md:text-sm mb-5 md:mb-6">
                <Detail label={t("labelCrop")} value={currentSelected.crop} />
                <Detail label={t("labelWeight")} value={currentSelected.weight} />
                <Detail label={t("labelFrom")} value={currentSelected.from} />
                <Detail label={t("labelTo")} value={currentSelected.to} />
                <Detail label={t("labelVehicle")} value={currentSelected.vehicle} />
                <div className="flex items-center gap-2 pt-1">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-gray-500 text-xs md:text-sm">{currentSelected.buyerPhone}</span>
                </div>
              </div>

              <h4 className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5 md:mb-3">
                {t("timeline")}
              </h4>
              <div className="space-y-3 md:space-y-4 relative ml-2.5">
                <div className="absolute left-[7px] top-3 bottom-3 w-0.5 bg-gray-200"></div>
                {currentSelected.timeline.map((tl, idx) => (
                  <div key={idx} className="relative flex gap-3 items-start">
                    {tl.done ? (
                      <CheckCircle2 className="w-4 h-4 text-secondary shrink-0 bg-white rounded-full z-10" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-300 shrink-0 bg-white rounded-full z-10" />
                    )}
                    <div>
                      <p className={`text-xs md:text-sm font-semibold ${tl.done ? "" : "text-gray-400"}`}>
                        {tl.label}
                      </p>
                      <p className="text-[10px] md:text-xs text-gray-400">{tl.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipment Status Card */}
            <div className="card flex flex-col">
              <h3 className="font-heading font-semibold mb-3 md:mb-4 text-primary text-sm md:text-base">
                {t("shipmentStatus")}
              </h3>

              {/* Current status indicators */}
              <div className="space-y-2 md:space-y-2.5 flex-1">
                {[
                  { key: "pending",    label: t("pendingPickup"),  icon: Clock },
                  { key: "in-transit", label: t("statusInTransit"), icon: Truck },
                  { key: "delivered",  label: t("statusDelivered"), icon: CheckCircle2 },
                  { key: "delayed",    label: t("delayedIssue"),    icon: AlertTriangle },
                ].map(({ key, label, icon: Icon }) => {
                  const active = currentSelected.status === key;
                  return (
                    <div
                      key={key}
                      className={`w-full flex items-center gap-2.5 md:gap-3 px-3 md:px-4 py-2 md:py-2.5 rounded-lg border-2 text-xs md:text-sm font-semibold transition-all duration-200
                        ${active
                          ? "border-primary bg-primary text-white shadow-md"
                          : "border-gray-100 bg-gray-50 text-gray-400"
                        }`}
                    >
                      <Icon className="w-4 h-4 md:w-5 md:h-5" />
                      {label}
                      {active && (
                        <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4 ml-auto" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Scan to Update CTA — for pending & in-transit */}
              {currentSelected.status !== "delivered" && currentSelected.status !== "delayed" && (
                <button
                  onClick={() => openScannerFor(currentSelected.id)}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-white px-4 py-3 md:py-3.5 rounded-lg text-xs md:text-sm font-bold hover:bg-primary-dark transition-colors shadow-md mt-3 md:mt-4"
                >
                  <Camera className="w-4 h-4 md:w-5 md:h-5" />
                  {t("scanMarkTransit")}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ───────────────────────────────────────── */

function KpiCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="card flex items-center gap-2.5 md:gap-4">
      <div className={`${bg} rounded-lg md:rounded-xl p-2 md:p-3`}>
        <Icon className={`w-4 h-4 md:w-6 md:h-6 ${color}`} />
      </div>
      <div className="min-w-0">
        <p className="text-lg md:text-2xl font-bold font-heading">{value}</p>
        <p className="text-[10px] md:text-xs text-gray-500 truncate">{label}</p>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <p className="flex gap-1">
      <span className="font-semibold w-16 md:w-20 shrink-0 text-gray-600">{label}:</span>
      <span className="text-gray-800 truncate">{value}</span>
    </p>
  );
}
