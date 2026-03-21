"use client";

import { useState } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface UploadParams {
  file: File;
  userId: Id<"users">;
  userDescription?: string;
  latitude?: number;
  longitude?: number;
}

export function useUploadIssue() {
  const generateUploadUrl = useMutation(api.issues.generateUploadUrl);
  const createIssue = useMutation(api.issues.createFromUpload);
  const triggerAnalysis = useAction(api.issues.triggerN8nAnalysis);

  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(params: UploadParams): Promise<Id<"issues"> | null> {
    setIsUploading(true);
    setError(null);

    try {
      const uploadUrl = await generateUploadUrl();

      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": params.file.type },
        body: params.file,
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      }

      const { storageId } = (await uploadResponse.json()) as {
        storageId: Id<"_storage">;
      };

      const issueId = await createIssue({
        storageId,
        user_id: params.userId,
        user_description: params.userDescription,
        latitude: params.latitude,
        longitude: params.longitude,
      });

      triggerAnalysis({
        issueId,
        storageId,
        userId: params.userId,
        userDescription: params.userDescription,
        latitude: params.latitude,
        longitude: params.longitude,
      });

      return issueId;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload error";
      setError(msg);
      return null;
    } finally {
      setIsUploading(false);
    }
  }

  return { upload, isUploading, error };
}
