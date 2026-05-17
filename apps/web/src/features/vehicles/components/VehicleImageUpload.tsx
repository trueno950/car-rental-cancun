"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";

import { Button } from "@shared/components/ui";

import { uploadVehicleImageAction } from "../actions/vehicle-actions";

type VehicleImageUploadProps = {
  value: string | null;
  onChange: (url: string | null) => void;
  labels: {
    upload: string;
    change: string;
    remove: string;
    uploading: string;
    error: string;
  };
};

export function VehicleImageUpload({
  value,
  onChange,
  labels,
}: VehicleImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [uploadError, setUploadError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    const formData = new FormData();
    formData.append("file", file);

    startTransition(async () => {
      try {
        const url = await uploadVehicleImageAction(formData);
        onChange(url);
      } catch {
        setUploadError(labels.error);
      }
    });

    e.target.value = "";
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

      {value ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-muted">
          <Image
            src={value}
            alt="Vehicle"
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 640px"
          />
          <div className="absolute top-2 right-2 flex gap-1.5">
            <Button
              type="button"
              size="icon-sm"
              variant="secondary"
              onClick={() => inputRef.current?.click()}
              disabled={isPending}
              aria-label={labels.change}
            >
              <Upload className="size-3" />
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="destructive"
              onClick={() => onChange(null)}
              disabled={isPending}
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
          disabled={isPending}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-muted/30 px-4 py-10 text-sm text-muted-foreground transition-colors hover:bg-muted/50 disabled:opacity-50 cursor-pointer"
        >
          <Upload className="size-5" />
          {isPending ? labels.uploading : labels.upload}
        </button>
      )}

      {uploadError && <p className="text-xs text-destructive">{uploadError}</p>}
    </div>
  );
}
