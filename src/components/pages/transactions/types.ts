import { LucideIcon } from "lucide-react";

export interface Transaction {
  id: string;
  date: string;
  merchant: string;
  description: string;
  icon: LucideIcon;
  category: {
    name: string;
    color: string;
    editable: boolean;
    icon: string;
  };
  account: string;
  status: "verified" | "review";
  amount: number;
}
