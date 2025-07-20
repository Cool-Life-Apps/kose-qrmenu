import React from "react";

export default function AdminSpinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center w-full h-full z-50 bg-white">
      <div className="flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <p className="mt-4 text-gray-600 font-medium">Yükleniyor...</p>
      </div>
    </div>
  );
} 