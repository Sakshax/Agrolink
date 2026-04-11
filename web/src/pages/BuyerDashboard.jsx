import { useState } from "react";
import {
  CheckCircle2,
  Star,
  Truck,
  MapPin,
  Clock,
  Package,
  Phone,
  IndianRupee,
  ChevronRight,
  ShieldCheck,
  ThumbsUp,
  MessageSquare,
  Eye,
} from "lucide-react";
import MapTracker from "../components/MapTracker";
import { useShipments } from "../context/ShipmentContext";
import { useI18n } from "../i18n/I18nContext";

export default function BuyerDashboard() {
  const { shipments, updateStatus } = useShipments();
  const { t } = useI18n();
  const [selectedId, setSelectedId] = useState(shipments[0]?.id);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [mobileView, setMobileView] = useState("list"); // "list" | "detail"
  const [showConfirm, setShowConfirm] = useState(false);

  const selected = shipments.find((s) => s.id === selectedId) ?? shipments[0];

  const STATUS_META = {
    "in-transit": { label: t("statusInTransit"), bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500", icon: Truck },
    pending:      { label: t("statusPending"),   bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500", icon: Clock },
    delivered:    { label: t("statusDelivered"),  bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500", icon: CheckCircle2 },
    delayed:      { label: t("statusDelayed"),   bg: "bg-red-100",   text: "text-red-700",   dot: "bg-red-500", icon: Clock },
  };

  const m = STATUS_META[selected.status] ?? STATUS_META.pending;

  const selectOrder = (s) => {
    setSelectedId(s.id);
    setMobileView("detail");
    setRating(0);
    setShowConfirm(false);
  };

  const handleAcknowledgeClick = () => {
    if (selected.status === "in-transit") {
      setShowConfirm(true);
    }
  };

  const confirmDelivery = () => {
    updateStatus(selected.id, "delivered");
    setShowConfirm(false);
  };

  // KPI summary
  const totalOrders = shipments.length;
  const activeOrders = shipments.filter((s) => s.status === "in-transit" || s.status === "pending").length;
  const deliveredOrders = shipments.filter((s) => s.status === "delivered").length;
  const totalValue = shipments.reduce((sum, s) => {
    const num = parseInt(s.price.replace(/[^\d]/g, ""), 10) || 0;
    return sum + num;
  }, 0);

  const ratingLabels = ["", t("ratingPoor"), t("ratingFair"), t("ratingGood"), t("ratingGreat"), t("ratingExcellent")];

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex justify-between items-start sm:items-center flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-text">
            {t("buyerTitle")}
          </h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">
            {t("buyerSubtitle")}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 md:gap-2 text-[10px] md:text-sm font-semibold text-primary bg-green-50 border border-green-200 rounded-full px-2.5 md:px-4 py-1 md:py-2">
          <ShieldCheck className="w-3.5 h-3.5 md:w-4 md:h-4" />
          {t("verifiedBuyer")}
        </span>
      </div>

      {/* ── KPI Cards ───────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <KpiCard icon={Package}      label={t("kpiTotalOrders")} value={totalOrders}                       color="text-primary"   bg="bg-green-50" />
        <KpiCard icon={Truck}        label={t("kpiActive")}      value={activeOrders}                      color="text-blue-600"  bg="bg-blue-50" />
        <KpiCard icon={CheckCircle2} label={t("kpiDelivered")}   value={deliveredOrders}                   color="text-green-600" bg="bg-green-50" />
        <KpiCard icon={IndianRupee}  label={t("kpiTotalValue")}  value={`₹ ${totalValue.toLocaleString()}`} color="text-accent"    bg="bg-amber-50" small />
      </div>

      {/* ── Mobile Back Button ──────────────────────────── */}
      {mobileView === "detail" && (
        <button
          onClick={() => setMobileView("list")}
          className="lg:hidden flex items-center gap-1 text-sm font-semibold text-primary"
        >
          <ChevronRight className="w-4 h-4 rotate-180" /> {t("backToOrders")}
        </button>
      )}

      {/* ── Main Grid ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">

        {/* ── Order List ──────────────────────────────────── */}
        <div className={`card lg:col-span-1 flex flex-col max-h-[540px] md:max-h-[620px] ${mobileView === "detail" ? "hidden lg:flex" : "flex"}`}>
          <h3 className="font-heading font-semibold mb-3 md:mb-4 text-primary text-sm md:text-base">
            {t("myOrders")}
          </h3>

          <div className="flex-1 overflow-y-auto space-y-2.5 md:space-y-3 pr-1 -mr-1">
            {shipments.map((s) => {
              const isActive = selected.id === s.id;
              const sm = STATUS_META[s.status] ?? STATUS_META.pending;
              return (
                <button
                  key={s.id}
                  onClick={() => selectOrder(s)}
                  className={`w-full text-left p-3 md:p-4 rounded-lg border-2 transition-all duration-200 group
                    ${isActive
                      ? "border-primary bg-green-50/60 shadow-md"
                      : "border-gray-100 bg-white hover:border-primary/30 hover:shadow-sm"
                    }`}
                >
                  <div className="flex items-center justify-between mb-1.5 md:mb-2">
                    <span className="font-bold text-xs md:text-sm">#{s.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] md:text-xs font-bold ${sm.bg} ${sm.text}`}>
                      {sm.label}
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-gray-600 truncate">{s.crop} · {s.weight}</p>
                  <div className="flex items-center gap-1 text-[10px] md:text-xs text-gray-400 mt-1">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{s.from} → {s.to}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1.5 md:mt-2">
                    <span className="font-heading font-bold text-xs md:text-sm text-accent">{s.price}</span>
                    {s.status === "delivered" ? (
                      <span className="flex items-center gap-1 text-[10px] text-green-600 font-semibold">
                        <ThumbsUp className="w-3 h-3" /> {t("confirmed")}
                      </span>
                    ) : s.status === "in-transit" ? (
                      <span className="flex items-center gap-1 text-[10px] text-amber-600 font-semibold animate-pulse">
                        <Eye className="w-3 h-3" /> {t("actionRequired")}
                      </span>
                    ) : (
                      <span className="text-[10px] md:text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {t("eta")} {s.eta}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Order Details (right) ────────────────────────── */}
        <div className={`lg:col-span-2 flex flex-col gap-5 md:gap-6 ${mobileView === "list" ? "hidden lg:flex" : "flex"}`}>

          {/* Status banner */}
          <div className={`card flex items-center gap-3 md:gap-4 ${m.bg} border-l-4 ${m.text.replace("text-", "border-")}`}>
            <m.icon className={`w-5 h-5 md:w-6 md:h-6 ${m.text}`} />
            <div className="flex-1 min-w-0">
              <p className={`font-heading font-bold text-sm md:text-base ${m.text}`}>
                #{selected.id} — {m.label}
              </p>
              <p className="text-xs text-gray-600 mt-0.5 truncate">
                {selected.crop} · {selected.weight} · {selected.farmer}
              </p>
            </div>
            <span className={`shrink-0 font-heading font-bold text-sm md:text-lg ${m.text}`}>
              {selected.price}
            </span>
          </div>

          {/* Timeline */}
          <div className="card">
            <h3 className="font-heading font-semibold mb-5 md:mb-6 text-primary text-sm md:text-base">
              {t("timeline")}
            </h3>
            <div className="w-full overflow-x-auto pb-4 scrollbar-hide">
              <div className="relative flex justify-between items-start min-w-[480px] max-w-2xl mx-auto px-2">
                {/* Horizontal Connecting Line */}
                <div className="absolute top-[7px] md:top-[9px] left-[10%] right-[10%] h-0.5 bg-gray-200 z-0"></div>

                {selected.timeline.map((item, idx) => (
                  <div key={idx} className={`relative flex flex-col items-center flex-1 z-10 ${item.done ? "opacity-100" : "opacity-40"}`}>
                    {item.done ? (
                      <div className="bg-white rounded-full mb-2 shadow-sm">
                        <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-secondary" />
                      </div>
                    ) : (
                      <div className="w-4 h-4 md:w-5 md:h-5 rounded-full border-2 border-gray-300 bg-white mb-2 shrink-0"></div>
                    )}
                    <div className="text-center px-1">
                      <p className={`text-[10px] md:text-xs font-semibold leading-tight ${item.done ? "text-gray-800" : "text-gray-400"}`}>
                        {item.label}
                      </p>
                      <p className="text-[9px] md:text-[10px] text-gray-400 mt-1">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Live Map */}
          {selected.status !== "pending" && (
            <div className="card flex flex-col">
              <h3 className="font-heading font-semibold mb-3 md:mb-4 text-primary text-sm md:text-base">
                {t("liveTracking")}
              </h3>
              <MapTracker shipmentId={selected.id} height="280px" />
            </div>
          )}

          {/* Bottom grid: Details + Confirmation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">

            {/* Shipment Details */}
            <div className="card">
              <h3 className="font-heading font-semibold mb-3 md:mb-4 text-primary text-sm md:text-base">
                {t("orderDetails")}
              </h3>
              <div className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
                <Detail label={t("labelCrop")} value={selected.crop} />
                <Detail label={t("labelWeight")} value={selected.weight} />
                <Detail label={t("labelFrom")} value={selected.from} />
                <Detail label={t("labelTo")} value={selected.to} />
                <Detail label={t("labelVehicle")} value={selected.vehicle} />
                <Detail label={t("labelDispatched")} value={selected.dispatchDate} />
                <Detail label={t("labelEta")} value={selected.etaFull} />
              </div>

              {/* Contact info */}
              <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
                <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-gray-400">{t("contact")}</p>
                <div className="flex items-center gap-2 text-xs md:text-sm">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-gray-600">{t("labelBuyer")}: {selected.farmerPhone}</span>
                </div>
                <div className="flex items-center gap-2 text-xs md:text-sm">
                  <Truck className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-gray-600">{t("labelDriver")}: {selected.driver} ({selected.driverPhone})</span>
                </div>
              </div>
            </div>

            {/* Confirmation & Rating */}
            <div className="flex flex-col gap-5 md:gap-6">              {/* Confirmation & Rating — for in-transit & delivered orders */}
              {(selected.status === "in-transit" || selected.status === "delivered") && (
                <div className="card space-y-3 md:space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-heading font-semibold text-primary text-sm md:text-base">
                      {t("rateConfirm")}
                    </h3>
                    {selected.status === "delivered" && (
                      <span className="flex items-center gap-1 text-xs text-green-600 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {t("confirmed")}
                      </span>
                    )}
                  </div>

                  {/* Interactive star rating */}
                  <div className="flex flex-col items-center gap-2 py-2">
                    <p className="text-xs text-gray-500">{t("rateDelivery")}</p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-6 h-6 md:w-7 md:h-7 transition-colors ${
                              star <= (hoverRating || rating)
                                ? "text-accent fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    {rating > 0 && (
                      <p className="text-[10px] text-gray-400">
                        {ratingLabels[rating]}
                      </p>
                    )}
                  </div>

                  {selected.status === "in-transit" ? (
                    showConfirm ? (
                      <div className="bg-amber-50 p-3 md:p-4 rounded-lg border border-amber-200 space-y-3 shadow-inner">
                        <p className="text-xs md:text-sm text-amber-800 font-semibold text-center leading-relaxed">
                          {t("confirmPrompt")}
                        </p>
                        <div className="flex gap-2.5">
                          <button
                            onClick={() => setShowConfirm(false)}
                            className="flex-1 bg-white border border-gray-300 text-gray-700 py-2.5 rounded-lg text-xs md:text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm"
                          >
                            {t("cancel")}
                          </button>
                          <button
                            onClick={confirmDelivery}
                            className="flex-1 bg-green-600 border border-green-600 text-white py-2.5 rounded-lg text-xs md:text-sm font-bold hover:bg-green-700 transition-colors shadow-sm"
                          >
                            {t("yesConfirm")}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={handleAcknowledgeClick}
                        className="btn-primary w-full text-xs md:text-sm min-h-[42px] md:min-h-[48px] gap-2"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        {t("acknowledgeDelivery")}
                      </button>
                    )
                  ) : (
                    <div className="text-center py-2">
                      <p className="text-sm font-semibold text-green-600">{t("deliveryAcknowledged")}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{t("thankYou")}</p>
                    </div>
                  )}

                  <button className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-500 hover:text-primary transition-colors py-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    {t("reportIssue")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ───────────────────────────────────────── */

function KpiCard({ icon: Icon, label, value, color, bg, small }) {
  return (
    <div className="card flex items-center gap-2.5 md:gap-4">
      <div className={`${bg} rounded-lg md:rounded-xl p-2 md:p-3`}>
        <Icon className={`w-4 h-4 md:w-6 md:h-6 ${color}`} />
      </div>
      <div className="min-w-0">
        <p className={`font-bold font-heading truncate ${small ? "text-sm md:text-lg" : "text-lg md:text-2xl"}`}>
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
      <span className="font-semibold w-20 md:w-24 shrink-0 text-gray-600">{label}:</span>
      <span className="text-gray-800 truncate">{value}</span>
    </p>
  );
}
