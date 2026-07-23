import type { TeamMember } from "@/lib/cms/team";
import type { TeamMemberInput } from "@/app/admin/(dashboard)/team/actions";

export function teamMemberToExcelRow(m: TeamMember) {
  return {
    Slug: m.slug,
    Nama: m.name,
    Jabatan: m.position,
    "Bio Singkat": m.bio,
    "Bio Lengkap": m.long_bio,
    Email: m.email,
    Instagram: m.socials?.instagram ?? "",
    Facebook: m.socials?.facebook ?? "",
    Twitter: m.socials?.twitter ?? "",
    Status: m.status,
    Urutan: m.sort_order,
  };
}

export function excelRowToTeamMemberInput(row: Record<string, string>): TeamMemberInput | null {
  const slug = row["Slug"]?.trim();
  const name = row["Nama"]?.trim();
  if (!slug || !name) return null;

  const socials: TeamMemberInput["socials"] = {};
  if (row["Instagram"]?.trim()) socials.instagram = row["Instagram"].trim();
  if (row["Facebook"]?.trim()) socials.facebook = row["Facebook"].trim();
  if (row["Twitter"]?.trim()) socials.twitter = row["Twitter"].trim();

  const rawStatus = row["Status"]?.trim().toLowerCase();
  const status = rawStatus === "published" || rawStatus === "pending" ? rawStatus : "draft";

  return {
    slug,
    name,
    position: row["Jabatan"]?.trim() ?? "",
    bio: row["Bio Singkat"]?.trim() ?? "",
    long_bio: row["Bio Lengkap"]?.trim() ?? "",
    email: row["Email"]?.trim() ?? "",
    socials,
    status,
    sort_order: Number(row["Urutan"]) || 0,
  };
}
