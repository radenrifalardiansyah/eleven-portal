import { Package, Layers, Newspaper, Users, Briefcase, Quote } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireModule } from "@/lib/auth/session";
import StatCard from "@/components/admin/StatCard";

export default async function AdminDashboardPage() {
  const profile = await requireModule("dashboard", "view");
  const supabase = await createClient();

  const [products, services, stories, team, projects, testimonials] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("services").select("*", { count: "exact", head: true }),
    supabase.from("stories").select("*", { count: "exact", head: true }),
    supabase.from("team_members").select("*", { count: "exact", head: true }),
    supabase.from("projects").select("*", { count: "exact", head: true }),
    supabase.from("testimonial_clients").select("*", { count: "exact", head: true }),
  ]);

  const stats: Array<{ label: string; value: number; icon: typeof Package; accent?: "blue" | "yellow" }> = [
    { label: "Products", value: products.count ?? 0, icon: Package },
    { label: "Services", value: services.count ?? 0, icon: Layers, accent: "yellow" },
    { label: "Stories", value: stories.count ?? 0, icon: Newspaper },
    { label: "Team Members", value: team.count ?? 0, icon: Users, accent: "yellow" },
    { label: "Case Studies", value: projects.count ?? 0, icon: Briefcase },
    { label: "Testimonials", value: testimonials.count ?? 0, icon: Quote, accent: "yellow" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-ink-900">
          Halo, {profile.fullName ?? profile.email} 👋
        </h1>
        <p className="mt-1 text-sm text-ink-500">Ringkasan konten portal Eleven Digital.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>
    </div>
  );
}
