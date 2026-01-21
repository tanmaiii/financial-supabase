import React from "react";
import { UseFormRegisterReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import FormField from "./FormField";

interface FormInputProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  register: UseFormRegisterReturn;
  step?: string;
  rows?: number;
}

export default function FormInput({
  label,
  name,
  type = "text",
  placeholder,
  required = false,
  error,
  register,
  step,
}: FormInputProps) {
  return (
    <FormField label={label} htmlFor={name} required={required} error={error}>
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        step={step}
        {...register}
        className={error ? "border-destructive" : ""}
      />
    </FormField>
  );
}
