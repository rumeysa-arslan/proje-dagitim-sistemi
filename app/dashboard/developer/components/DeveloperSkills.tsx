'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface DeveloperSkillsProps {
  user: any;
  setUser: (user: any) => void;
  showToast: (message: string, type: 'success' | 'error') => void;
}

export default function DeveloperSkills({ user, setUser, showToast }: DeveloperSkillsProps) {
  const { t } = useLanguage();
  const [skillsInput, setSkillsInput] = useState('');
  const [savingSkills, setSavingSkills] = useState(false);
  const [skillsList, setSkillsList] = useState<string[]>([]);

  useEffect(() => {
    if (!user?.id) return;

    const fetchFreshSkills = async () => {
      try {
        const res = await fetch(`/api/users/profile?userId=${user.id}`);
        if (res.ok) {
          const freshUser = await res.json();
          if (freshUser?.skills) {
            const list = freshUser.skills
              .split(',')
              .map((s: string) => s.trim())
              .filter((s: string) => s.length > 0);
            setSkillsList(list);
          } else {
            setSkillsList([]);
          }
        }
      } catch (err) {
        console.error('Yetenekler yüklenirken hata oluştu:', err);
      }
    };

    fetchFreshSkills();
  }, [user?.id]);

  const saveSkillsToBackend = async (newList: string[]) => {
    setSavingSkills(true);
    const skillsString = newList.join(',');
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, skills: skillsString }),
      });

      if (res.ok) {
        const updated = await res.json();
        localStorage.setItem('user', JSON.stringify(updated));
        setUser(updated);
        setSkillsList(newList);
        showToast('Uzmanlık alanların güncellendi!', 'success');
      } else {
        showToast('Güncelleme başarısız oldu.', 'error');
      }
    } catch (err) {
      showToast('Bağlantı hatası.', 'error');
    } finally {
      setSavingSkills(false);
    }
  };

  const handleAddSkills = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillsInput.trim()) return;

    const newEntries = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const updatedList = Array.from(new Set([...skillsList, ...newEntries]));

    await saveSkillsToBackend(updatedList);
    setSkillsInput('');
  };

  const handleRemoveSkill = async (skillToRemove: string) => {
    const updatedList = skillsList.filter((skill) => skill !== skillToRemove);
    await saveSkillsToBackend(updatedList);
  };

  return (
<div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <form onSubmit={handleAddSkills} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('yourSkills')}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder={t('skillsPlaceholder')}
              className="flex-1 border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={savingSkills}
              className="bg-green-600 hover:bg-green-700 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition"
            >
              {savingSkills ? '...' : t('addSave')}
            </button>
          </div>
        </div>
      </form>

      {skillsList.length > 0 && (
        <div className="pt-3 border-t border-gray-100 flex flex-wrap gap-2 items-center">
          <span className="text-xs text-gray-400 font-medium mr-1">{t('addedSkills')}</span>
          {skillsList.map((skill, index) => (
            <span
              key={index}
              className="bg-green-50 text-green-700 border border-green-200 font-semibold px-3 py-1 rounded-full text-xs flex items-center gap-2 transition hover:bg-green-100"
            >
              {skill}
              <button
                type="button"
                onClick={() => handleRemoveSkill(skill)}
                className="text-green-600 hover:text-red-600 font-bold text-xs rounded-full w-4 h-4 flex items-center justify-center transition"
                title="Sil"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}