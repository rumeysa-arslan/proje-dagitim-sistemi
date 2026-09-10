"use client";

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/superadmin/logout', {
        method: 'POST',
      });

      if (response.ok) {
        router.push('/superadmin/login');
        router.refresh(); 
      } else {
        alert("Çıkış yapılamadı, lütfen tekrar deneyin.");
      }
    } catch (error) {
      console.error("Çıkış hatası:", error);
    }
  };

  return (
    <button 
      onClick={handleLogout}
      className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 font-medium px-4 py-2 rounded-lg transition-colors border border-red-200"
    >
     Çıkış Yap
    </button>
  );
}