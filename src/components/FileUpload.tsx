"use client";
import React from "react";
import axios from "axios";
import { Inbox, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useDropzone } from "react-dropzone";
import { toast } from "react-hot-toast";
import { uploadS3 } from "@/lib/s3";

type Props = {};

const FileUpload = (props: Props) => {
  const [uploading, setUploading] = React.useState(false);
  const { mutate, isLoading } = useMutation({
    mutationFn: async ({
      file_key,
      file_name,
    }: {
      file_key: string;
      file_name: string;
    }) => {
      const response = await axios.post("/api/create-chat", {
        file_key,
        file_name,
      });
      return response.data;
    },
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
    onDrop: async (files) => {
      console.log(files);
      const file = files[0];
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      try {
        setUploading(true);
        const data = await uploadS3(file);
        if (!data?.file_key || !data?.file_name) {
          toast.error("Error uploading file");
          return;
        }
        mutate(data, {
          onSuccess: (data) => {
            console.log(data);
            toast.success("File uploaded successfully");
          },
          onError: (error) => {
            toast.error("Error uploading file");
          },
        });
        console.log(data);
      } catch (error) {
        console.error(error);
      } finally {
        setUploading(false);
      }
    },
  });
  return (
    <div className="p-2 bg-white rounded-xl">
      <div
        {...getRootProps({
          className:
            "p-2 bg-white rounded-xl border-2 border-gray-300 border-dashed flex flex-col items-center justify-center",
        })}
      >
        <input {...getInputProps()} />
        {uploading || isLoading ? (
          <>
            {/* loading state */}
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
            <p className="mt-2 text-sm text-slate-400">
              Spilling Tea to GPT...
            </p>
          </>
        ) : (
          <>
            <Inbox className="w-10 h-10 text-gray-500" />
            <p className="mt-2 text-sm text-slate-400">Drop PDF Here</p>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
