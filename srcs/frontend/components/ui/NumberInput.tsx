"use client";

import { InputHTMLAttributes } from "react";
import { Input } from "./Input";

interface NumberInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value: number;
  onValueChange: (value: number) => void;
}

export function NumberInput({
  value,
  onValueChange,
  ...props
}: NumberInputProps) {
  return (
    <Input
      type="number"
      value={value}
      onChange={(e) => onValueChange(Number(e.target.value))}
      {...props}
    />
  );
}