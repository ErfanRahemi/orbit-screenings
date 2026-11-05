'use client';

import React from 'react';
import { Printer } from 'lucide-react';

export default function PrintButton() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <button
      onClick={handlePrint}
      className="btn-cosmic px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-glow"
    >
      <Printer className="w-4 h-4" />
      <span>چاپ یا ذخیره بلیت (PDF)</span>
    </button>
  );
}
