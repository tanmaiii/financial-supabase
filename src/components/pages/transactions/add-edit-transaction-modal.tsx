"use client";

import { FormInput, FormSelect, FormTextarea } from "@/components/common/form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TransactionType } from "@/enum/transaction.enum";
import { createClient } from "@/lib/supabase/client";
import {
  TransactionFormData,
  transactionSchema,
} from "@/lib/validations/transactionSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

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

interface AddEditTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  transactionId?: string | null; // ID of transaction to edit
  initialData?: TransactionFormData | null; // Initial data for editing
}

export default function AddEditTransactionModal({
  open,
  onOpenChange,
  onSuccess,
  transactionId,
  initialData,
}: AddEditTransactionModalProps) {
  const t = useTranslations("transactions");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: initialData || {
      type: "expense",
      transaction_date: new Date().toISOString().split("T")[0],
    },
  });

  // Update form when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData && open) {
      reset(initialData);
    } else if (!open) {
      reset({
        type: "expense",
        transaction_date: new Date().toISOString().split("T")[0],
      });
    }
  }, [initialData, open, reset]);

  // Fetch categories and accounts
  useEffect(() => {
    async function fetchData() {
      const [categoriesRes, accountsRes] = await Promise.all([
        supabase.from("categories").select("id, name, type, icon, color"),
        supabase.from("accounts").select("id, name, type, balance"),
      ]);

      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (accountsRes.data) setAccounts(accountsRes.data);
    }

    if (open) {
      fetchData();
    }
  }, [open, supabase]);

  const onSubmit = async (data: TransactionFormData) => {
    setIsSubmitting(true);
    try {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        throw new Error("User not authenticated");
      }

      if (transactionId) {
        // Update existing transaction
        console.log("Updating transaction:", transactionId, "with data:", data);

        const updateData = {
          amount: data.amount,
          type: data.type,
          category_id: data.category_id || null,
          account_id: data.account_id || null,
          note: data.note || "",
          transaction_date: new Date(data.transaction_date).toISOString(),
        };

        console.log("Update payload:", updateData);

        const { data: updatedData, error } = await supabase
          .from("transactions")
          .update(updateData)
          .eq("id", transactionId)
          .select();

        if (error) {
          console.error("Supabase update error:", error);
          throw error;
        }

        console.log("Update successful, returned data:", updatedData);
      } else {
        // Create new transaction
        const { error } = await supabase.from("transactions").insert([
          {
            user_id: userData.user.id,
            amount: data.amount,
            type: data.type,
            category_id: data.category_id || null,
            account_id: data.account_id || null,
            note: data.note || "",
            transaction_date: new Date(data.transaction_date).toISOString(),
            created_at: new Date().toISOString(),
          },
        ]);

        if (error) throw error;
      }

      // Success
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error saving transaction:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === "object" && error !== null && "message" in error
            ? String((error as unknown as { message: string }).message)
            : t("add_modal.error");
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const transactionType = watch("type");
  const filteredCategories = categories.filter(
    (cat) => cat.type === transactionType,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {transactionId ? t("edit_modal.title") : t("add_modal.title")}
          </DialogTitle>
          <DialogDescription>
            {transactionId
              ? t("edit_modal.description")
              : t("add_modal.description")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Transaction Type */}
          <FormSelect
            label={t("add_modal.type")}
            name="type"
            required
            value={watch("type")}
            onValueChange={(value: string) =>
              setValue("type", value as TransactionType)
            }
            options={[
              { value: TransactionType.INCOME, label: t("types.income") },
              { value: TransactionType.EXPENSE, label: t("types.expense") },
            ]}
            error={errors.type?.message}
          />
          {/* Amount */}
          <FormInput
            label={t("add_modal.amount")}
            name="amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            required
            register={register("amount", { valueAsNumber: true })}
            error={errors.amount?.message}
          />
          {/* Category */}
          <FormSelect
            label={t("add_modal.category")}
            name="category_id"
            placeholder={t("add_modal.select_category")}
            value={watch("category_id")}
            onValueChange={(value) => setValue("category_id", value)}
            options={filteredCategories.map((cat) => ({
              value: cat.id,
              label: `${cat.icon} ${cat.name}`,
            }))}
            error={errors.category_id?.message}
          />
          {/* Account */}
          <FormSelect
            label={t("add_modal.account")}
            name="account_id"
            placeholder={t("add_modal.select_account")}
            value={watch("account_id")}
            onValueChange={(value) => setValue("account_id", value)}
            options={accounts.map((acc) => ({
              value: acc.id,
              label: `${acc.name} (${acc.balance.toLocaleString()})`,
            }))}
            error={errors.account_id?.message}
          />
          {/* Transaction Date */}
          <FormInput
            label={t("add_modal.date")}
            name="transaction_date"
            type="date"
            required
            register={register("transaction_date")}
            error={errors.transaction_date?.message}
          />
          {/* Note */}
          <FormTextarea
            label={t("add_modal.note")}
            name="note"
            placeholder={t("add_modal.note_placeholder")}
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
              {t("add_modal.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {transactionId ? t("edit_modal.submit") : t("add_modal.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
