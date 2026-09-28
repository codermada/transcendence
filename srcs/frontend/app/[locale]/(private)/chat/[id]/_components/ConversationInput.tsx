"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { Close, Loader2, Paperclip, Send } from "@/components/icons";
import type { SelectedFile } from "./conversation.types";

interface ConversationInputProps {
  inputValue: string;
  setInputValue: (val: string) => void;
  selectedFiles: SelectedFile[];
  onAddFiles: (files: FileList | File[]) => void;
  onRemoveFile: (id: string) => void;
  onSend: () => void;
  disabled: boolean;
  isSending: boolean;
  canSend: boolean;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export function ConversationInput({
  inputValue,
  setInputValue,
  selectedFiles,
  onAddFiles,
  onRemoveFile,
  onSend,
  disabled,
  isSending,
  canSend,
  inputRef,
}: ConversationInputProps) {
  const t = useTranslations("Chat");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onAddFiles(e.target.files);
      e.target.value = "";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="border-t border-zinc-200/80 pt-3 dark:border-zinc-800">
      {/* File Previews */}
      {selectedFiles.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {selectedFiles.map((item) => (
            <div
              key={item.id}
              className="relative flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-1.5 pr-2 text-xs dark:border-zinc-800 dark:bg-zinc-800/60"
            >
              {item.isImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.previewUrl}
                  alt={item.file.name}
                  className="h-8 w-8 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400">
                  <Paperclip className="h-4 w-4" />
                </div>
              )}
              <span className="max-w-30 truncate font-medium text-zinc-700 dark:text-zinc-300">
                {item.file.name}
              </span>
              <button
                type="button"
                onClick={() => onRemoveFile(item.id)}
                disabled={isSending}
                className="cursor-pointer rounded-full p-1 text-zinc-400 transition hover:bg-zinc-200 hover:text-zinc-700 disabled:opacity-40 dark:hover:bg-zinc-700 dark:hover:text-white"
                aria-label={t("close")}
              >
                <Close className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isSending}
          title={t("attachment")}
          aria-label={t("attachment")}
          className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
        >
          <Paperclip className="h-5 w-5" />
        </button>

        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("typeMessagePlaceholder")}
          disabled={disabled || isSending}
          className="flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
        />

        <button
          type="button"
          onClick={onSend}
          disabled={!canSend || isSending || disabled}
          aria-label={t("sendMessage")}
          className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-violet-600 text-white shadow-md shadow-violet-500/20 transition hover:bg-violet-500 active:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
