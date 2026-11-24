import KpiCard from "../../../../components/KpiCard";
import { Layers, CalendarRange, CheckCircle2, FileEdit } from "lucide-react";

export default function DashboardMetricsSection({ metrics, loading = false }) {
  const {
    totalServices = 0,
    totalPlans = 0,
    published = 0,
    draft = 0,
  } = metrics || {};

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
      <KpiCard
        title="Total Services"
        value={totalServices}
        icon={Layers}
        variant="slate"
        subtitle="Catalog services"
        loading={loading}
      />

      <KpiCard
        title="Duration Plans"
        value={totalPlans}
        icon={CalendarRange}
        variant="purple"
        subtitle="Tier configurations"
        loading={loading}
      />

      <KpiCard
        title="Storefront Published"
        value={published}
        icon={CheckCircle2}
        variant="emerald"
        subtitle="Live on website"
        loading={loading}
      />

      <KpiCard
        title="Draft / Inactive"
        value={draft}
        icon={FileEdit}
        variant="amber"
        subtitle="Pending review or hidden"
        loading={loading}
      />
    </div>
  );
}
