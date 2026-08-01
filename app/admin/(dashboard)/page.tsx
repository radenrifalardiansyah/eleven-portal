import { Package, Layers, Newspaper, Users, Briefcase, Quote, Eye, CalendarClock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireModule } from "@/lib/auth/session";
import StatCard from "@/components/admin/StatCard";
import AnalyticsSection from "@/components/admin/dashboard/AnalyticsSection";
import DonutChart from "@/components/admin/dashboard/DonutChart";
import { CONTENT_TYPE_COLORS, CONTENT_TYPE_LABELS } from "@/lib/analytics/chart-colors";
import { getPortalAnalytics, getOverviewKpi } from "./actions";

export default async function AdminDashboardPage() {
  const profile = await requireModule("dashboard", "view");
  const supabase = await createClient();

  const [products, services, stories, team, projects, testimonials, analytics, overview] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("services").select("*", { count: "exact", head: true }),
    supabase.from("stories").select("*", { count: "exact", head: true }),
    supabase.from("team_members").select("*", { count: "exact", head: true }),
    supabase.from("projects").select("*", { count: "exact", head: true }),
    supabase.from("testimonial_clients").select("*", { count: "exact", head: true }),
    getPortalAnalytics("day"),
    getOverviewKpi(),
  ]);

  const stats: Array<{ key: string; label: string; value: number; icon: typeof Package; accent?: "blue" | "yellow" }> = [
    { key: "products", label: "Products", value: products.count ?? 0, icon: Package },
    { key: "services", label: "Services", value: services.count ?? 0, icon: Layers, accent: "yellow" },
    { key: "stories", label: "Stories", value: stories.count ?? 0, icon: Newspaper },
    { key: "team", label: "Team Members", value: team.count ?? 0, icon: Users, accent: "yellow" },
    { key: "projects", label: "Case Studies", value: projects.count ?? 0, icon: Briefcase },
    { key: "testimonials", label: "Client", value: testimonials.count ?? 0, icon: Quote, accent: "yellow" },
  ];

  const trackingSinceLabel = overview.trackingSince
    ? new Date(overview.trackingSince).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-ink-900">
          Halo, {profile.fullName ?? profile.email} 👋
        </h1>
        <p className="mt-1 text-sm text-ink-500">Ringkasan konten portal Eleven Digital.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          label="Total Kunjungan"
          value={overview.totalPageviewsAllTime}
          icon={Eye}
          subtitle={
            trackingSinceLabel
              ? `Akumulasi seluruh page view sejak ${trackingSinceLabel} (bukan visitor unik)`
              : "Akumulasi seluruh page view (bukan visitor unik)"
          }
        />
        <StatCard
          label="Kunjungan Hari Ini"
          value={overview.todayPageviews}
          icon={CalendarClock}
          accent="yellow"
          subtitle="Page view yang tercatat hari ini, dihitung ulang mulai 00:00"
          trend={{ pct: overview.trendPct, label: "dibanding kemarin" }}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map(({ key, ...s }) => (
            <StatCard key={key} {...s} />
          ))}
        </div>
        <DonutChart
          title="Distribusi Konten"
          centerLabel="Total"
          items={stats.map((s) => ({ key: s.key, label: CONTENT_TYPE_LABELS[s.key] ?? s.label, value: s.value }))}
          colors={CONTENT_TYPE_COLORS}
        />
      </div>

      <AnalyticsSection initialGranularity="day" initialData={analytics} />
    </div>
  );
}
