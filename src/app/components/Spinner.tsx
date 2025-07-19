import React from "react";
import Image from "next/image";

export default function Spinner({ business }: { business?: string }) {
  // Logo ve arkaplan rengi seçimi
  const isPastane = business === "pastane";
  const bgColor = isPastane ? "#601e27" : "#000";
  const logoSrc = isPastane
    ? "/logo_curlique_eatery.png"
    : "/logo_ramazan_karahan_kuafor.png";

  return (
    <div
      className="fixed inset-0 flex items-center justify-center w-full h-full z-50"
      style={{ background: bgColor }}
    >
      <div className="flex flex-col items-center justify-center">
        <Image
          src={logoSrc}
          alt="Logo"
          width={isPastane ? 160 : 120}
          height={isPastane ? 90 : 120}
          className="animate-logo-bounce"
          priority
        />
      </div>
      <style jsx global>{`
        @keyframes logo-bounce {
          0% { transform: scale(1); }
          50% { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
        .animate-logo-bounce {
          animation: logo-bounce 1.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
} 