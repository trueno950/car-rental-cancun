"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";

import { Button } from "@shared/components/ui";

type VehicleImageUploadProps = {
  value: string | null;
  pendingFile: File | null;
  onChange: (url: string | null) => void;
  onFileSelect: (file: File | null) => void;
  labels: {
    upload: string;
    change: string;
    remove: string;
    uploading?: string;
    error?: string;
  };
};

export function VehicleImageUpload({
  value,
  pendingFile,
  onChange,
  onFileSelect,
  labels,
}: VehicleImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!pendingFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(pendingFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [pendingFile]);

  const displayUrl = previewUrl ?? value;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    onFileSelect(file);
    e.target.value = "";
  }

  function handleRemove() {
    onFileSelect(null);
    onChange(null);
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {displayUrl ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-muted">
          {previewUrl ? (
            // Local blob preview — plain img, no Next.js optimization needed
            // biome-ignore lint: blob URLs can't go through Next.js Image
            <img
              src={previewUrl}
              alt="Vehicle preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <Image
              src={value!}
              alt="Vehicle"
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 640px"
            />
          )}
          <div className="absolute top-2 right-2 flex gap-1.5">
            <Button
              type="button"
              size="icon-sm"
              variant="secondary"
              onClick={() => inputRef.current?.click()}
              aria-label={labels.change}
            >
              <Upload className="size-3" />
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="destructive"
              onClick={handleRemove}
              aria-label={labels.remove}
            >
              <X className="size-3" />
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-muted/30 px-4 py-10 text-sm text-muted-foreground transition-colors hover:bg-muted/50 cursor-pointer"
        >
          <Upload className="size-5" />
          {labels.upload}
        </button>
      )}
    </div>
  );
}
