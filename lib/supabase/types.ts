import type { CurrencyCode } from "@/lib/currency";
import type { ProductPackage } from "@/lib/cms/product-packages";

// Roles are master data (see the `roles` table / lib/cms/roles.ts) and can grow at
// runtime via the Role admin page, so this stays a plain string rather than a
// literal union — the actual valid set is enforced by the Postgres `user_role` enum.
export type UserRole = string;
export type ContentStatus = "draft" | "pending" | "published";

type ContentRow = {
  id: string;
  slug: string;
  status: ContentStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
};

type Table<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<
        {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          position: string | null;
          bio: string | null;
          theme_preference: string;
          role: UserRole;
          created_at: string;
          updated_at: string;
        },
        {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          position?: string | null;
          bio?: string | null;
          theme_preference?: string;
          role?: UserRole;
        }
      >;
      products: Table<
        ContentRow & {
          name: string;
          service_id: string;
          price_currency: CurrencyCode;
          packages: ProductPackage[];
          description: string;
          long_description: string;
          features: string[];
          gallery: string[];
          image: string;
        }
      >;
      services: Table<
        ContentRow & {
          title: string;
          description: string;
          long_description: string;
          benefits: string[];
          icon: string;
          gallery: string[];
        }
      >;
      stories: Table<
        ContentRow & {
          title: string;
          label: string;
          label_color: "yellow" | "blue";
          description: string;
          content: string[];
          image: string;
          author: string;
          author_image: string;
          date: string;
        }
      >;
      team_members: Table<
        ContentRow & {
          name: string;
          position: string;
          bio: string;
          long_bio: string;
          email: string;
          photo_url: string | null;
          socials: { instagram?: string; facebook?: string; twitter?: string };
        }
      >;
      projects: Table<
        ContentRow & {
          title: string;
          product_id: string | null;
          client_id: string | null;
          year: string;
          image: string;
          href: string;
          description: string;
          long_description: string;
          services: string[];
        }
      >;
      testimonial_clients: Table<
        ContentRow & {
          name: string;
          logo: string;
          industry: string;
          website: string;
          description: string;
          contact_name: string;
          contact_position: string;
          contact_email: string;
          contact_phone: string;
          testimonial_quote: string;
          testimonial_author: string;
          testimonial_rating: number | null;
        }
      >;
      page_sections: Table<{
        id: string;
        page_key: string;
        section_key: string;
        content: Record<string, unknown>;
        updated_at: string;
      }>;
      site_settings: Table<{
        key: string;
        value: Record<string, unknown>;
      }>;
      menu_groups: Table<{
        id: string;
        label: string;
        sort_order: number;
      }>;
      menu_items: Table<{
        id: string;
        group_id: string;
        parent_id: string | null;
        label: string;
        href: string | null;
        icon: string;
        module_key: string;
        sort_order: number;
        always_visible: boolean;
        show_bottom_nav: boolean;
        show_on_portal: boolean;
        show_section_on_portal: boolean;
        portal_href: string | null;
        portal_match_path: string | null;
        portal_label: string | null;
        created_at: string;
        updated_at: string;
      }>;
      role_permissions: Table<
        {
          role: UserRole;
          module_key: string;
          can_view: boolean;
          can_edit: boolean;
          can_delete: boolean;
          can_approve: boolean;
          can_publish: boolean;
        },
        { role: UserRole; module_key: string } & Partial<{
          can_view: boolean;
          can_edit: boolean;
          can_delete: boolean;
          can_approve: boolean;
          can_publish: boolean;
        }>
      >;
      modules: Table<{
        key: string;
        label: string;
        sort_order: number;
        created_at: string;
        updated_at: string;
      }>;
      roles: Table<{
        key: UserRole;
        label: string;
        icon: string;
        sort_order: number;
        is_super_admin: boolean;
        is_active: boolean;
        created_at: string;
        updated_at: string;
      }>;
      login_history: Table<
        {
          id: string;
          user_id: string;
          user_agent: string | null;
          created_at: string;
        },
        { user_id: string; user_agent?: string | null }
      >;
      analytics_events: Table<
        {
          id: string;
          event_type: "pageview" | "menu_click";
          path: string;
          label: string | null;
          href: string | null;
          referrer: string | null;
          device_type: "desktop" | "mobile" | "tablet";
          browser: string | null;
          session_id: string;
          user_agent: string | null;
          created_at: string;
        },
        {
          event_type: "pageview" | "menu_click";
          path: string;
          label?: string | null;
          href?: string | null;
          referrer?: string | null;
          device_type: "desktop" | "mobile" | "tablet";
          browser?: string | null;
          session_id: string;
          user_agent?: string | null;
        }
      >;
    };
    Views: Record<string, never>;
    Functions: {
      add_role_enum_value: {
        Args: { p_key: string };
        Returns: void;
      };
      upsert_module: {
        Args: { p_key: string; p_label: string };
        Returns: void;
      };
      analytics_kpis: {
        Args: { p_since: string };
        Returns: { total_pageviews: number; unique_visitors: number; total_menu_clicks: number }[];
      };
      analytics_timeseries: {
        Args: { p_granularity: "day" | "week" | "month" | "year"; p_since: string };
        Returns: { bucket: string; pageviews: number; unique_visitors: number }[];
      };
      analytics_device_breakdown: {
        Args: { p_since: string };
        Returns: { device_type: string; total: number }[];
      };
      analytics_browser_breakdown: {
        Args: { p_since: string };
        Returns: { browser: string; total: number }[];
      };
      analytics_top_pages: {
        Args: { p_since: string; p_limit: number };
        Returns: { path: string; total: number }[];
      };
      analytics_top_menu_clicks: {
        Args: { p_since: string; p_limit: number };
        Returns: { label: string; total: number }[];
      };
      analytics_top_referrers: {
        Args: { p_since: string; p_limit: number };
        Returns: { referrer_host: string; total: number }[];
      };
    };
  };
};
