"use client";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import clsx from "clsx";
import { Control, FieldPath, FieldValues } from "react-hook-form";

interface FormInputProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  placeholder?: string;
  type?: string;
  className?: string;
  required?: boolean;
  step?: string | number;
  onChange?: (value: string) => void;
  readonly?: boolean;
  value?: string;
}

export function FormInput<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = "text",
  className,
  required = false,
  step,
  onChange,
  readonly = false,
  value,
}: FormInputProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={clsx(className)}>
          <FormLabel>
            {label}
            <p className="text-red-500">{required && " *"}</p>
          </FormLabel>
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              step={step}
              {...field}
              className={clsx(readonly && "bg-gray-100 focus-visible:ring-0 focus:border-gray-200 focus-visible:border-ring focus-visible:shadow-none ")}
              readOnly={readonly}
              value={value !== undefined ? value : field.value}
              onChange={(e) => {
                field.onChange(e);
                if (onChange) onChange(e.target.value);
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
