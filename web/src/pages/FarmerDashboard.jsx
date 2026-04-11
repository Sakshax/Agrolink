import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Package,
  IndianRupee,
  Clock,
  CheckCircle2,
  Circle,
  Truck,
  QrCode,
  Copy,
  Share2,
  Download,
  ChevronDown,
  ChevronUp,
  MapPin,
  Phone,
  Leaf,
  Eye,
} from "lucide-react";
import MapTracker from "../components/MapTracker";
import { useShipments } from "../context/ShipmentContext";
import { useI18n } from "../i18n/I18nContext";

export default function FarmerDashboard() {
  const { shipments } = useShipments();
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(shipments[0]?.id);
  const [copiedId, setCopiedId] = useState(null);
  const [showQrModal, setShowQrModal] = useState(null);

  const STATUS_META = {
    "in-transit": { label: t("statusInTransit"), bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
    pending:      { label: t("statusPending"),   bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" },
    delivered:    { label: t("statusDelivered"),  bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
    delayed:      { label: t("statusDelayed"),   bg: "bg-red-100",   text: "text-red-700",   dot: "bg-red-500" },
  };

  const toggle = (id) => setExpanded((prev) => (prev === id ? null : id));

  const copyLink = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const shareLink = async (shipment) => {
    if (navigator.share) {
      await navigator.share({
        title: `${t("shipment")} #${shipment.id}`,
        text: `${shipment.crop} — AgroLink`,
        url: shipment.qrPayload,
      });
    } else {
      copyLink(shipment.qrPayload, shipment.id);
    }
  };

  const downloadQr = (id) => {
    const svg = document.getElementById(`qr-${id}`);
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, 512, 512);
      ctx.drawImage(img, 0, 0, 512, 512);
      const a = document.createElement("a");
      a.download = `AgroLink-${id}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const totalEarnings = "₹ 20,500";
  const thisMonth = "₹ 8,300";

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* ── Header ──────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-text">
          {t("farmerTitle")}
        </h1>
        <p className="text-gray-500 mt-1 text-sm md:text-base">
          {t("farmerSubtitle")}
        </p>
      </div>

      {/* ── KPI Row ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <KpiCard icon={Package}     label={t("kpiShipments")}   value={shipments.length} color="text-primary"  bg="bg-green-50" />
        <KpiCard icon={Truck}       label={t("kpiInTransit")}   value={shipments.filter(s => s.status === "in-transit").length} color="text-blue-600" bg="bg-blue-50" />
        <KpiCard icon={IndianRupee} label={t("kpiThisMonth")}   value={thisMonth}  color="text-accent"  bg="bg-amber-50" small />
        <KpiCard icon={Leaf}        label={t("kpiTotalEarned")} value={totalEarnings} color="text-primary" bg="bg-green-50" small />
      </div>

      {/* ── Shipment Cards ──────────────────────────────── */}
      <div className="space-y-4">
        <h2 className="font-heading font-semibold text-primary text-lg">
          {t("myShipments")}
        </h2>

        {shipments.map((s) => {
          const open = expanded === s.id;
          const m = STATUS_META[s.status] ?? STATUS_META.pending;

          return (
            <div key={s.id} className="card transition-all duration-300">
              {/* Collapsed Header */}
              <button
                onClick={() => toggle(s.id)}
                className="w-full flex items-center gap-3 md:gap-4 text-left"
              >
                <div className="shrink-0 bg-gray-50 rounded-lg p-1.5 border border-gray-100">
                  <QRCodeSVG
                    value={s.qrPayload}
                    size={48}
                    level="M"
                    bgColor="transparent"
                    fgColor="#1B6B3A"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm">#{s.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${m.bg} ${m.text}`}>
                      {m.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate mt-0.5">{s.crop} · {s.weight}</p>
                  <p className="text-xs text-gray-400 truncate flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 shrink-0" />
                    {s.to}
                  </p>
                </div>

                <div className="shrink-0 flex flex-col items-end gap-1">
                  <span className="font-heading font-bold text-sm text-accent">{s.price}</span>
                  {open ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Expanded Content */}
              {open && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-5">
                  {/* QR Code Section */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 md:p-6 border border-green-100">
                    <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6">
                      <button
                        onClick={() => setShowQrModal(s.id)}
                        className="shrink-0 bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-shadow cursor-pointer group relative"
                      >
                        <QRCodeSVG
                          id={`qr-${s.id}`}
                          value={s.qrPayload}
                          size={140}
                          level="H"
                          bgColor="#ffffff"
                          fgColor="#1B6B3A"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 rounded-2xl transition-colors flex items-center justify-center">
                          <Eye className="w-6 h-6 text-primary opacity-0 group-hover:opacity-60 transition-opacity" />
                        </div>
                      </button>

                      <div className="flex-1 text-center sm:text-left space-y-3 min-w-0">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-green-600 mb-1">
                            {t("shipmentTrackingQr")}
                          </p>
                          <p className="text-sm text-gray-600">
                            {t("qrDescription")}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-green-200 text-xs">
                          <QrCode className="w-4 h-4 text-primary shrink-0" />
                          <span className="truncate text-gray-600 flex-1">{s.qrPayload}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); copyLink(s.qrPayload, s.id); }}
                            className="shrink-0 text-primary hover:text-secondary"
                          >
                            {copiedId === s.id ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); shareLink(s); }}
                            className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-secondary transition-colors"
                          >
                            <Share2 className="w-3.5 h-3.5" /> {t("shareLink")}
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); downloadQr(s.id); }}
                            className="flex items-center gap-1.5 px-3 py-2 bg-white text-primary border border-primary text-xs font-semibold rounded-lg hover:bg-green-50 transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" /> {t("saveQr")}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 text-sm">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                        {t("shipmentInfo")}
                      </h4>
                      <Detail label={t("labelCrop")} value={s.crop} />
                      <Detail label={t("labelWeight")} value={s.weight} />
                      <Detail label={t("labelBuyer")} value={s.buyer} />
                      <Detail label={t("labelFrom")} value={s.from} />
                      <Detail label={t("labelTo")} value={s.to} />
                      <Detail label={t("labelDispatched")} value={s.dispatchDate} />
                      <Detail label={t("labelEta")} value={s.etaFull} />
                    </div>

                    <div className="space-y-2 text-sm">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                        {t("transportInfo")}
                      </h4>
                      <Detail label={t("labelVehicle")} value={s.vehicle} />
                      <Detail label={t("labelDriver")} value={s.driver} />
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-gray-500 text-sm">{s.driverPhone}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-gray-500 text-sm">{t("labelBuyer")}: {s.buyerPhone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                      {t("deliveryTimeline")}
                    </h4>
                    <div className="space-y-3 relative ml-2">
                       <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gray-200"></div>
                       {s.timeline.map((tl, idx) => (
                         <div key={idx} className={`relative flex gap-3 items-start ${tl.done ? "opacity-100" : "opacity-40"}`}>
                           {tl.done ? (
                             <CheckCircle2 className="w-4 h-4 text-secondary shrink-0 bg-white rounded-full z-10" />
                           ) : (
                             <div className="w-4 h-4 border-2 border-gray-300 shrink-0 bg-white rounded-full z-10"></div>
                           )}
                           <div className="flex items-center gap-2 flex-wrap">
                             <p className={`text-sm font-semibold ${tl.done ? "" : "text-gray-400"}`}>
                               {tl.label}
                             </p>
                             <span className="text-xs text-gray-400">{tl.time}</span>
                           </div>
                         </div>
                       ))}
                    </div>
                  </div>

                  {/* Live Map */}
                  {s.status !== "pending" && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                        {t("liveTrackingMap")}
                      </h4>
                      <div className="rounded-xl overflow-hidden border border-gray-100">
                        <MapTracker shipmentId={s.id} height="250px" />
                      </div>
                    </div>
                  )}
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
    <div className="card flex items-center gap-3">
      <div className={`${bg} rounded-xl p-2.5 md:p-3`}>
        <Icon className={`w-5 h-5 md:w-6 md:h-6 ${color}`} />
      </div>
      <div className="min-w-0">
        <p className={`font-bold font-heading truncate ${small ? "text-base md:text-lg" : "text-xl md:text-2xl"}`}>
          {value}
        </p>
        <p className="text-[10px] md:text-xs text-gray-500 truncate">{label}</p>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <p className="flex gap-1">
      <span className="font-semibold text-gray-500 shrink-0 w-20">{label}:</span>
      <span className="text-gray-800 truncate">{value}</span>
    </p>
  );
}

