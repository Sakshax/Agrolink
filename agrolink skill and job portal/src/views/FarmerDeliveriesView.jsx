import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { QRCodeSVG } from "qrcode.react";
import { 
  Package, Truck, Leaf, IndianRupee, MapPin, Phone, CheckCircle2, Copy, Share2, Download, ChevronDown, ChevronUp, QrCode, Eye, ArrowLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";
import MapTracker from "../components/MapTracker";
import { useLanguage } from "../LanguageContext";

export default function FarmerDeliveriesView() {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const { user } = useSelector(state => state.auth);
  
  const [shipments, setShipments] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [showQrModal, setShowQrModal] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync real-time orders belonging to this farmer
  useEffect(() => {
    if (!user) return;
    
    // We fetch orders where this farmer is the seller
    const q = query(collection(db, "orders"), where("farmerId", "==", user._id || "demo_user"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setShipments(orders);
      setLoading(false);
      // Auto-expand first order if none expanded
      if (orders.length > 0 && expanded === null) {
        setExpanded(orders[0].id);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const STATUS_META = {
    "in-transit": { label: "In Transit", bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
    pending:      { label: "Pending",   bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" },
    delivered:    { label: "Delivered",  bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
    delayed:      { label: "Delayed",   bg: "bg-red-100",   text: "text-red-700",   dot: "bg-red-500" },
  };

  const toggle = (id) => setExpanded((prev) => (prev === id ? null : id));

  const copyLink = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const shareLink = async (shipment) => {
    const trackingUrl = `${window.location.origin}/tracking/${shipment.id}`;
    if (navigator.share) {
      await navigator.share({
        title: `Shipment #${shipment.id}`,
        text: `${shipment.cropName} — AgroLink Track`,
        url: trackingUrl,
      });
    } else {
      copyLink(trackingUrl, shipment.id);
    }
  };

  const downloadQr = (id) => {
    const svg = document.getElementById(`qr-${id}`) || document.getElementById(`qr-modal-${id}`);
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 512, 512);
      ctx.drawImage(img, 0, 0, 512, 512);
      const a = document.createElement("a");
      a.download = `AgroLink-${id}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const totalEarnings = shipments.filter(s => s.status === 'delivered').reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);
  const thisMonth = totalEarnings; // Assuming all listed are this month for now

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 pb-28 min-h-[100dvh] bg-cream font-sans">
      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/mandi-dashboard')} className="p-2 bg-white rounded-xl shadow-sm border border-light-gray">
          <ArrowLeft className="w-6 h-6 text-charcoal" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-charcoal leading-tight">Farmer Logs</h1>
          <p className="text-xs font-bold text-charcoal/40 uppercase tracking-widest mt-1">Status & Tracking Hub</p>
        </div>
      </div>

      {/* ── KPI Row ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <KpiCard icon={Package}     label="Total Shipments"   value={shipments.length} color="text-primary"  bg="bg-primary/10" />
        <KpiCard icon={Truck}       label="In Transit"   value={shipments.filter(s => s.status === "in-transit").length} color="text-blue-600" bg="bg-blue-50" />
        <KpiCard icon={IndianRupee} label="This Month"   value={`₹${thisMonth.toLocaleString()}`}  color="text-accent-amber"  bg="bg-amber-50" small />
        <KpiCard icon={Leaf}        label="Total Earned" value={`₹${totalEarnings.toLocaleString()}`} color="text-primary" bg="bg-primary/10" small />
      </div>

      {/* ── Shipment Cards ──────────────────────────────── */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-charcoal pl-1">Real-Time Shipments</h2>

        {loading ? (
           <p className="text-center font-bold text-charcoal/40 py-20">Loading real-time sync...</p>
        ) : shipments.length === 0 ? (
           <div className="text-center py-20 bg-white rounded-3xl border border-light-gray shadow-sm">
              <p className="font-bold text-charcoal/50">You have no active shipments yet.</p>
           </div>
        ) : shipments.map((s) => {
          const open = expanded === s.id;
          const m = STATUS_META[s.status] || STATUS_META.pending;
          const trackingUrl = `${window.location.origin}/tracking/${s.id}`;

          // Formatter for Timeline
          const timeline = s.timeline || [
            { label: 'Order Placed', time: new Date().toLocaleTimeString(), done: true },
            { label: 'Dispatched', time: '--', done: s.status === 'in-transit' || s.status === 'delivered' },
            { label: 'Delivered', time: '--', done: s.status === 'delivered' }
          ];

          return (
            <div key={s.id} className="bg-white rounded-[24px] shadow-sm border border-light-gray transition-all overflow-hidden">
              {/* Collapsed Header */}
              <button
                onClick={() => toggle(s.id)}
                className="w-full flex items-center gap-3 md:gap-4 text-left p-4 hover:bg-light-gray/20 transition-colors"
              >
                <div className="shrink-0 bg-light-gray/50 rounded-xl p-2 border border-light-gray/50 hidden sm:block">
                  <QRCodeSVG
                    value={trackingUrl}
                    size={48}
                    level="M"
                    bgColor="transparent"
                    fgColor="#1B6B3A"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-black text-sm text-charcoal">#{s.id.substring(0, 8)}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${m.bg} ${m.text}`}>
                      {m.label}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-charcoal truncate leading-tight">{s.cropName} · {s.quantity} Qtl</p>
                  <p className="text-[10px] font-bold text-charcoal/40 uppercase tracking-widest truncate flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 shrink-0" />
                    Buyer: {s.address ? s.address.split(',')[0] : 'Unknown'}
                  </p>
                </div>

                <div className="shrink-0 flex flex-col items-end gap-1">
                  <span className="font-black text-sm text-charcoal">₹{s.totalPrice || '--'}</span>
                  {open ? (
                    <ChevronUp className="w-5 h-5 text-charcoal/40" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-charcoal/40" />
                  )}
                </div>
              </button>

              {/* Expanded Content */}
              {open && (
                <div className="p-4 pt-0 border-t border-light-gray/50 space-y-5 bg-light-gray/10 rounded-b-[24px]">
                  
                  {/* Map tracking directly hooked into same firebase doc */}
                  <div className="mt-4">
                     <h4 className="text-xs font-black uppercase tracking-widest text-charcoal/40 mb-3 ml-2">Live Map (Firestore Sync)</h4>
                     <MapTracker shipmentId={s.id} height="200px" />
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2 bg-white p-4 rounded-3xl border border-light-gray shadow-sm">
                      <h4 className="text-xs font-black uppercase tracking-widest text-charcoal/40 mb-4">
                        Purchase Info
                      </h4>
                      <Detail label="Crop" value={s.cropName} />
                      <Detail label="Total Quantity" value={`${s.quantity} Qtl`} />
                      <Detail label="Payment" value={s.paymentMethod || "UPI"} />
                      <Detail label="Shipping Addr" value={s.address || "Pending buyer input"} />
                    </div>

                    <div className="space-y-2 bg-white p-4 rounded-3xl border border-light-gray shadow-sm">
                        <h4 className="text-xs font-black uppercase tracking-widest text-charcoal/40 mb-4">
                           Action QR Code
                        </h4>
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                           <button onClick={() => setShowQrModal(s.id)} className="shrink-0 bg-white p-2 rounded-2xl shadow-sm border border-light-gray relative group">
                              <QRCodeSVG id={`qr-${s.id}`} value={trackingUrl} size={100} level="H" fgColor="#1B6B3A" />
                              <div className="absolute inset-0 bg-black/5 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Eye className="w-6 h-6 text-primary" />
                              </div>
                           </button>
                           <div className="flex-1 space-y-2 w-full text-center sm:text-left">
                              <p className="text-xs font-bold text-charcoal/60 leading-relaxed">Buyers or drivers can scan this code to jump instantly to the tracking interface.</p>
                              <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-1">
                                 <button onClick={(e) => { e.stopPropagation(); shareLink(s); }} className="px-3 py-2 bg-primary/10 text-primary font-black uppercase tracking-widest text-[10px] rounded-xl flex items-center gap-1.5 hover:bg-primary/20">
                                   <Share2 className="w-3.5 h-3.5" /> Share
                                 </button>
                                 <button onClick={(e) => { e.stopPropagation(); downloadQr(s.id); }} className="px-3 py-2 bg-white border border-light-gray text-charcoal font-black uppercase tracking-widest text-[10px] rounded-xl flex items-center gap-1.5 hover:bg-light-gray/50">
                                   <Download className="w-3.5 h-3.5" /> Save
                                 </button>
                              </div>
                           </div>
                        </div>
                        
                        <div className="flex items-center gap-2 bg-light-gray/50 rounded-xl px-3 py-2 border border-light-gray/50 text-xs mt-3">
                          <QrCode className="w-4 h-4 text-charcoal/40 shrink-0" />
                          <span className="truncate font-bold text-charcoal/60 flex-1">{trackingUrl}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); copyLink(trackingUrl, s.id); }}
                            className="shrink-0 text-primary hover:text-secondary"
                          >
                            {copiedId === s.id ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* QR Fullscreen Modal */}
      {showQrModal && (
        <QrModal
          shipment={shipments.find((s) => s.id === showQrModal)}
          onClose={() => setShowQrModal(null)}
          onDownload={downloadQr}
          onShare={shareLink}
          onCopy={copyLink}
          copiedId={copiedId}
        />
      )}
    </div>
  );
}

/* ── Sub-components ───────────────────────────────────────── */

function KpiCard({ icon: Icon, label, value, color, bg, small }) {
  return (
    <div className="bg-white rounded-[24px] border border-light-gray shadow-sm flex flex-col items-start gap-3 p-4">
      <div className={`${bg} rounded-xl p-3`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div className="min-w-0">
        <p className={`font-black text-charcoal leading-none mb-1 shadow-sm ${small ? "text-lg" : "text-2xl"}`}>
          {value}
        </p>
        <p className="text-[10px] font-black uppercase tracking-widest text-charcoal/40">{label}</p>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <p className="flex gap-2 justify-between items-center px-4 py-2 bg-light-gray/30 rounded-xl">
      <span className="font-bold text-[10px] uppercase tracking-widest text-charcoal/40 shrink-0">{label}:</span>
      <span className="text-sm font-bold text-charcoal truncate text-right">{value}</span>
    </p>
  );
}

function QrModal({ shipment, onClose, onDownload, onShare, onCopy, copiedId }) {
  if (!shipment) return null;
  const trackingUrl = `${window.location.origin}/tracking/${shipment.id}`;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-charcoal/60 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl space-y-6 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <h3 className="font-black text-xl text-primary">
            Order QR Code
          </h3>
          <p className="text-xs font-bold text-charcoal/40 mt-1 uppercase tracking-widest">
            {shipment.cropName} · {shipment.quantity} Qtl
          </p>
        </div>

        <div className="flex justify-center">
          <div className="bg-white rounded-3xl p-6 border-2 border-primary/10 shadow-lg shadow-primary/10">
            <QRCodeSVG
              id={`qr-modal-${shipment.id}`}
              value={trackingUrl}
              size={200}
              level="H"
              fgColor="#1B6B3A"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onShare(shipment)}
            className="flex-1 flex items-center justify-center gap-2 h-14 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-2xl active:scale-95 transition-all shadow-md"
          >
            <Share2 className="w-5 h-5" /> Share
          </button>
          <button
            onClick={() => onDownload(shipment.id)}
            className="flex-1 flex items-center justify-center gap-2 h-14 bg-white text-primary border border-primary text-xs font-black uppercase tracking-widest rounded-2xl active:scale-95 transition-all"
          >
            <Download className="w-5 h-5" /> Save
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full text-center text-xs font-black uppercase tracking-widest text-charcoal/40 hover:text-charcoal transition-colors mt-4 block"
        >
          Close Preview
        </button>
      </div>
    </div>
  );
}
