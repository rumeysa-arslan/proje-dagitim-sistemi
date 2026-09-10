import { prisma } from '@/lib/prisma';
import TenantTable from './TenantTable';
import LogoutButton from './LogoutButton';

export default async function SuperAdminPage(){

  const [totalTenants, activeTenants, passiveTenants] = await Promise.all([
    prisma.tenant.count(),
    prisma.tenant.count({ where: { isActive: true } }),  
    prisma.tenant.count({ where: { isActive: false } }), 
  ]);

  const tenants = await prisma.tenant.findMany({
    orderBy:{
      createdAt: 'desc',
    },
    include: {
      users: {
        where: {
          role: 'ADMIN',
          deletedAt: null,
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return (
    <div className="p-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">SuperAdmin Kontrol Paneli</h1>
        <LogoutButton />
      </div>
      
      {/* İstatistik Kartları (3'lü Izgara Yapısı) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Toplam Şirket Kartı */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Toplam Şirket</h2>
          <p className="text-3xl font-bold text-gray-800 mt-2">{totalTenants}</p>
        </div>
        
        {/* Aktif Şirket Kartı */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-green-200">
          <h2 className="text-green-600 text-sm font-semibold uppercase tracking-wider">Aktif Şirketler</h2>
          <p className="text-3xl font-bold text-green-700 mt-2">{activeTenants}</p>
        </div>

        {/* Pasif Şirket Kartı */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-red-200">
          <h2 className="text-red-600 text-sm font-semibold uppercase tracking-wider">Pasif Şirketler</h2>
          <p className="text-3xl font-bold text-red-700 mt-2">{passiveTenants}</p>
        </div>

      </div>

      <TenantTable tenants={tenants} />
    </div>
  );
}