"use client";

import React, { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "next-intl";
import { Trash2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  icon: string;
  color: string;
}

interface CategoryManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Partial<Category>) => void;
  onDelete?: (categoryId: string) => void;
  category?: Category;
}

const CATEGORY_ICONS = [
  "🍔",
  "🍕",
  "🍜",
  "☕",
  "🍺", // Food & Dining
  "🚗",
  "🚌",
  "🚇",
  "✈️",
  "🚕", // Transportation
  "🛍️",
  "👕",
  "👟",
  "💄",
  "🎁", // Shopping
  "🎬",
  "🎮",
  "🎵",
  "🎨",
  "📚", // Entertainment
  "🏠",
  "💡",
  "💧",
  "📱",
  "📄", // Bills & Utilities
  "🏥",
  "💊",
  "🏋️",
  "🧘",
  "💆", // Healthcare & Wellness
  "💼",
  "💻",
  "📈",
  "💰",
  "🎓", // Income & Work
  "💸",
  "❓",
  "🔧",
  "🎯",
  "⭐", // Other
];

const CATEGORY_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#eab308", // yellow
  "#84cc16", // lime
  "#22c55e", // green
  "#10b981", // emerald
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#0ea5e9", // sky
  "#3b82f6", // blue
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#a855f7", // purple
  "#d946ef", // fuchsia
  "#ec4899", // pink
  "#64748b", // slate
];

export function CategoryManagementModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  category,
}: CategoryManagementModalProps) {
  const t = useTranslations();

  // Initialize form data directly from category prop
  const initialState = category
    ? {
        name: category.name,
        type: category.type,
        icon: category.icon,
        color: category.color,
      }
    : {
        name: "",
        type: "expense" as "income" | "expense",
        icon: "🍔",
        color: "#ef4444",
      };

  const [formData, setFormData] = useState(initialState);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleDelete = () => {
    if (category && onDelete) {
      if (confirm(t("settings.category_management.confirm_delete"))) {
        onDelete(category.id);
        onClose();
      }
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      key={category?.id || "new"} // Reset form when category changes
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {category
              ? t("settings.category_management.edit_title")
              : t("settings.category_management.add_title")}
          </DialogTitle>
          <DialogDescription>
            {category
              ? t("settings.category_management.edit_description")
              : t("settings.category_management.add_description")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Name */}
          <div className="space-y-2">
            <Label htmlFor="category-name">
              {t("settings.category_management.name_label")}
            </Label>
            <Input
              id="category-name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder={t("settings.category_management.name_placeholder")}
              required
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label>{t("settings.category_management.type_label")}</Label>
            <Select
              value={formData.type}
              onValueChange={(value: "income" | "expense") =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">
                  {t("transactions.types.income")}
                </SelectItem>
                <SelectItem value="expense">
                  {t("transactions.types.expense")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Icon Selection */}
          <div className="space-y-2">
            <Label>{t("settings.category_management.icon_label")}</Label>
            <div className="grid grid-cols-6 gap-2 p-3 border rounded-lg bg-muted/20 max-h-[200px] overflow-y-auto">
              {CATEGORY_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon })}
                  className={`p-2 text-2xl rounded-lg hover:bg-muted transition-colors ${
                    formData.icon === icon
                      ? "bg-primary/20 ring-2 ring-primary"
                      : ""
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <Label>{t("settings.category_management.color_label")}</Label>
            <div className="grid grid-cols-8 gap-2">
              {CATEGORY_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-10 h-10 rounded-lg transition-all ${
                    formData.color === color
                      ? "ring-2 ring-offset-2 ring-primary scale-110"
                      : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>{t("settings.category_management.preview")}</Label>
            <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/20">
              <div
                className="p-3 rounded-lg"
                style={{ backgroundColor: `${formData.color}20` }}
              >
                <span className="text-2xl">{formData.icon}</span>
              </div>
              <div>
                <p className="font-medium">
                  {formData.name ||
                    t("settings.category_management.name_placeholder")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formData.type === "income"
                    ? t("transactions.types.income")
                    : t("transactions.types.expense")}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            {category && onDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                className="mr-auto"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {t("common.delete")}
              </Button>
            )}
            <Button type="button" variant="outline" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button type="submit">
              {category ? t("common.update") : t("common.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
