import clsx from "clsx";

interface MyBadgeProps {
  // Define any props if needed
  icon: React.ReactNode;
  label: string;
  color: string;
}

export default function MyBadge({ icon, label, color }: MyBadgeProps) {
  return (
    <div
      className={clsx(
        "text-xs",
        color || "bg-gray-100 text-gray-800",
        "px-2 py-0.5 rounded-full items-center justify-center flex shrink-0 gap-1"
      )}
    >
      {icon && <span className="h-3 w-3">{icon}</span>}
      {label}
    </div>
  );
}
