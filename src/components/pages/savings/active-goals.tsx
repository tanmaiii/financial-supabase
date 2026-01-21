"use client";

import { useState, useEffect } from "react";
import SavingsGoalCard, {
  SavingsGoal,
} from "@/components/common/SavingsGoalCard";
import {
  Car,
  Home,
  Lightbulb,
  Plane,
  Gift,
  GraduationCap,
  Heart,
  Laptop,
  PiggyBank,
  Gem,
} from "lucide-react";
import { savingsService, SavingFund } from "@/services/savings.service";
import { toast } from "sonner";
import AddMoneyModal from "./add-money-modal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTranslations } from "next-intl";

interface ActiveGoalsProps {
  onRefresh?: () => void;
}

// Icon mapping from database string to React component
const iconMap: Record<string, React.ReactNode> = {
  home: <Home className="w-6 h-6" />,
  car: <Car className="w-6 h-6" />,
  plane: <Plane className="w-6 h-6" />,
  lightbulb: <Lightbulb className="w-6 h-6" />,
  gift: <Gift className="w-6 h-6" />,
  graduation: <GraduationCap className="w-6 h-6" />,
  heart: <Heart className="w-6 h-6" />,
  laptop: <Laptop className="w-6 h-6" />,
  "piggy-bank": <PiggyBank className="w-6 h-6" />,
  ring: <Gem className="w-6 h-6" />,
};

export default function ActiveGoals({ onRefresh }: ActiveGoalsProps) {
  const t = useTranslations("savings");
  const tDialog = useTranslations("savings.delete_dialog");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [goals, setGoals] = useState<SavingFund[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add Money Modal
  const [addMoneyModalOpen, setAddMoneyModalOpen] = useState(false);
  const [selectedGoalForMoney, setSelectedGoalForMoney] =
    useState<SavingFund | null>(null);

  // Delete Confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchGoals = async () => {
    try {
      setIsLoading(true);
      const data = await savingsService.getSavingFunds();
      setGoals(data);
    } catch (error) {
      console.error("Error fetching goals:", error);
      toast.error(t("add_modal.error_create"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const convertToUIGoal = (fund: SavingFund): SavingsGoal => {
    const progress = Math.min(
      (fund.current_amount / fund.target_amount) * 100,
      100,
    );

    // Calculate status
    let status: "on-track" | "behind" | "done" = "on-track";
    if (progress >= 100) {
      status = "done";
    } else if (fund.deadline) {
      const deadline = new Date(fund.deadline);
      const now = new Date();
      const daysUntilDeadline = Math.ceil(
        (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );
      const expectedProgress = 100 - (daysUntilDeadline / 365) * 100;

      if (progress < expectedProgress - 15) {
        status = "behind";
      }
    }

    // Format estimated completion
    const estimatedCompletion = fund.deadline
      ? new Date(fund.deadline).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        })
      : "No deadline";

    return {
      id: fund.id,
      icon: iconMap[fund.icon || "piggy-bank"] || (
        <PiggyBank className="w-6 h-6" />
      ),
      title: fund.name,
      description: fund.description || "Saving goal",
      currentAmount: fund.current_amount,
      targetAmount: fund.target_amount,
      progress: Math.round(progress),
      status,
      estimatedCompletion,
    };
  };

  const handleAddMoney = (goalId: string) => {
    const goal = goals.find((g) => g.id === goalId);
    if (goal) {
      setSelectedGoalForMoney(goal);
      setAddMoneyModalOpen(true);
    }
  };

  const handleDelete = (goalId: string) => {
    setGoalToDelete(goalId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!goalToDelete) return;

    setIsDeleting(true);
    try {
      await savingsService.deleteSavingFund(goalToDelete);
      toast.success(tDialog("success"));
      fetchGoals();
      onRefresh?.();
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast.error(tDialog("error"));
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setGoalToDelete(null);
    }
  };

  const handleMoneyAdded = () => {
    fetchGoals();
    onRefresh?.();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">{t("loading_goals")}</p>
        </div>
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
        <PiggyBank className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">{t("no_goals_title")}</h3>
        <p className="text-sm text-muted-foreground">
          {t("no_goals_description")}
        </p>
      </div>
    );
  }

  return (
    <>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">{t("active_goals")}</h2>

          {/* View Toggle */}
          <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-background shadow-sm"
                  : "hover:bg-background/50"
              }`}
              aria-label="Grid view"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "list"
                  ? "bg-background shadow-sm"
                  : "hover:bg-background/50"
              }`}
              aria-label="List view"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <line x1="3" y1="6" x2="21" y2="6" strokeWidth="2" />
                <line x1="3" y1="12" x2="21" y2="12" strokeWidth="2" />
                <line x1="3" y1="18" x2="21" y2="18" strokeWidth="2" />
              </svg>
            </button>
          </div>
        </div>

        {/* Goals Grid/List */}
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "flex flex-col gap-4"
          }
        >
          {goals.map((fund) => (
            <SavingsGoalCard
              key={fund.id}
              goal={convertToUIGoal(fund)}
              onAddMoney={handleAddMoney}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>

      {/* Add Money Modal */}
      {selectedGoalForMoney && (
        <AddMoneyModal
          isOpen={addMoneyModalOpen}
          onClose={() => {
            setAddMoneyModalOpen(false);
            setSelectedGoalForMoney(null);
          }}
          onSuccess={handleMoneyAdded}
          savingFundId={selectedGoalForMoney.id}
          goalName={selectedGoalForMoney.name}
          currentAmount={selectedGoalForMoney.current_amount}
          targetAmount={selectedGoalForMoney.target_amount}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tDialog("title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {tDialog("description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {tDialog("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? tDialog("deleting") : tDialog("confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
