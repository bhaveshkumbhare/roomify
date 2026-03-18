"use client";

import React, { useState, useRef } from "react";
import { useOutletContext } from "react-router";
import {
  PROGRESS_INTERVAL_MS,
  PROGRESS_STEP,
  REDIRECT_DELAY_MS,
} from "lib/constants";

type AuthContext = {
  authState: {
    isSignedIn: boolean;
  };
};

type UploadProps = {
  onComplete: (base64: string) => void;
};

const Upload: React.FC<UploadProps> = ({ onComplete }) => {
  const { authState } = useOutletContext<AuthContext>();
  

  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState("");

  const inputRef = useRef<HTMLInputElement | null>(null);

  /* =========================
     FILE PROCESSING
  ========================= */
const processFile = (file: File) => {
  console.log("Processing file:", file.name); // ✅ MUST PRINT

  // 🔥 TEMP REMOVE VALIDATION
  // if (!file.type.startsWith("image/")) return;

  const reader = new FileReader();

  reader.onload = () => {
    console.log("File read complete"); // ✅ MUST PRINT

    const base64 = reader.result as string;

    let currentProgress = 0;

    const interval = setInterval(() => {
      currentProgress += PROGRESS_STEP;

      console.log("Progress:", currentProgress); // ✅ MUST PRINT

      if (currentProgress >= 100) {
        clearInterval(interval);

        setTimeout(() => {
          console.log("Calling onComplete"); // ✅ MUST PRINT
          onComplete(base64);
        }, REDIRECT_DELAY_MS);
      }

      setProgress(currentProgress);
    }, PROGRESS_INTERVAL_MS);
  };

  reader.onerror = () => {
    console.log("File reading failed ❌");
  };

  reader.readAsDataURL(file);

};

  /* =========================
     INPUT CHANGE
  ========================= */
 const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  console.log("File selected");

  const file = e.target.files?.[0];

  if (!file) {
    console.log("No file found ❌");
    return;
  }

  console.log("Calling processFile..."); // ✅ DEBUG
  processFile(file);
};

  /* =========================
     DRAG HANDLERS
  ========================= */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!authState.isSignedIn) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (!authState.isSignedIn) return;

    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };
  
  /* =========================
     CLICK TRIGGER
  ========================= */
  const handleClick = () => {
    console.log("Clicked upload");
  if (!authState.isSignedIn) {
    alert("Please login first");
    return;
  }
  inputRef.current?.click();
  
};

  return (
    <div className="upload">
      <div
        className={`dropzone ${isDragging ? "is-dragging" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={inputRef}
          type="file"
          className="drop-input"
          onChange={handleChange}
          accept="image/*"
          style={{ display: "none" }}
        />

       <div className="drop-content">

  {progress === 0 ? (
    <>
      <div className="drop-icon">📁</div>

      {!authState.isSignedIn ? (
        <p>Please log in to upload</p>
      ) : (
        <>
          <p>Drag & drop or click to upload</p>
          <span className="help">PNG, JPG supported</span>
        </>
      )}
    </>
  ) : (
    <div className="flex flex-col items-center justify-center text-center w-full">

      {/* ✅ Success Icon */}
      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
        ✔
      </div>

      {/* ✅ File Name */}
      <h3 className="text-sm font-bold truncate max-w-full px-4">
        {fileName}
      </h3>

      {/* ✅ Progress Bar */}
      <div className="w-full  max-w-xs h-1.5  bg-zinc-200 rounded-full mt-3 overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ✅ Percentage */}
      <p className="text-xs text-zinc-500 mt-2">
        {progress}%
      </p>

    </div>
  )}

</div>
      </div>
    </div>
  );
};

export default Upload;