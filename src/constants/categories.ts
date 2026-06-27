import type { Category } from "@/types";

export const CATEGORIES: Category[] = [
  "Entertainment",
  "Communication",
  "Education",
  "Productivity",
  "Gaming",
  "Social Media",
  "Other",
];

export const CATEGORY_COLORS: Record<Category, string> = {
  Entertainment: "#3B82F6",
  Communication: "#10B981",
  Education: "#8B5CF6",
  Productivity: "#F59E0B",
  Gaming: "#EF4444",
  "Social Media": "#EC4899",
  Other: "#64748B",
};
