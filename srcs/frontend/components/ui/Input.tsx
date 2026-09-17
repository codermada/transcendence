import { InputHTMLAttributes, forwardRef } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`
          input-field

          w-full
          rounded-lg
          border
          border-border
          bg-background

          px-4
          py-3

          text-sm
          text-foreground
          caret-brand-400

          outline-none
          transition-all
          duration-200

          placeholder:text-muted/60

          hover:border-border-hover

          focus:border-brand-500
          focus:ring-2
          focus:ring-brand-500/20
          focus:shadow-[0_0_20px_rgb(139_92_246_/_0.08)]

          disabled:cursor-not-allowed
          disabled:opacity-50

          read-only:bg-surface

          ${className}
        `}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
