"use client";

import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  savingsService,
  CreateSavingFundInput,
  UpdateSavingFundInput,
  SavingFund,
} from "@/services/savings.service";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface AddSavingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingGoal?: SavingFund | null;
}

const ICONS = [
  { value: "home", label: "🏠 Home" },
  { value: "car", label: "🚗 Car" },
  { value: "plane", label: "✈️ Travel" },
  { value: "lightbulb", label: "💡 Emergency" },
  { value: "gift", label: "🎁 Gift" },
  { value: "graduation", label: "🎓 Education" },
  { value: "heart", label: "❤️ Health" },
  { value: "laptop", label: "💻 Technology" },
  { value: "piggy-bank", label: "🐷 Savings" },
  { value: "ring", label: "💍 Wedding" },
];

const COLORS = [
  { value: "#3b82f6", label: "Blue" },
  { value: "#10b981", label: "Green" },
  { value: "#f59e0b", label: "Orange" },
  { value: "#ef4444", label: "Red" },
  { value: "#8b5cf6", label: "Purple" },
  { value: "#ec4899", label: "Pink" },
  { value: "#14b8a6", label: "Teal" },
  { value: "#f97316", label: "Amber" },
];

// Color hex to translation key mapping
const colorLabelMap: Record<string, string> = {
  "#3b82f6": "blue",
  "#10b981": "green",
  "#f59e0b": "orange",
  "#ef4444": "red",
  "#8b5cf6": "purple",
  "#ec4899": "pink",
  "#14b8a6": "teal",
  "#f97316": "amber",
};

export default function AddSavingsModal({
  isOpen,
  onClose,
  onSuccess,
  editingGoal,
}: AddSavingsModalProps) {
  const t = useTranslations("savings.add_modal");
  const tIcons = useTranslations("savings.icons");
  const tColors = useTranslations("savings.colors");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateSavingFundInput>({
    name: "",
    target_amount: 0,
    current_amount: 0,
    deadline: "",
    icon: "piggy-bank",
    color: "#3b82f6",
    description: "",
  });

  useEffect(() => {
    if (editingGoal) {
      setFormData({
        name: editingGoal.name,
        target_amount: editingGoal.target_amount,
        current_amount: editingGoal.current_amount,
        deadline: editingGoal.deadline || "",
        icon: editingGoal.icon || "piggy-bank",
        color: editingGoal.color || "#3b82f6",
        description: editingGoal.description || "",
      });
    } else {
      setFormData({
        name: "",
        target_amount: 0,
        current_amount: 0,
        deadline: "",
        icon: "piggy-bank",
        color: "#3b82f6",
        description: "",
      });
    }
  }, [editingGoal, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error(t("name_required"));
      return;
    }

    if (formData.target_amount <= 0) {
      toast.error(t("target_amount_required"));
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingGoal) {
        // Update existing goal
        const updateData: UpdateSavingFundInput = {
          name: formData.name,
          target_amount: formData.target_amount,
          deadline: formData.deadline || undefined,
          icon: formData.icon,
          color: formData.color,
          description: formData.description,
        };

        console.log("Updating goal:", updateData);
        await savingsService.updateSavingFund(editingGoal.id, updateData);
        toast.success(t("success_update"));
      } else {
        // Create new goal
        console.log("Creating new goal with data:", formData);
        const result = await savingsService.createSavingFund(formData);
        console.log("Created goal:", result);
        toast.success(t("success_create"));
      }

      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error("Error saving goal:", error);

      // Display more specific error message
      const err = error as {
        message?: string;
        details?: string;
        hint?: string;
      };
      const errorMessage = err?.message || "Unknown error occurred";
      const errorDetails = err?.details || err?.hint || "";

      toast.error(
        editingGoal
          ? `${t("error_update")}: ${errorMessage}${errorDetails ? ` (${errorDetails})` : ""}`
          : `${t("error_create")}: ${errorMessage}${errorDetails ? ` (${errorDetails})` : ""}`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    field: keyof CreateSavingFundInput,
    value: string | number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingGoal ? t("edit_title") : t("add_title")}
          </DialogTitle>
          <DialogDescription>
            {editingGoal ? t("edit_description") : t("add_description")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">{t("name_label")} *</Label>
            <Input
              id="name"
              placeholder={t("name_placeholder")}
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">{t("description_label")}</Label>
            <Textarea
              id="description"
              placeholder={t("description_placeholder")}
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={2}
            />
          </div>

          {/* Target Amount and Current Amount */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target_amount">
                {t("target_amount_label")} *
              </Label>
              <Input
                id="target_amount"
                type="number"
                min="0"
                step="0.01"
                placeholder={t("target_amount_placeholder")}
                value={formData.target_amount || ""}
                onChange={(e) =>
                  handleChange("target_amount", parseFloat(e.target.value) || 0)
                }
                required
              />
            </div>

            {!editingGoal && (
              <div className="space-y-2">
                <Label htmlFor="current_amount">
                  {t("initial_amount_label")}
                </Label>
                <Input
                  id="current_amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder={t("initial_amount_placeholder")}
                  value={formData.current_amount || ""}
                  onChange={(e) =>
                    handleChange(
                      "current_amount",
                      parseFloat(e.target.value) || 0,
                    )
                  }
                />
              </div>
            )}
          </div>

          {/* Deadline */}
          <div className="space-y-2">
            <Label htmlFor="deadline">{t("deadline_label")}</Label>
            <Input
              id="deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) => handleChange("deadline", e.target.value)}
            />
          </div>

          {/* Icon and Color */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="icon">{t("icon_label")}</Label>
              <Select
                value={formData.icon}
                onValueChange={(value) => handleChange("icon", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ICONS.map((icon) => (
                    <SelectItem key={icon.value} value={icon.value}>
                      {tIcons(icon.value.replace("-", "_") as string)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">{t("color_label")}</Label>
              <Select
                value={formData.color}
                onValueChange={(value) => handleChange("color", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COLORS.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: color.value }}
                        />
                        {tColors(colorLabelMap[color.value] as string)}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {editingGoal ? t("updating") : t("creating")}
                </>
              ) : editingGoal ? (
                t("submit_edit")
              ) : (
                t("submit_add")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
