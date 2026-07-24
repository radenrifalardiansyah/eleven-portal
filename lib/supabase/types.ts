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
          role: UserRole;
          created_at: string;
          updated_at: string;
        },
        { id: string; full_name?: string | null; avatar_url?: string | null; role?: UserRole }
      >;
      products: Table<
        ContentRow & {
          name: string;
          category: string;
          price: string;
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
          socials: { instagram?: string; facebook?: string; twitter?: string };
        }
      >;
      projects: Table<
        ContentRow & {
          title: string;
          category: string;
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
        href: string;
        icon: string;
        module_key: string;
        sort_order: number;
        always_visible: boolean;
        show_bottom_nav: boolean;
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
    };
    Views: Record<string, never>;
    Functions: {
      add_role_enum_value: {
        Args: { p_key: string };
        Returns: void;
      };
    };
  };
};
