'use client';

import { useEffect, useState, useRef } from 'react';

interface Props {
  isFocusPassword: boolean;
  passwordLength: number;
  emailLength: number;
  isWrongPassword?: boolean;
}

export default function AnimatedMascot({
  isFocusPassword,
  passwordLength,
  emailLength,
  isWrongPassword = false,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || isFocusPassword || isWrongPassword) return;

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      const angle = Math.atan2(deltaY, deltaX);

      const distance = Math.min(Math.hypot(deltaX, deltaY) / 25, 4.5);

      setPupilOffset({
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isFocusPassword, isWrongPassword]);

  // ⚡ SADECE şifre kutusunda odaklanmışken gözünü kapatsın!
  const isCoveringEyes = isFocusPassword && !isWrongPassword;

  return (
    <div ref={containerRef} className="flex justify-center mb-4">
      <div
        className={`relative w-28 h-28 bg-indigo-100 rounded-full flex items-center justify-center border-4 border-white shadow-md overflow-hidden transition-all duration-300 ${
          isWrongPassword ? 'animate-bounce' : ''
        }`}
      >
        <svg viewBox="0 0 100 100" className="w-24 h-24">
          {/* Kulaklar */}
          <circle cx="22" cy="38" r="8" fill="#4F46E5" />
          <circle cx="78" cy="38" r="8" fill="#4F46E5" />

          {/* Kafa */}
          <circle cx="50" cy="50" r="32" fill="#6366F1" />

          {/* Yüz Beyazlığı */}
          <ellipse cx="50" cy="58" rx="22" ry="18" fill="#FFFFFF" />

          {/* Burun */}
          <polygon points="47,54 53,54 50,58" fill="#312E81" />

          {/* Ağız */}
          {isWrongPassword ? (
            <path d="M 42 58 Q 50 68 58 58 Z" fill="#312E81" />
          ) : (
            <path d="M 46 60 Q 50 63 54 60" fill="none" stroke="#312E81" strokeWidth="2" strokeLinecap="round" />
          )}

          {/* Gözler */}
          {isWrongPassword ? (
            <g fill="none" stroke="#1E1B4B" strokeWidth="2.5" strokeLinecap="round">
              <path d="M 33 47 Q 38 41 43 47" />
              <path d="M 57 47 Q 62 41 67 47" />
            </g>
          ) : (
            <>
              {/* Sol Göz */}
              <circle cx="38" cy="46" r="6" fill="#FFFFFF" />
              <circle
                cx={38 + pupilOffset.x}
                cy={46 + pupilOffset.y}
                r="3"
                fill="#1E1B4B"
                className="transition-all duration-75 ease-out"
              />

              {/* Sağ Göz */}
              <circle cx="62" cy="46" r="6" fill="#FFFFFF" />
              <circle
                cx={62 + pupilOffset.x}
                cy={46 + pupilOffset.y}
                r="3"
                fill="#1E1B4B"
                className="transition-all duration-75 ease-out"
              />
            </>
          )}

          {/* Sol Pati */}
          <ellipse
            cx="32"
            cy="70"
            rx="10"
            ry="12"
            fill="#4F46E5"
            stroke="#FFFFFF"
            strokeWidth="2"
            className="transition-all duration-300 ease-out origin-bottom-left"
            style={{
              transform: isCoveringEyes
                ? 'translate(6px, -28px) rotate(15deg)'
                : 'translate(0px, 0px)',
            }}
          />

          {/* Sağ Pati */}
          <ellipse
            cx="68"
            cy="70"
            rx="10"
            ry="12"
            fill="#4F46E5"
            stroke="#FFFFFF"
            strokeWidth="2"
            className="transition-all duration-300 ease-out origin-bottom-right"
            style={{
              transform: isCoveringEyes
                ? 'translate(-6px, -28px) rotate(-15deg)'
                : 'translate(0px, 0px)',
            }}
          />
        </svg>
      </div>
    </div>
  );
}