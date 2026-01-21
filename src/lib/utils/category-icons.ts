import {
  Wifi,
  Clapperboard,
  Dumbbell,
  Code2,
  Carrot,
  DollarSign,
  Home,
  Car,
  Shield,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";

/**
 * Map category names to their corresponding icons
 */
export const getCategoryIcon = (categoryName: string): LucideIcon => {
  const iconMap: Record<string, LucideIcon> = {
    // English
    "Utilities & Bills": Wifi,
    Internet: Wifi,
    Entertainment: Clapperboard,
    "Health & Wellness": Dumbbell,
    Software: Code2,
    "Food & Dining": Carrot,
    Transportation: Car,
    Housing: Home,
    Insurance: Shield,
    Education: GraduationCap,

    // Vietnamese
    "Tiện ích & Hóa đơn": Wifi,
    "Giải trí": Clapperboard,
    "Sức khỏe": Dumbbell,
    "Phần mềm": Code2,
    "Ăn uống": Carrot,
    "Giao thông": Car,
    "Nhà ở": Home,
    "Bảo hiểm": Shield,
    "Giáo dục": GraduationCap,
  };

  return iconMap[categoryName] || DollarSign;
};

/**
 * Get icon background and text color classes for a category
 */
export const getCategoryIconStyle = (categoryName: string) => {
  const styleMap: Record<string, { bg: string; color: string }> = {
    // English
    "Utilities & Bills": {
      bg: "bg-cyan-100 dark:bg-cyan-900",
      color: "text-cyan-600 dark:text-cyan-400",
    },
    Internet: {
      bg: "bg-cyan-100 dark:bg-cyan-900",
      color: "text-cyan-600 dark:text-cyan-400",
    },
    Entertainment: {
      bg: "bg-red-100 dark:bg-red-900",
      color: "text-red-600 dark:text-red-400",
    },
    "Health & Wellness": {
      bg: "bg-blue-100 dark:bg-blue-900",
      color: "text-blue-600 dark:text-blue-400",
    },
    Software: {
      bg: "bg-purple-100 dark:bg-purple-900",
      color: "text-purple-600 dark:text-purple-400",
    },
    "Food & Dining": {
      bg: "bg-green-100 dark:bg-green-900",
      color: "text-green-600 dark:text-green-400",
    },
    Transportation: {
      bg: "bg-orange-100 dark:bg-orange-900",
      color: "text-orange-600 dark:text-orange-400",
    },
    Housing: {
      bg: "bg-amber-100 dark:bg-amber-900",
      color: "text-amber-600 dark:text-amber-400",
    },
    Insurance: {
      bg: "bg-indigo-100 dark:bg-indigo-900",
      color: "text-indigo-600 dark:text-indigo-400",
    },
    Education: {
      bg: "bg-pink-100 dark:bg-pink-900",
      color: "text-pink-600 dark:text-pink-400",
    },

    // Vietnamese
    "Tiện ích & Hóa đơn": {
      bg: "bg-cyan-100 dark:bg-cyan-900",
      color: "text-cyan-600 dark:text-cyan-400",
    },
    "Giải trí": {
      bg: "bg-red-100 dark:bg-red-900",
      color: "text-red-600 dark:text-red-400",
    },
    "Sức khỏe": {
      bg: "bg-blue-100 dark:bg-blue-900",
      color: "text-blue-600 dark:text-blue-400",
    },
    "Phần mềm": {
      bg: "bg-purple-100 dark:bg-purple-900",
      color: "text-purple-600 dark:text-purple-400",
    },
    "Ăn uống": {
      bg: "bg-green-100 dark:bg-green-900",
      color: "text-green-600 dark:text-green-400",
    },
    "Giao thông": {
      bg: "bg-orange-100 dark:bg-orange-900",
      color: "text-orange-600 dark:text-orange-400",
    },
    "Nhà ở": {
      bg: "bg-amber-100 dark:bg-amber-900",
      color: "text-amber-600 dark:text-amber-400",
    },
    "Bảo hiểm": {
      bg: "bg-indigo-100 dark:bg-indigo-900",
      color: "text-indigo-600 dark:text-indigo-400",
    },
    "Giáo dục": {
      bg: "bg-pink-100 dark:bg-pink-900",
      color: "text-pink-600 dark:text-pink-400",
    },
  };

  return (
    styleMap[categoryName] || {
      bg: "bg-gray-100 dark:bg-gray-800",
      color: "text-gray-600 dark:text-gray-400",
    }
  );
};

/**
 * Category icon configuration type
 */
export interface CategoryIconConfig {
  icon: LucideIcon;
  bg: string;
  color: string;
}

/**
 * Get complete icon configuration for a category
 */
export const getCategoryIconConfig = (
  categoryName: string,
): CategoryIconConfig => {
  const icon = getCategoryIcon(categoryName);
  const style = getCategoryIconStyle(categoryName);

  return {
    icon,
    ...style,
  };
};
