import { Check, Clock, X } from "lucide-react";

export enum EnumActivityStatus {
  plan = 1,
  booked = 2,
  done = 3,
  cancelled = 4,
}

export const EnumLabelsActivityStatus: Record<EnumActivityStatus, string> = {
  [EnumActivityStatus.plan]: "schedule.activity.statusOptions.plan",
  [EnumActivityStatus.booked]: "schedule.activity.statusOptions.booked",
  [EnumActivityStatus.done]: "schedule.activity.statusOptions.done",
  [EnumActivityStatus.cancelled]: "schedule.activity.statusOptions.cancelled",
};

export const EnumIconsActivityStatus: Record<
  number,
  React.ComponentType<{ className?: string }>
> = {
  [EnumActivityStatus.plan]: Clock,
  [EnumActivityStatus.booked]: Check,
  [EnumActivityStatus.done]: Check,
  [EnumActivityStatus.cancelled]: X,
};

export const EnumColorsActivityStatus: Record<EnumActivityStatus, string> = {
  [EnumActivityStatus.plan]: "bg-blue-100 text-blue-800",
  [EnumActivityStatus.booked]: "bg-yellow-100 text-yellow-800",
  [EnumActivityStatus.done]: "bg-green-100 text-green-800",
  [EnumActivityStatus.cancelled]: "bg-red-200 text-red-800",
};
