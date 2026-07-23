export type NavItem = {
  id: string;
  label: string;
  href: string;
  module: string;
  icon: string;
  parentId: string | null;
  showBottomNav: boolean;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};
