"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  savingsService,
  CreateContributionInput,
} from "@/services/savings.service";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface AddMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  savingFundId: string;
  goalName: string;
  currentAmount: number;
  targetAmount: number;
}

export default function AddMoneyModal({
  isOpen,
  onClose,
  onSuccess,
  savingFundId,
  goalName,
  currentAmount,
  targetAmount,
}: AddMoneyModalProps) {
  const t = useTranslations("savings.add_money_modal");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amount, setAmount] = useState<number>(0);
  const [note, setNote] = useState("");
  const [contributionDate, setContributionDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const remainingAmount = targetAmount - currentAmount;
  const newTotal = currentAmount + amount;
  const newProgress = Math.min((newTotal / targetAmount) * 100, 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (amount <= 0) {
      toast.error(t("amount_required"));
      return;
    }

    setIsSubmitting(true);

    try {
      const contributionData: CreateContributionInput = {
        saving_fund_id: savingFundId,
        amount,
        contribution_date: new Date(contributionDate).toISOString(),
        note: note.trim() || undefined,
      };

      await savingsService.addContribution(contributionData);

      toast.success(
        t("success", { amount: amount.toLocaleString(), goalName }),
      );

      // Reset form
      setAmount(0);
      setNote("");
      setContributionDate(new Date().toISOString().split("T")[0]);

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error adding contribution:", error);
      toast.error(t("error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{t("title", { goalName })}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Progress */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("current")}</span>
              <span className="font-semibold">
                ${currentAmount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("target")}</span>
              <span className="font-semibold">
                ${targetAmount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("remaining")}</span>
              <span className="font-semibold text-primary">
                ${remainingAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">{t("amount_label")} *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                placeholder={t("amount_placeholder")}
                value={amount || ""}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="pl-7"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {t("quick_add")}{" "}
              <button
                type="button"
                onClick={() => setAmount(100)}
                className="text-primary hover:underline"
              >
                $100
              </button>
              {" · "}
              <button
                type="button"
                onClick={() => setAmount(500)}
                className="text-primary hover:underline"
              >
                $500
              </button>
              {" · "}
              <button
                type="button"
                onClick={() => setAmount(1000)}
                className="text-primary hover:underline"
              >
                $1,000
              </button>
              {" · "}
              <button
                type="button"
                onClick={() => setAmount(remainingAmount)}
                className="text-primary hover:underline"
              >
                {t("complete_goal")}
              </button>
            </p>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="contribution_date">{t("date_label")}</Label>
            <Input
              id="contribution_date"
              type="date"
              value={contributionDate}
              onChange={(e) => setContributionDate(e.target.value)}
              required
            />
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="note">{t("note_label")}</Label>
            <Textarea
              id="note"
              placeholder={t("note_placeholder")}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />
          </div>

          {/* Preview */}
          {amount > 0 && (
            <div className="bg-primary/5 p-4 rounded-lg space-y-2 border border-primary/10">
              <p className="text-sm font-medium">{t("preview")}</p>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("new_total")}</span>
                <span className="font-semibold">
                  ${newTotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("progress")}</span>
                <span className="font-semibold text-primary">
                  {newProgress.toFixed(1)}%
                </span>
              </div>
              {newTotal >= targetAmount && (
                <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                  {t("will_complete")}
                </p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting || amount <= 0}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("submitting")}
                </>
              ) : (
                t("submit")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
