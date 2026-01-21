import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Plus, Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface DashboardHeaderProps {
  onAddTransaction?: () => void;
}

export default function DashboardHeader({
  onAddTransaction,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Financial Overview
        </h1>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            className="pl-9 w-72 bg-secondary/50"
          />
        </div>

        {/* Add Transaction Button */}
        <Button
          onClick={onAddTransaction}
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Transaction
        </Button>

        {/* Notifications */}
        <Button
          variant="outline"
          size="icon"
          className="relative hover:bg-secondary/80"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full"></span>
        </Button>

        {/* User Avatar */}
        <Avatar className="w-9 h-9 cursor-pointer ring-2 ring-border hover:ring-primary transition-all">
          <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
            U
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
