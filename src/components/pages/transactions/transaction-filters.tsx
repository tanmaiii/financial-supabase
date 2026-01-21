import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Clock, Filter, ChevronDown } from "lucide-react";

interface TransactionFiltersProps {
  onDateFilterChange?: (value: string) => void;
  onCategoryFilterChange?: (value: string) => void;
  onAmountFilterChange?: (value: string) => void;
}

export default function TransactionFilters({
  onDateFilterChange,
  onCategoryFilterChange,
  onAmountFilterChange,
}: TransactionFiltersProps) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="gap-2 bg-card hover:bg-secondary/80 transition-colors"
          >
            <Clock className="w-4 h-4" />
            Last 30 Days
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => onDateFilterChange?.("7days")}>
            Last 7 Days
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDateFilterChange?.("30days")}>
            Last 30 Days
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDateFilterChange?.("90days")}>
            Last 90 Days
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDateFilterChange?.("year")}>
            This Year
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="gap-2 bg-card hover:bg-secondary/80 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Category
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => onCategoryFilterChange?.("all")}>
            All Categories
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onCategoryFilterChange?.("food-dining")}
          >
            Food & Dining
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onCategoryFilterChange?.("business-travel")}
          >
            Business Travel
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onCategoryFilterChange?.("revenue")}>
            Revenue
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="gap-2 bg-card hover:bg-secondary/80 transition-colors"
          >
            Amount
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => onAmountFilterChange?.("all")}>
            All Amounts
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAmountFilterChange?.("under-100")}>
            Under $100
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAmountFilterChange?.("100-1000")}>
            $100 - $1000
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAmountFilterChange?.("over-1000")}>
            Over $1000
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex items-center gap-2 ml-2">
        <Badge
          variant="outline"
          className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-500/20 transition-colors cursor-pointer"
        >
          Tax Deductible
        </Badge>
        <Badge
          variant="outline"
          className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 hover:bg-amber-500/20 transition-colors cursor-pointer"
        >
          Needs Review
        </Badge>
      </div>
    </div>
  );
}
