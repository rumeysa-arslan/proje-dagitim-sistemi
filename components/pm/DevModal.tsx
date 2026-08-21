'use client';

import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface DevModalProps {
  isOpen: boolean;
  developers: any[];
  assignedToId: string;
  onClose: () => void;
  onSelectDev: (id: string) => void;
}

export default function DevModal({
  isOpen,
  developers,
  assignedToId,
  onClose,
  onSelectDev,
}: DevModalProps) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredDevs = developers.filter((dev) => {
    const isDeveloper = dev.role?.toUpperCase() === 'DEVELOPER';
    if(!isDeveloper) return false

    const term = searchTerm.toLowerCase();
    const nameMatch = dev.name?.toLowerCase().includes(term);
    const emailMatch = dev.email?.toLowerCase().includes(term);
    const skillMatch = dev.skills?.toLowerCase().includes(term);
    return nameMatch || emailMatch || skillMatch;
  });

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-3">
          <div>
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              👨‍💻 {t('devPoolTitle')}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">{t('devPoolSub')}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 font-bold text-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Search */}
        <div>
          <input
            type="text"
            placeholder={`🔍 ${t('searchDevPlaceholder')}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {/* Developer List */}
        <div className="overflow-y-auto space-y-2 flex-1 pr-1">
          {filteredDevs.map((dev) => {
            const isAssigned = assignedToId === dev.id;
            return (
              <div
                key={dev.id}
                className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex items-center justify-between hover:border-gray-200 transition"
              >
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">{dev.name}</h4>
                  <p className="text-xs text-gray-400">{dev.email}</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onSelectDev(dev.id);
                    onClose();
                  }}
                  className={`text-xs font-semibold px-4 py-1.5 rounded-lg transition cursor-pointer ${
                    isAssigned
                      ? 'bg-green-600 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  {isAssigned ? t('assigned') : t('assign')}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}