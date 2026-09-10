"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; 


export default function TenantTable({ tenants }: { tenants: any[] }) {
  const router = useRouter();

  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState(''); 
  const [adminFormData, setAdminFormData] = useState({ name: '', email: '', password: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', slug: '', plan: 'FREE' });
  const filteredTenants = tenants.filter((tenant) => {
    const lowerCaseSearch = searchTerm.toLowerCase();
    return (
      tenant.name.toLowerCase().includes(lowerCaseSearch) ||
      tenant.slug.toLowerCase().includes(lowerCaseSearch)
    );
  });

  const handleToggle = async (tenantId: string) => {
    try {
      const response = await fetch('/api/superadmin/tenant/toggle', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ tenantId }),
      });

      if (response.ok) {
        router.refresh(); 
      } else {
        const errorData = await response.json();
        alert(`Hata: ${errorData.message}`);
      }
    } catch (error) {
      console.error("İstek başarısız:", error);
      alert("Bir bağlantı hatası oluştu.");
    }
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
        const response = await fetch('/api/superadmin/tenant' ,{
            method: 'POST',
            headers: { 'Content-Type' : 'application/json'},
            body: JSON.stringify(formData),
        });

        if (response.ok){
            setFormData({name: '' , slug: '' , plan:'FREE'});
            setIsModalOpen(false);
            router.refresh();
        }   else{
            const errorData = await response.json();
            alert(`Hata: ${errorData.message}`);
        }
    }   catch (error){
        alert("Şirket kaydedilirken bir hata ooluştu.");
    }   finally{
        setIsSubmitting(false)
    }    
  };

 const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/superadmin/tenant/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...adminFormData,
          tenantId: selectedTenantId 
        }),
      });

      if (response.ok) {
        setAdminFormData({ name: '', email: '', password: '' });
        setIsAdminModalOpen(false);
        alert('Yönetici başarıyla eklendi!');
      } else {
        const errorData = await response.json();
        alert(`Hata: ${errorData.message}`);
      }
    } catch (error) {
      alert("Yönetici kaydedilirken bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

return (
  <div className="bg-white rounded-lg shadow-md border overflow-hidden relative">
    
    {/* Üst Bar: Arama Kutusu ve Ekleme Butonu */}
    <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
      <div className="flex items-center w-1/2">
        <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Şirket adı veya slug ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent border-none focus:ring-0 text-sm text-gray-700 placeholder-gray-400 outline-none"
        />
      </div>
      
      <button 
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        + Yeni Şirket Ekle
      </button>
    </div>

    {/* Tablo Alanı */}
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="bg-gray-100 text-gray-700 border-b">
          <th className="p-4 font-semibold">Şirket Adı</th>
          <th className="p-4 font-semibold">Slug</th>
          <th className="p-4 font-semibold">Plan</th>
          <th className="p-4 font-semibold">Durum</th>
          <th className="p-4 font-semibold">İşlemler</th>
        </tr>
      </thead>
      <tbody>
        {filteredTenants.map((tenant) => (
          <tr key={tenant.id} className="border-b hover:bg-gray-50">
            <td className="p-4">{tenant.name}</td>
            <td className="p-4">{tenant.slug}</td>
            <td className="p-4 font-medium">{tenant.plan}</td>
            <td className="p-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                tenant.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {tenant.isActive ? 'Aktif' : 'Pasif'}
              </span>
            </td>
            <td className="p-4 flex gap-2 items-center">
              <button 
                onClick={() => handleToggle(tenant.id)}
                className={`px-3 py-1.5 rounded text-xs font-medium text-white transition-colors ${
                  tenant.isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {tenant.isActive ? 'Pasife Al' : 'Aktif Et'}
              </button>

              <button 
                onClick={() => {
                  setSelectedTenantId(tenant.id);
                  setIsAdminModalOpen(true);
                }}
                className="px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded text-xs font-medium transition-colors"
              >
                + Admin Ata
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    {filteredTenants.length === 0 && (
      <div className="p-8 text-center text-gray-500">
        Kayıt bulunamadı.
      </div>
    )}

    {/* YENİ ŞİRKET EKLEME MODALI */}
    {isModalOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">Yeni Şirket Oluştur</h3>
            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <form onSubmit={handleCreateTenant}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Şirket Adı</label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({ ...formData, name: val, slug: val.toLowerCase().replace(/[^a-z0-9]+/g, '-') });
                }}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Örn: Akbank"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL Uzantısı)</label>
              <input 
                type="text" 
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase() })}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50"
                placeholder="Örn: akbank"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Abonelik Planı</label>
              <select 
                value={formData.plan}
                onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="FREE">FREE</option>
                <option value="PRO">PRO</option>
                <option value="ENTERPRISE">ENTERPRISE</option>
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                İptal
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* ADMİN EKLEME MODALI */}
    {isAdminModalOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">Kurucu Admin Ata</h3>
            <button onClick={() => setIsAdminModalOpen(false)} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <form onSubmit={handleCreateAdmin}>
            <div className="mb-4">
            {/* Mevcut Adminler Listesi */}
            {tenants.find((t: any) => t.id === selectedTenantId)?.users?.length > 0 && (
              <div className="mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <h3 className="text-xs font-semibold text-slate-700 mb-2">Mevcut Adminler</h3>
                <ul className="space-y-2">
                  {tenants.find((t: any) => t.id === selectedTenantId)?.users.map((admin: any) => (
                    <li key={admin.id} className="flex justify-between items-center text-xs bg-white p-2 rounded shadow-sm border border-slate-100">
                      <span className="font-bold text-slate-800">{admin.name}</span>
                      <span className="text-slate-500">{admin.email}</span>
                    </li>
                  ))}
                </ul>
              </div>
              )}
              <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
              <input 
                type="text" required
                value={adminFormData.name}
                onChange={(e) => setAdminFormData({ ...adminFormData, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">E-Posta</label>
              <input 
                type="email" required
                value={adminFormData.email}
                onChange={(e) => setAdminFormData({ ...adminFormData, email: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Geçici Şifre</label>
              <input 
                type="text" required minLength={6}
                value={adminFormData.password}
                onChange={(e) => setAdminFormData({ ...adminFormData, password: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button 
                type="button" onClick={() => setIsAdminModalOpen(false)}
                className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
              >
                İptal
              </button>
              <button 
                type="submit" disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
              >
                {isSubmitting ? 'Kaydediliyor...' : 'Admin Ata'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

  </div>
);
}