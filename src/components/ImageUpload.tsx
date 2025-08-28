"use client";

import { useState } from "react";
import { CldUploadWidget } from "next-cloudinary";

interface ImageUploadProps {
  onSuccess: (result: any) => void;
  folder?: string;
  className?: string;
  children: React.ReactNode;
}

export default function ImageUpload({
  onSuccess,
  folder,
  children,
  className,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!uploadPreset) {
    throw new Error(
      "Cloudinary upload preset is not defined. Please set NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET."
    );
  }

  return (
    <CldUploadWidget
      uploadPreset={uploadPreset}
      options={{
        folder: folder || "uploads",
show
        sources: ["local", "url", "camera"],
        multiple: true,
        clientAllowedFormats: ["jpg", "jpeg", "png",  "webp"], // ✅ only images allowed
        resourceType: "image", // ✅ enforce image uploads
      }}
      onSuccess={(result: any,{widget}) => {
        if (result?.event === "queues-start") {
          setIsUploading(true);
        }

        if (result?.event === "success") {
          setIsUploading(false);
          console.log("UPLOAD SUCCESS INFO:", result.info);
widget.close()
          if (result.info) {
            onSuccess(result.info);
          }
        }

        if (result?.event === "queues-end") {
          setIsUploading(false);
        }
      }}
    >
      {(options) => (
        <button
          type="button"
          aria-label="Upload image"
          onClick={() => options?.open?.()}
          disabled={isUploading}
          className={`relative px-4 py-2 ${className} bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50`}
        >
          {isUploading ? "Uploading..." : children}
        </button>
      )}
    </CldUploadWidget>
  );
}
