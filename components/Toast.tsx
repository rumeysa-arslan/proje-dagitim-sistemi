'use client';

import { useEffect } from "react";
interface ToastProps{
    message:string;
    type: 'success' | 'error';
    onClose: () => void;
}

export default function Toast ({ message, type, onClose}: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
    <div className="fixed top-5 right-5 z-50 animate-bounce">
      <div
        className={`px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold flex items-center gap-2 ${
          type === 'success'
            ? 'bg-green-500 text-white border-green-600'
            : 'bg-red-500 text-white border-red-600'
        }`}
      >
        <span>{type === 'success' ? '✅' : '⚠️'}</span>
        <span>{message}</span>
      </div>
    </div>
  );
}