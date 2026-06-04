"use client";

import { useState } from "react";

type FilePreviewInputProps = {
  label: string;
  onPreview: (preview: string, fileName: string) => void;
};

export function FilePreviewInput({ label, onPreview }: FilePreviewInputProps) {
  const [preview, setPreview] = useState("");
  const [fileName, setFileName] = useState("");

  function resizeImage(value: string) {
    return new Promise<string>((resolve) => {
      const image = new Image();
      image.onload = () => {
        const maxSize = 360;
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext("2d");
        if (!context) {
          resolve(value);
          return;
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.78));
      };
      image.onerror = () => resolve(value);
      image.src = value;
    });
  }

  function handleFile(file?: File) {
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = async () => {
      const value = String(reader.result || "");
      const resized = await resizeImage(value);
      setPreview(resized);
      onPreview(resized, file.name);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div>
      <span className="mb-2 block font-black">{label}</span>
      <label className="flex min-h-24 cursor-pointer items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-3 text-center text-sm font-bold text-slate-500">
        <input accept="image/*" className="sr-only" onChange={(event) => handleFile(event.target.files?.[0])} type="file" />
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt={fileName} className="h-24 w-full rounded-xl object-cover" src={preview} />
        ) : (
          <span>Tap to upload photo</span>
        )}
      </label>
      {fileName ? <p className="mt-2 text-xs font-bold text-emerald-700">{fileName} selected</p> : null}
      <p className="mt-1 text-xs text-slate-500">Preview ready. Permanent upload will use Supabase Storage.</p>
    </div>
  );
}
