import {
  Car,
  HelpCircle,
  Home,
  ShoppingBag,
  Utensils,
  Zap,
} from "lucide-react";
import React from "react";

export enum EnumActivityCategory {
  accommodation = 1,
  transportation = 2,
  food = 3,
  activity = 4,
  shopping = 5,
  other = 6,
}

export const EnumLabelsActivityCategory: Record<EnumActivityCategory, string> =
  {
    [EnumActivityCategory.accommodation]:
      "schedule.activity.categoryOptions.accommodation",
    [EnumActivityCategory.transportation]:
      "schedule.activity.categoryOptions.transportation",
    [EnumActivityCategory.food]: "schedule.activity.categoryOptions.food",
    [EnumActivityCategory.activity]:
      "schedule.activity.categoryOptions.activity",
    [EnumActivityCategory.shopping]:
      "schedule.activity.categoryOptions.shopping",
    [EnumActivityCategory.other]: "schedule.activity.categoryOptions.other",
  };

export const EnumIconsActivityCategory: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  [EnumActivityCategory.accommodation]: Home,
  [EnumActivityCategory.transportation]: Car,
  [EnumActivityCategory.food]: Utensils,
  [EnumActivityCategory.activity]: Zap,
  [EnumActivityCategory.shopping]: ShoppingBag,
  [EnumActivityCategory.other]: HelpCircle,
};

export const EnumColorsActivityCategory: Record<EnumActivityCategory, string> =
  {
    [EnumActivityCategory.accommodation]: "bg-purple-100 text-purple-800",
    [EnumActivityCategory.transportation]: "bg-blue-100 text-blue-800",
    [EnumActivityCategory.food]: "bg-green-100 text-green-800",
    [EnumActivityCategory.activity]: "bg-yellow-100 text-yellow-800",
    [EnumActivityCategory.shopping]: "bg-pink-100 text-pink-800",
    [EnumActivityCategory.other]: "bg-gray-100 text-gray-800",
  };
