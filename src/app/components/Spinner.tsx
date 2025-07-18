import React from "react";

export default function Spinner() {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[120px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-orange-500"></div>
    </div>
  );
} 