import { format } from "date-fns";

export function eachDayOfInterval({ start, end }: { start: Date; end: Date }): Date[] {
  const dates = [];
  let currentDate = start;
  while (currentDate <= end) {
    dates.push(currentDate);
    currentDate = new Date(currentDate);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
}

export function generateDateRange(startDate: string, endDate: string): string[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const dateArray = eachDayOfInterval({ start, end });
  return dateArray.map((d) => format(d, "yyyy-MM-dd"));
}

export function calculateActivityHeight(startTime: string, endTime: string): number {
  const start = parseInt(startTime.split(":")[0]) * 60 + parseInt(startTime.split(":")[1]);
  const end = parseInt(endTime.split(":")[0]) * 60 + parseInt(endTime.split(":")[1]);
  return (end - start) * (48 / 30);
}

export function parseTimeToMinutes(time: string): number {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

export function formatMinutesToTime(minutes: number): string {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

export function checkActivityConflict(
  activities: IActivity[],
  excludeId: string,
  date: string,
  startMinutes: number,
  endMinutes: number
): boolean {
  return activities.some(act => 
    act.uid !== excludeId && 
    act.date === date && 
    act.start_time && act.end_time &&
    parseTimeToMinutes(act.start_time) < endMinutes &&
    parseTimeToMinutes(act.end_time) > startMinutes
  );
}
