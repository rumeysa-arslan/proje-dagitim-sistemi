'use client';

interface AnimatedTrashBtnProps {
  onDelete: () => void;
  title?: string;
  isLidOpen?: boolean; // Animasyonlu silme efekti için opsiyonel durum
}

export default function AnimatedTrashBtn({
  onDelete,
  title = 'Sil',
  isLidOpen = false,
}: AnimatedTrashBtnProps) {
  return (
    <button
      type="button"
      onClick={onDelete}
      className="group relative p-2 text-gray-400 hover:text-red-600 transition cursor-pointer"
      title={title}
    >
      <div className="relative w-8 h-8 flex items-end justify-center">
        {/* Üstüne gelince fırlayan kedi */}
        <span
          className={`absolute text-base transition-all duration-300 ease-out transform z-0 ${
            isLidOpen
              ? '-translate-y-3 opacity-100'
              : 'translate-y-2 opacity-0 group-hover:-translate-y-3 group-hover:opacity-100'
          }`}
        >
          🐱
        </span>

        {/* Çöp Kutusu Gövde ve Kapağı */}
        <div className="relative z-10 w-6 h-6 flex flex-col items-center justify-end">
          <span
            className={`w-5 h-0.5 bg-current rounded-t-sm transition-transform duration-300 origin-right ${
              isLidOpen
                ? '-rotate-45 -translate-y-1'
                : 'group-hover:-rotate-45 group-hover:-translate-y-1'
            }`}
          />
          <span className="w-6 h-[1px] bg-current/80 rounded-full my-[1px]" />
          <span className="w-4 h-3.5 border-2 border-current rounded-b-md border-t-0" />
        </div>
      </div>
    </button>
  );
}