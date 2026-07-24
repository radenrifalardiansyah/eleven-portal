import type { SelectOption } from "@/components/admin/SearchableSelect";

export function getStatusOptions(canPublish: boolean): SelectOption[] {
  return [
    { value: "draft", label: "Draft" },
    { value: "pending", label: "Ajukan Review" },
    ...(canPublish ? [{ value: "published", label: "Published" }] : []),
  ];
}
