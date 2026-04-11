import { AlertCircle, FileText, Package, Truck, Clock, AlertTriangle } from "lucide-react";
import MapTracker from "../components/MapTracker";
import { useShipments } from "../context/ShipmentContext";
import { useI18n } from "../i18n/I18nContext";

export default function AdminDashboard() {
  const { shipments } = useShipments();
  const { t } = useI18n();

  const inTransit = shipments.filter((s) => s.status === "in-transit").length;
  const delayed   = shipments.filter((s) => s.status === "delayed").length;
  const delivered  = shipments.filter((s) => s.status === "delivered").length;

  const STATUS_META = {
    "in-transit": { label: t("statusInTransit"), bg: "bg-green-100", text: "text-green-700" },
    delayed:      { label: t("statusDelayed"),   bg: "bg-red-100",   text: "text-red-700" },
    delivered:    { label: t("statusDelivered"),  bg: "bg-blue-100",  text: "text-blue-700" },
    pending:      { label: t("statusPending"),    bg: "bg-amber-100", text: "text-amber-700" },
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex justify-between items-start sm:items-center flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-text">{t("adminTitle")}</h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">{t("adminSubtitle")}</p>
        </div>
        <button className="btn-primary flex gap-2 text-xs md:text-sm min-h-[42px] md:min-h-[48px]">
          <FileText className="w-4 h-4" />
          {t("exportPdf")}
        </button>
      </div>

      {/* ── KPI Cards ───────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <KpiCard icon={Package}       label={t("kpiTotalShipments")} value={shipments.length} color="text-primary"   bg="bg-green-50" />
        <KpiCard icon={Truck}         label={t("kpiInTransit")}      value={inTransit}        color="text-blue-600"  bg="bg-blue-50" />
        <KpiCard icon={AlertTriangle} label={t("kpiDelayed")}        value={delayed}          color="text-red-600"   bg="bg-red-50" />
        <KpiCard icon={Clock}         label={t("kpiDelivered")}      value={delivered}         color="text-green-600" bg="bg-green-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">
        {/* Global Map */}
        <div className="card lg:col-span-2 flex flex-col">
          <h3 className="font-heading font-semibold mb-3 md:mb-4 text-primary text-sm md:text-base">{t("globalMapRoute")}</h3>
          <MapTracker showAllShipments={true} height="300px" />
        </div>

        {/* Dispute Resolution Panel */}
        <div className="card flex flex-col">
          <h3 className="font-heading font-semibold mb-3 md:mb-4 text-primary text-sm md:text-base">{t("disputeResolution")}</h3>
          <div className="space-y-3 md:space-y-4 flex-1">
             <div className="p-3 md:p-4 bg-gray-50 rounded-lg border border-gray-100">
               <p className="text-xs md:text-sm font-semibold mb-1">{t("logDiff")}</p>
               <p className="text-[10px] md:text-xs text-gray-500">{t("logDiffDesc")}</p>
             </div>
             <div className="h-16 md:h-20 bg-gray-100 rounded animate-pulse"></div>
             <div className="h-16 md:h-20 bg-gray-100 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Monitoring Table */}
        <div className="card lg:col-span-3">
          <h3 className="font-heading font-semibold mb-3 md:mb-4 text-primary text-sm md:text-base">{t("liveMonitoring")}</h3>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 px-4 font-semibold text-sm">{t("colTrackingId")}</th>
                  <th className="py-3 px-4 font-semibold text-sm">{t("colStatus")}</th>
                  <th className="py-3 px-4 font-semibold text-sm">{t("colEta")}</th>
                  <th className="py-3 px-4 font-semibold text-sm">{t("colAlerts")}</th>
                </tr>
              </thead>
              <tbody>
                {shipments.map((s, idx) => {
                  const m = STATUS_META[s.status] ?? STATUS_META.pending;
                  const hasAlert = s.status === "delayed";
                  return (
                    <tr key={s.id} className={idx < shipments.length - 1 ? "border-b border-gray-100" : ""}>
                      <td className={`py-3 px-4 font-medium ${hasAlert ? "border-l-4 border-error" : ""}`}>#{s.id}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${m.bg} ${m.text}`}>{m.label}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{s.eta}</td>
                      <td className="py-3 px-4">
                        {hasAlert ? (
                          <span className="flex items-center gap-1 text-error text-sm font-semibold">
                            <AlertCircle className="w-4 h-4" /> {t("alertExceed")}
                          </span>
                        ) : (
                          t("none")
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="md:hidden space-y-3">
            {shipments.map((s) => {
              const m = STATUS_META[s.status] ?? STATUS_META.pending;
              const hasAlert = s.status === "delayed";
              return (
                <div key={s.id} className={`p-3 rounded-lg border ${hasAlert ? "border-l-4 border-error border-red-100 bg-red-50/30" : "border-gray-100 bg-gray-50/50"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs">#{s.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${m.bg} ${m.text}`}>{m.label}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{t("eta")}: {s.eta}</span>
                    {hasAlert && (
                      <span className="flex items-center gap-1 text-error font-semibold">
                        <AlertCircle className="w-3 h-3" /> {t("alertExceed")}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

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
