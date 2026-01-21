import { EnumActivityCategory } from "@/enum/enum_activityCategory";

interface ObjectColor {
  text: string;
  secondary: string;
  bg: string;
}

export function utils_color(name: string): ObjectColor {
  const colorSchema: Record<string, ObjectColor> = {
    red: {
      text: "text-red-500",
      secondary: "text-red-400",
      bg: "bg-red-600/10 dark:bg-red-600/20",
    },
    green: {
      text: "text-green-500",
      secondary: "text-green-400",
      bg: "bg-green-600/10 dark:bg-green-600/20",
    },
    yellow: {
      text: "text-yellow-500",
      secondary: "text-yellow-400",
      bg: "bg-yellow-600/10 dark:bg-yellow-600/20",
    },
    orange: {
      text: "text-orange-500",
      secondary: "text-orange-400",
      bg: "bg-orange-600/10 dark:bg-orange-600/20",
    },
    purple: {
      text: "text-purple-500",
      secondary: "text-purple-400",
      bg: "bg-purple-600/10 dark:bg-purple-600/20",
    },
    slate: {
      text: "text-slate-500",
      secondary: "text-slate-400",
      bg: "bg-slate-600/10 dark:bg-slate-600/20",
    },
  };

  return colorSchema[name] || colorSchema["red"];
}

export function utils_categoryColor(category: string | number): ObjectColor {
  const categoryStringToEnum: Record<string, EnumActivityCategory> = {
    Accommodation: EnumActivityCategory.accommodation,
    Transportation: EnumActivityCategory.transportation,
    Food: EnumActivityCategory.food,
    Activity: EnumActivityCategory.activity,
    Shopping: EnumActivityCategory.shopping,
    Other: EnumActivityCategory.other,
  };

  let enumValue: EnumActivityCategory;
  if (typeof category === 'string') {
    enumValue = categoryStringToEnum[category] || EnumActivityCategory.other;
  } else {
    enumValue = category;
  }

  const categoryColorMap: Record<string, string> = {
    [EnumActivityCategory.accommodation]: "orange",
    [EnumActivityCategory.transportation]: "blue",
    [EnumActivityCategory.food]: "green",
    [EnumActivityCategory.activity]: "purple",
    [EnumActivityCategory.shopping]: "yellow",
    [EnumActivityCategory.other]: "slate",
  };
  const colorName = categoryColorMap[enumValue] || "red";
  return utils_color(colorName);
}
