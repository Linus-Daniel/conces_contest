"use client";

import { useState } from "react";
import { CldUploadWidget } from "next-cloudinary";

interface ImageUploadProps {
  onSuccess: (result: any) => void;
  folder?: string;
  className?: string;
  allowMultiple?: boolean;
  children: React.ReactNode;
}
// ImageUpload.tsx - Enhanced to support better file handling
export default function ImageUpload({
  onSuccess,
  folder,
  children,
  className,
  allowMultiple
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  return (
    <CldUploadWidget
      uploadPreset={uploadPreset}
      options={{
        showCompletedButton: false,
        folder: folder || "uploads",
        sources: ["local", "url", "camera"],
        multiple: allowMultiple || false,
        maxFiles: allowMultiple ? 10 : 1, // Limit multiple uploads
        clientAllowedFormats: ["jpg", "jpeg", "png", "webp", "ai", "svg", "pdf"], // Allow design formats
        resourceType: "auto", // Allow different file types
        maxFileSize: 10000000, // 10MB limit
      }}
      onSuccess={(result: any, { widget }) => {
        if (result?.event === "queues-start") {
          setIsUploading(true);
        }

        if (result?.event === "success") {
          console.log("UPLOAD SUCCESS INFO:", result.info);
          
          if (result.info) {
            onSuccess(result.info);
          }
          
          // Don't close widget for multiple uploads
          if (!allowMultiple) {
            widget.close();
          }
        }

        if (result?.event === "queues-end") {
          setIsUploading(false);
          // Close widget after all uploads complete for multiple mode
          if (allowMultiple) {
            widget.close();
          }
        }
      }}
    >
      {(options) => (
        <button
          type="button"
          aria-label="Upload image"
          onClick={() => options?.open?.()}
          disabled={isUploading}
          className={`relative px-4 py-2 ${className} disabled:opacity-50`}
        >
          {isUploading ? "Uploading..." : children}
        </button>
      )}
    </CldUploadWidget>
  );
}