'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface DeveloperSkillsProps {
  user: any;
  setUser: any;
  showToast: (message: string, type: 'success' | 'error') => void;
}

interface Skill {
  text: string;
  level: string;
}

export default function DeveloperSkills({ user, showToast }: DeveloperSkillsProps) {
  const { t } = useLanguage();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [skillName, setSkillName] = useState('');
  const [skillLevel, setSkillLevel] = useState('MEDIUM');
  const [isLoading, setIsLoading] = useState(false);
  const [skillsList, setSkillsList] = useState<Skill[]>([]);

  const LevelEmoji = (level: string) => {
    const upperLevel = level?.toUpperCase();
    if (upperLevel === "LOW") return "🔴";
    if (upperLevel === "MEDIUM") return "🟡";
    if (upperLevel === "HIGH") return "🟢";
    return "🔹";
  };

  const fetchSkills = async () => {
    try {
      const res = await fetch(`/api/developer/skills?userId=${user.id}`);
      if (res.ok) {
        const skills = await res.json();
        setSkillsList(skills);
      }
    } catch (err) {
      console.error('Yetenekler yüklenirken hata oluştu:', err);
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    fetchSkills();
  }, [user?.id]);

  const saveSkill = async (skill: Skill) => {
    try {
      const res = await fetch('/api/developer/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, newskill: skill.text, level: skill.level }),
      });

      if (res.ok) {
        showToast('Uzmanlık alanların güncellendi!', 'success');
      } else {
        showToast('Güncelleme başarısız oldu.', 'error');
      }
    } catch (err) {
      showToast('Bağlantı hatası.', 'error');
    }
  };

  const handleAddSkills = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName.trim()) return;

    setIsLoading(true);

    const newSkill: Skill = { 
      text: skillName.trim(), 
      level: skillLevel 
    };

    await saveSkill(newSkill);
    await fetchSkills();

    setIsLoading(false);
    setSkillName('');
    setSkillLevel('MEDIUM');
    setIsModalOpen(false);
  };

  const handleRemoveSkill = async (skillToRemove: Skill) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/developer/skills', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, deletedskill: skillToRemove.text }),
      });

      if (res.ok) {
        showToast('Uzmanlık alanı silindi!', 'success');
      } else {
        showToast('Silme başarısız oldu.', 'error');
      }
    } catch (err) {
      showToast('Bağlantı hatası.', 'error');
    } finally {
      setIsLoading(false);
      fetchSkills();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      {/* Üst Kısım: Başlık ve Yeni Yetenek Butonu */}
      <div className="flex justify-between items-center mb-4">
        <label className="block text-sm font-medium text-gray-700">
          {t('yourSkills')}
        </label>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition flex items-center gap-2"
        >
          <span>+</span> Yeni Yetenek
        </button>
      </div>

      {/* Eklenen Yetenekler Listesi */}
      {skillsList.length > 0 && (
        <div className="pt-3 border-t border-gray-100 flex flex-wrap gap-2 items-center">
          <span className="text-xs text-gray-400 font-medium mr-1">{t('addedSkills')}</span>
          {skillsList.map((skill, index) => (
            <span
              key={index}
              className="bg-green-50 text-green-700 border border-green-200 font-semibold px-3 py-1 rounded-full text-xs flex items-center gap-2 transition hover:bg-green-100"
            >
              {skill.text} {LevelEmoji(skill.level)}
              <button
                type="button"
                onClick={() => handleRemoveSkill(skill)}
                className="text-green-600 hover:text-red-600 font-bold text-xs rounded-full w-4 h-4 flex items-center justify-center transition ml-1"
                title="Sil"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Pop-up (Modal) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Yetenek Ekle</h3>
            
            <form onSubmit={handleAddSkills} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Yetenek Adı
                </label>
                <input
                  type="text"
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  placeholder="Örn: React, Node.js..."
                  autoFocus
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seviye
                </label>
                <select
                  value={skillLevel}
                  onChange={(e) => setSkillLevel(e.target.value)}
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="LOW">Düşük 🔴</option>
                  <option value="MEDIUM">Orta 🟡</option>
                  <option value="HIGH">Yüksek 🟢</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSkillName('');
                    setSkillLevel('MEDIUM');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !skillName.trim()}
                  className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition"
                >
                  {isLoading ? '...' : 'Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}