function QrModal({ shipment, onClose, onDownload, onShare, onCopy, copiedId }) {
  const { t } = useI18n();
  if (!shipment) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <h3 className="font-heading font-bold text-lg text-primary">
            {t("shipment")} #{shipment.id}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {shipment.crop} · {shipment.weight}
          </p>
        </div>

        <div className="flex justify-center">
          <div className="bg-white rounded-2xl p-5 border-2 border-green-100 shadow-inner">
            <QRCodeSVG
              id={`qr-modal-${shipment.id}`}
              value={shipment.qrPayload}
              size={200}
              level="H"
              bgColor="#ffffff"
              fgColor="#1B6B3A"
            />
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 break-all px-2">
          {shipment.qrPayload}
        </p>

        <div className="flex gap-2">
          <button
            onClick={() => onShare(shipment)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg"
          >
            <Share2 className="w-4 h-4" /> {t("share")}
          </button>
          <button
            onClick={() => onDownload(shipment.id)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white text-primary border border-primary text-sm font-semibold rounded-lg"
          >
            <Download className="w-4 h-4" /> {t("save")}
          </button>
          <button
            onClick={() => onCopy(shipment.qrPayload, shipment.id)}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg"
          >
            {copiedId === shipment.id ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full text-center text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          {t("close")}
        </button>
      </div>
    </div>
  );
}
