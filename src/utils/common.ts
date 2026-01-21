export function getEnumOptions(
  enumObj: Record<string, string | number>
): { value: string; label: string }[] {
  return Object.entries(enumObj).map(([value, label]) => ({
    value,
    label: label.toString(),
  }));
}

export const roundTimeToNearest30 = (time: string): string => {
  const [hours, minutes] = time.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes;
  const roundedMinutes = Math.round(totalMinutes / 30) * 30;
  const newHours = Math.floor(roundedMinutes / 60) % 24;
  const newMinutes = roundedMinutes % 60;
  return `${newHours.toString().padStart(2, "0")}:${newMinutes
    .toString()
    .padStart(2, "0")}`;
};
