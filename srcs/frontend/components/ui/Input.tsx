import { InputHTMLAttributes, forwardRef } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`
          w-full
          rounded-xl
          border
          border-zinc-300
          bg-white
          px-4
          py-2.5
          text-sm
          font-medium
          text-zinc-900
          caret-violet-600
          outline-none
          transition-all
          duration-200

          placeholder:text-zinc-400

          hover:border-zinc-400

          focus:border-violet-500
          focus:ring-2
          focus:ring-violet-500/20

          dark:border-zinc-800
          dark:bg-zinc-950
          dark:text-white
          dark:caret-violet-400
          dark:placeholder:text-zinc-500
          dark:hover:border-zinc-700
          dark:focus:border-violet-400
          dark:focus:shadow-[0_0_20px_rgb(139_92_246_/_0.08)]

          disabled:cursor-not-allowed
          disabled:opacity-50

          read-only:bg-zinc-50
          dark:read-only:bg-zinc-900

          ${className}
        `}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
