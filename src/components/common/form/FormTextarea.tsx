import React from "react";
import { Textarea } from "@/components/ui/textarea";
import FormField from "./FormField";
import { UseFormRegisterReturn } from "react-hook-form";

interface FormTextareaProps {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  register: UseFormRegisterReturn;
  rows?: number;
}

export default function FormTextarea({
  label,
  name,
  placeholder,
  required = false,
  error,
  register,
  rows = 3,
}: FormTextareaProps) {
  return (
    <FormField label={label} htmlFor={name} required={required} error={error}>
      <Textarea
        id={name}
        placeholder={placeholder}
        rows={rows}
        {...register}
        className={error ? "border-destructive" : ""}
      />
    </FormField>
  );
}
