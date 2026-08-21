'use client';

import AnimatedTrashBtn from '@/components/AnimatedTrashBtn';

interface FloatingTrashBtnProps {
  onClick: () => void;
  count?: number;
}

export default function FloatingTrashBtn({ onClick, count = 0 }: FloatingTrashBtnProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative group flex items-center justify-center">
        {/* 🔴 Sabit 64x64 Boyutunda Orantılı Kırmızı Daire */}
        <div 
          onClick={onClick}
          className="w-16 h-16 bg-red-600 hover:bg-red-700 active:scale-95 transition-all duration-200 rounded-full shadow-2xl flex items-center justify-center cursor-pointer border-2 border-white/30 transform hover:scale-105"
        >
          <div className="scale-125 flex items-center justify-center pointer-events-none">
            <AnimatedTrashBtn onDelete={onClick} />
          </div>
        </div>

        {/* 🔴 Çöp Sayısı Bildirimi */}
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-black min-w-[22px] h-[22px] px-1 rounded-full flex items-center justify-center border-2 border-white shadow-md animate-bounce pointer-events-none">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </div>
    </div>
  );
}