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
import { Trash2, Landmark, Wallet, CreditCard } from "lucide-react";

interface Account {
  id: string;
  name: string;
  type: string;
  currency: string;
}

interface AccountManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (account: Partial<Account>) => void;
  onDelete?: (accountId: string) => void;
  account?: Account;
}

const ACCOUNT_TYPES = [
  { value: "bank", label: "Bank Account", icon: Landmark },
  { value: "cash", label: "Cash", icon: Wallet },
  { value: "credit_card", label: "Credit Card", icon: CreditCard },
  { value: "savings", label: "Savings Account", icon: Landmark },
  { value: "investment", label: "Investment Account", icon: Landmark },
];

const CURRENCIES = [
  { value: "VND", label: "VND (₫)", symbol: "₫" },
  { value: "USD", label: "USD ($)", symbol: "$" },
  { value: "EUR", label: "EUR (€)", symbol: "€" },
];

export function AccountManagementModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  account,
}: AccountManagementModalProps) {
  const t = useTranslations();

  // Initialize form data directly from account prop
  const initialState = account
    ? {
        name: account.name,
        type: account.type,
        currency: account.currency,
      }
    : {
        name: "",
        type: "bank",
        currency: "VND",
      };

  const [formData, setFormData] = useState(initialState);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
    });
  };

  const handleDelete = () => {
    if (account && onDelete) {
      if (confirm(t("settings.account_management.confirm_delete"))) {
        onDelete(account.id);
        onClose();
      }
    }
  };

  const getAccountIcon = (type: string) => {
    const accountType = ACCOUNT_TYPES.find((t) => t.value === type);
    const Icon = accountType?.icon || Wallet;
    return <Icon className="w-6 h-6" />;
  };

  const getAccountIconStyle = (type: string) => {
    switch (type) {
      case "bank":
        return {
          bg: "bg-purple-100",
          color: "text-purple-600",
        };
      case "cash":
        return {
          bg: "bg-teal-100",
          color: "text-teal-600",
        };
      case "credit_card":
        return {
          bg: "bg-orange-100",
          color: "text-orange-600",
        };
      case "savings":
        return {
          bg: "bg-green-100",
          color: "text-green-600",
        };
      case "investment":
        return {
          bg: "bg-blue-100",
          color: "text-blue-600",
        };
      default:
        return {
          bg: "bg-gray-100",
          color: "text-gray-600",
        };
    }
  };

  const selectedCurrency = CURRENCIES.find(
    (c) => c.value === formData.currency,
  );

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      key={account?.id || "new"} // Reset form when account changes
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {account
              ? t("settings.account_management.edit_title")
              : t("settings.account_management.add_title")}
          </DialogTitle>
          <DialogDescription>
            {account
              ? t("settings.account_management.edit_description")
              : t("settings.account_management.add_description")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Account Name */}
          <div className="space-y-2">
            <Label htmlFor="account-name">
              {t("settings.account_management.name_label")}
            </Label>
            <Input
              id="account-name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder={t("settings.account_management.name_placeholder")}
              required
            />
          </div>

          {/* Account Type */}
          <div className="space-y-2">
            <Label>{t("settings.account_management.type_label")}</Label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACCOUNT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Currency */}
          <div className="space-y-2">
            <Label>{t("settings.account_management.currency_label")}</Label>
            <Select
              value={formData.currency}
              onValueChange={(value) =>
                setFormData({ ...formData, currency: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((currency) => (
                  <SelectItem key={currency.value} value={currency.value}>
                    {currency.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>{t("settings.account_management.preview")}</Label>
            <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/20">
              <div
                className={`p-3 rounded-lg ${getAccountIconStyle(formData.type).bg} ${getAccountIconStyle(formData.type).color}`}
              >
                {getAccountIcon(formData.type)}
              </div>
              <div className="flex-1">
                <p className="font-medium">
                  {formData.name ||
                    t("settings.account_management.name_placeholder")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {ACCOUNT_TYPES.find((t) => t.value === formData.type)?.label}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-lg">
                  {selectedCurrency?.symbol}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formData.currency}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            {account && onDelete && (
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
              {account ? t("common.update") : t("common.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
