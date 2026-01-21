import { z } from "zod";

export const transactionSchema = z.object({
  amount: z.number().refine((val) => val !== 0, "Amount cannot be zero"),
  type: z.enum(["income", "expense"]),
  category_id: z.string().optional().or(z.literal("")),
  account_id: z.string().optional().or(z.literal("")),
  note: z.string().optional(),
  transaction_date: z.string().min(1, "Transaction date is required"),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;
