"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface SavingsGoal {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  currentAmount: number;
  targetAmount: number;
  progress: number;
  status: "on-track" | "behind" | "done";
  estimatedCompletion: string;
  behindSchedule?: string;
}

interface SavingsGoalCardProps {
  goal: SavingsGoal;
  onAddMoney?: (goalId: string) => void;
  onEdit?: (goalId: string) => void;
  onDelete?: (goalId: string) => void;
}

export default function SavingsGoalCard({
  goal,
  onAddMoney,
  onEdit,
  onDelete,
}: SavingsGoalCardProps) {
  const {
    id,
    icon,
    title,
    description,
    currentAmount,
    targetAmount,
    progress,
    status,
    estimatedCompletion,
    behindSchedule,
  } = goal;

  const isDone = status === "done";
  const isBehind = status === "behind";

  return (
    <Card
      className={cn(
        "p-6 hover:shadow-lg transition-all duration-300 border-border/50 relative group",
        isDone && "bg-muted/30",
      )}
    >
      {/* Behind Schedule Badge */}
      {isBehind && (
        <div className="absolute top-[-12] right-4 flex items-center gap-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 px-2 py-1 rounded-md text-xs font-medium">
          <AlertCircle className="w-3 h-3" />
          BEHIND SCHEDULE
        </div>
      )}

      {/* Done Badge */}
      {isDone && (
        <div className="absolute top-[-12] right-4 flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-full">
          <CheckCircle className="w-4 h-4" />
          <span className="text-xs font-medium">DONE</span>
        </div>
      )}

      {/* Action Buttons - Shown on hover */}
      <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {!isDone && onAddMoney && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onAddMoney(id)}
            className="h-8 px-3"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Money
          </Button>
        )}
        {onEdit && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(id)}
            className="h-8 w-8 p-0"
          >
            <Edit className="w-4 h-4" />
          </Button>
        )}
        {onDelete && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(id)}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {/* Header with Icon and Progress */}
        <div className="flex items-start justify-start gap-4">
          {/* Icon */}
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              isDone
                ? "bg-muted"
                : "bg-gradient-to-br from-primary/10 to-primary/5",
            )}
          >
            <div
              className={cn(
                "text-xl",
                isDone ? "text-muted-foreground" : "text-primary",
              )}
            >
              {icon}
            </div>
          </div>
        </div>

        {/* Title and Description */}
        <div className="flex flex-row justify-between">
          <div className="">
            <h3
              className={cn(
                "text-lg font-semibold",
                isDone && "text-muted-foreground line-through",
              )}
            >
              {title}
            </h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          {/* Progress Circle */}
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
              {/* Background circle */}
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                className="stroke-muted"
                strokeWidth="2"
              />
              {/* Progress circle */}
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                className={cn(
                  isDone && "stroke-emerald-500",
                  isBehind && "stroke-orange-500",
                  !isDone && !isBehind && "stroke-primary",
                )}
                strokeWidth="2"
                strokeDasharray={`${progress}, 100`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold">{progress}%</span>
            </div>
          </div>
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-start">
            <span className="text-2xl font-bold">
              ${currentAmount.toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground">
              / ${targetAmount.toLocaleString()}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                isDone && "bg-emerald-500",
                isBehind && "bg-orange-500",
                !isDone && !isBehind && "bg-primary",
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          className={cn(
            "flex items-center gap-2 text-xs",
            isDone
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-muted-foreground",
          )}
        >
          <Calendar className="w-3.5 h-3.5" />
          {isDone ? (
            <span className="font-medium">
              Completed: {estimatedCompletion}
            </span>
          ) : (
            <span>Est. completion: {estimatedCompletion}</span>
          )}
        </div>

        {/* Behind Schedule Info */}
        {isBehind && behindSchedule && (
          <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">
            {behindSchedule}
          </div>
        )}
      </div>
    </Card>
  );
}
