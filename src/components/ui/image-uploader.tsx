"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploaderProps {
  /** Current image URL (may be null/undefined if none set) */
  value: string | null | undefined;
  /** Called after a successful upload with the new URL */
  onChange: (url: string | null) => void;
  /** Whether this is an avatar (round) or logo (square). Affects shape. */
  kind: "avatar" | "logo";
  /** Fallback initials or short label displayed when no image is set */
  fallback?: string;
  /** Display label shown above the control */
  label?: string;
  /** Helper text below the control */
  helperText?: string;
}

export function ImageUploader({
  value,
  onChange,
  kind,
  fallback,
  label,
  helperText,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shape = kind === "avatar" ? "rounded-full" : "rounded-2xl";

  async function handleFile(file: File) {
    setError(null);
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", kind);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = (await res.json()) as { url?: string; error?: string };

      if (!res.ok || !data.url) {
        setError(data.error ?? "Upload failed");
        return;
      }

      onChange(data.url);
    } catch {
      setError("Upload failed. Check your connection and try again.");
    } finally {
      setIsUploading(false);
    }
  }

  function handleClear() {
    setError(null);
    onChange(null);
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium leading-none text-foreground">
          {label}
        </label>
      )}
      <div className="flex items-center gap-4">
        <div
          className={`relative flex size-24 shrink-0 items-center justify-center overflow-hidden border border-gray-200 bg-gray-50 ${shape}`}
        >
          {value ? (
            <Image
              src={value}
              alt={label ?? "Uploaded image"}
              fill
              sizes="96px"
              className="object-cover"
            />
          ) : (
            <span className="text-xl font-semibold text-gray-400">
              {fallback ?? (kind === "avatar" ? "?" : "LOGO")}
            </span>
          )}
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Loader2 className="size-6 animate-spin text-white" />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isUploading}
              onClick={() => inputRef.current?.click()}
              className="gap-2"
            >
              <Upload className="size-4" />
              {value ? "Replace" : "Upload"}
            </Button>
            {value && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isUploading}
                onClick={handleClear}
                className="gap-2 text-muted-foreground"
              >
                <X className="size-4" />
                Remove
              </Button>
            )}
          </div>
          {helperText && (
            <p className="text-xs text-muted-foreground">{helperText}</p>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
