import React from "react";
import { Calendar, DollarSign, Tag, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AdvancedFiltersProps {
  onDateRangeChange?: (from: string, to: string) => void;
  onCategoryChange?: (categoryId: string) => void;
  onAccountChange?: (accountId: string) => void;
  onAmountRangeChange?: (min?: number, max?: number) => void;
  onTypeChange?: (type: "income" | "expense" | "transfer" | "") => void;
  onSearchChange?: (search: string) => void;
  categories?: Array<{ id: string; name: string }>;
  accounts?: Array<{ id: string; name: string }>;
}

export default function AdvancedFilters({
  onDateRangeChange,
  onCategoryChange,
  onAccountChange,
  onAmountRangeChange,
  onTypeChange,
  onSearchChange,
  categories = [],
  accounts = [],
}: AdvancedFiltersProps) {
  const [dateFrom, setDateFrom] = React.useState("");
  const [dateTo, setDateTo] = React.useState("");
  const [minAmount, setMinAmount] = React.useState("");
  const [maxAmount, setMaxAmount] = React.useState("");
  const [searchTerm, setSearchTerm] = React.useState("");

  const handleDateFromChange = (value: string) => {
    setDateFrom(value);
    if (onDateRangeChange && value && dateTo) {
      onDateRangeChange(value, dateTo);
    }
  };

  const handleDateToChange = (value: string) => {
    setDateTo(value);
    if (onDateRangeChange && dateFrom && value) {
      onDateRangeChange(dateFrom, value);
    }
  };

  const handleMinAmountChange = (value: string) => {
    setMinAmount(value);
    const min = value ? parseFloat(value) : undefined;
    const max = maxAmount ? parseFloat(maxAmount) : undefined;
    onAmountRangeChange?.(min, max);
  };

  const handleMaxAmountChange = (value: string) => {
    setMaxAmount(value);
    const min = minAmount ? parseFloat(minAmount) : undefined;
    const max = value ? parseFloat(value) : undefined;
    onAmountRangeChange?.(min, max);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onSearchChange?.(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-card rounded-lg border border-border">
      {/* Search */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Search className="w-4 h-4" />
          Search
        </label>
        <Input
          type="text"
          placeholder="Search in notes..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Date Range */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          From Date
        </label>
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => handleDateFromChange(e.target.value)}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          To Date
        </label>
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => handleDateToChange(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Transaction Type */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Tag className="w-4 h-4" />
          Type
        </label>
        <Select onValueChange={onTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
            <SelectItem value="transfer">Transfer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Category */}
      {categories.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Category
          </label>
          <Select onValueChange={onCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Account */}
      {accounts.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Account
          </label>
          <Select onValueChange={onAccountChange}>
            <SelectTrigger>
              <SelectValue placeholder="All accounts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All accounts</SelectItem>
              {accounts.map((acc) => (
                <SelectItem key={acc.id} value={acc.id}>
                  {acc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Amount Range */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          Min Amount
        </label>
        <Input
          type="number"
          placeholder="0"
          value={minAmount}
          onChange={(e) => handleMinAmountChange(e.target.value)}
          className="w-full"
          step="0.01"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          Max Amount
        </label>
        <Input
          type="number"
          placeholder="∞"
          value={maxAmount}
          onChange={(e) => handleMaxAmountChange(e.target.value)}
          className="w-full"
          step="0.01"
        />
      </div>
    </div>
  );
}
