import * as z from "zod";

export const createActivitySchema = z
  .object({
    // trip_id: z.string().min(1, "Trip ID is required"),
    title: z
      .string()
      .min(1, "Title is required")
      .min(3, "Title must be at least 3 characters"),
    description: z.string().optional(),
    // date: z.string().min(1, "Date is required"),
    start_time: z.string().optional(),
    end_time: z.string().optional(),
    category: z.number().optional(),
    location: z.string().optional(),
    address: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    cost: z.number().min(0, "Cost must be non-negative").optional(),
    currency: z.string().optional(),
    assigned_to: z.string().optional(),
    status: z.number().optional(),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.start_time && data.end_time) {
        return data.start_time < data.end_time;
      }
      return true;
    },
    {
      message: "End time must be after start time",
      path: ["end_time"],
    }
  );

export type CreateActivityFormData = z.infer<typeof createActivitySchema>;
