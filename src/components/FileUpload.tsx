"use client";
import { Inbox } from "lucide-react";
import React from "react";
import { useDropzone } from "react-dropzone";
import { uploadS3 } from "@/lib/s3";

type Props = {};

const FileUpload = (props: Props) => {
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
    onDrop: async (files) => {
      console.log(files);
      const file = files[0];
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        return;
      }
      try {
        const data = await uploadS3(file);
        console.log(data);
      } catch (error) {
        console.error(error);
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
        <>
          <Inbox size={48} className="w-10 h-10" />
          <p className="mt-2 text-sm">Drop PDF HERE</p>
        </>
      </div>
    </div>
  );
};

export default FileUpload;
