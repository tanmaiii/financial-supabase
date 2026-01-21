import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FormField from "./FormField";

interface SelectOption {
  value: string;
  label: string;
}

interface FormSelectProps {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  value?: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  renderOption?: (option: SelectOption) => React.ReactNode;
}

export default function FormSelect({
  label,
  name,
  placeholder = "Select an option",
  required = false,
  error,
  value,
  onValueChange,
  options,
  renderOption,
}: FormSelectProps) {
  return (
    <FormField label={label} htmlFor={name} required={required} error={error}>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id={name} className={error ? "border-destructive" : ""}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {renderOption ? renderOption(option) : option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  );
}
