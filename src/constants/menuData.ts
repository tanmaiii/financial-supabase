import {
  ArrowLeftRight,
  LayoutDashboard,
  PiggyBank,
  Receipt,
  Settings,
} from "lucide-react";
import { PATHS } from "./path";

interface MenuItem {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  href: string;
}

const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: "dashboard", href: PATHS.DASHBOARD },
  { icon: ArrowLeftRight, label: "transactions", href: PATHS.TRANSACTIONS },
  // { icon: TrendingUp, label: "income", href: PATHS.INCOME },
  { icon: Receipt, label: "taxes", href: PATHS.TAXES },
  { icon: PiggyBank, label: "savings", href: PATHS.SAVINGS },
  { icon: Settings, label: "settings", href: PATHS.SETTINGS },
];

export default menuItems;
