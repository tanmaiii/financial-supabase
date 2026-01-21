"use client";

import { FormInput, FormSelect } from "@/components/common/form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { FixedExpenseFormData } from "./types";

interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  icon: string | null;
  color: string | null;
}

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
}

interface AddEditFixedExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (data: FixedExpenseFormData, id?: string) => void;
  initialData?: FixedExpenseFormData & { id?: string };
}

export default function AddEditFixedExpenseModal({
  open,
  onOpenChange,
  onSuccess,
  initialData,
}: AddEditFixedExpenseModalProps) {
  const t = useTranslations("fixed_expenses.modal");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const supabase = createClient();

  const STATUS_OPTIONS = [
    { value: "true", label: t("status_active") },
    { value: "false", label: t("status_inactive") },
  ];

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
    control,
  } = useForm<FixedExpenseFormData>({
    defaultValues: initialData || {
      name: "",
      category_id: "",
      amount: 0,
      frequency: "monthly",
      next_occurrence: new Date().toISOString().split("T")[0],
      is_active: true,
      account_id: undefined,
      note: undefined,
    },
  });

  // Fetch categories and accounts
  useEffect(() => {
    async function fetchData() {
      const [categoriesRes, accountsRes] = await Promise.all([
        supabase
          .from("categories")
          .select("id, name, type, icon, color")
          .eq("type", "expense"), // Only expense categories
        supabase.from("accounts").select("id, name, type, balance"),
      ]);

      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (accountsRes.data) setAccounts(accountsRes.data);
    }

    if (open) {
      fetchData();
    }
  }, [open, supabase]);

  // Update form when initialData changes
  useEffect(() => {
    if (initialData && open) {
      reset(initialData);
    } else if (!open) {
      reset({
        name: "",
        category_id: "",
        amount: 0,
        frequency: "monthly",
        next_occurrence: new Date().toISOString().split("T")[0],
        is_active: true,
        account_id: undefined,
        note: undefined,
      });
    }
  }, [initialData, open, reset]);

  const onSubmit = async (data: FixedExpenseFormData) => {
    setIsSubmitting(true);
    try {
      // Convert empty string to undefined for optional UUID fields
      const cleanedData = {
        ...data,
        category_id: data.category_id.trim(),
        account_id:
          data.account_id && data.account_id.trim() !== ""
            ? data.account_id
            : undefined,
        note: data.note && data.note.trim() !== "" ? data.note : undefined,
      };

      await onSuccess(cleanedData, initialData?.id);
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving fixed expense:", error);
      alert(t("error_save"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData?.id ? t("edit_title") : t("add_title")}
          </DialogTitle>
          <DialogDescription>
            {initialData?.id ? t("edit_description") : t("add_description")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <FormInput
            label={t("name_label")}
            name="name"
            type="text"
            placeholder={t("name_placeholder")}
            required
            register={register("name", {
              required: t("name_required"),
              minLength: {
                value: 2,
                message: t("name_min_length"),
              },
            })}
            error={errors.name?.message}
          />

          {/* Category */}
          <Controller
            name="category_id"
            control={control}
            rules={{
              required: t("category_required"),
              validate: (value) =>
                (value && value.trim() !== "") || t("category_required"),
            }}
            render={({ field }) => (
              <FormSelect
                label={t("category_label")}
                name="category_id"
                required
                placeholder={t("category_placeholder")}
                value={field.value || ""}
                onValueChange={field.onChange}
                options={categories.map((cat) => ({
                  value: cat.id,
                  label: `${cat.icon} ${cat.name}`,
                }))}
                error={errors.category_id?.message}
              />
            )}
          />

          {/* Account */}
          <FormSelect
            label={t("account_label")}
            name="account_id"
            placeholder={t("account_placeholder")}
            value={watch("account_id") || ""}
            onValueChange={(value: string) => setValue("account_id", value)}
            options={accounts.map((acc) => ({
              value: acc.id,
              label: `${acc.name} (VND)`,
            }))}
            error={errors.account_id?.message}
          />

          {/* Amount */}
          <FormInput
            label={t("amount_label")}
            name="amount"
            type="number"
            step="0.01"
            placeholder={t("amount_placeholder")}
            required
            register={register("amount", {
              required: t("amount_required"),
              valueAsNumber: true,
              min: {
                value: 0.01,
                message: t("amount_min"),
              },
            })}
            error={errors.amount?.message}
          />

          {/* Frequency */}
          <FormSelect
            label={t("frequency_label")}
            name="frequency"
            required
            value={watch("frequency") || "monthly"}
            onValueChange={(value: string) =>
              setValue(
                "frequency",
                value as "daily" | "weekly" | "monthly" | "yearly",
              )
            }
            options={[
              { value: "daily", label: t("frequency_daily") },
              { value: "weekly", label: t("frequency_weekly") },
              { value: "monthly", label: t("frequency_monthly") },
              { value: "yearly", label: t("frequency_yearly") },
            ]}
            error={errors.frequency?.message}
          />

          {/* Next Billing Date */}
          <FormInput
            label={t("next_billing_label")}
            name="next_occurrence"
            type="date"
            required
            register={register("next_occurrence", {
              required: t("next_billing_required"),
            })}
            error={errors.next_occurrence?.message}
          />

          {/* Status */}
          <FormSelect
            label={t("status_label")}
            name="is_active"
            required
            value={watch("is_active") ? "true" : "false"}
            onValueChange={(value: string) =>
              setValue("is_active", value === "true")
            }
            options={STATUS_OPTIONS}
            error={errors.is_active?.message}
          />

          {/* Note */}
          <FormInput
            label={t("note_label")}
            name="note"
            type="text"
            placeholder={t("note_placeholder")}
            register={register("note")}
            error={errors.note?.message}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {initialData?.id ? t("submit_edit") : t("submit_add")} Chi Phí
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
