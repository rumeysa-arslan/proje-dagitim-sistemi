'use client';

import { useLanguage } from '@/context/LanguageContext';
import { useState, useEffect, useRef } from 'react';

interface IComment {
  id: string;
  text?: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    role: string;
  };
}

interface TaskChatProps {
  taskId: string;
  currentUser: { id: string; name: string; role: string };
}

export default function TaskChat({ taskId, currentUser }: TaskChatProps) {
  const [comments, setComments] = useState<IComment[]>([]);
  const [text, setText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'info' | 'error' | 'success' } | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (taskId) {
      fetchComments();
    }
  }, [taskId]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(Array.isArray(data) ? data : []);
      } else {
        console.error('Yorumlar çekilemedi status:', res.status);
      }
    } catch (err) {
      console.error('Yorumlar yüklenemedi hatası:', err);
    }
  };

  // 1. Dosya seçildiği an çalışan fonksiyon
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setStatusMsg({
        text: `📎 Dosya seçildi: ${file.name} (${(file.size / 1024).toFixed(1)} KB). Göndermek için "Senden" butonuna basın.`,
        type: 'info',
      });
      console.log('Seçilen Dosya:', file);
    }
  };

  // 2. Mesaj ve Dosya Gönderme Fonksiyonu
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser?.id) {
      setStatusMsg({ text: 'Hata: Kullanıcı oturumu bulunamadı!', type: 'error' });
      return;
    }

    if (!text.trim() && !selectedFile) {
      setStatusMsg({ text: 'Lütfen bir mesaj yazın veya dosya seçin.', type: 'error' });
      return;
    }

    setLoading(true);
    setStatusMsg({ text: 'Gönderiliyor...', type: 'info' });

    let fileUrl: string | null = null;
    let fileName: string | null = null;

    try {
      // ADIM 1: Dosya Upload
      if (selectedFile) {
        setStatusMsg({ text: '1/2 Dosya sunucuya yükleniyor...', type: 'info' });
        const formData = new FormData();
        formData.append('file', selectedFile);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadRes.json();

        if (!uploadRes.ok) {
          throw new Error(`Upload API Hatası (${uploadRes.status}): ${uploadData.error || uploadData.message || 'Bilinmeyen hata'}`);
        }

        fileUrl = uploadData.fileUrl;
        fileName = uploadData.fileName;
        console.log('Upload Başarılı:', { fileUrl, fileName });
      }

      // ADIM 2: Yorum Kaydı
      setStatusMsg({ text: '2/2 Mesaj kaydediliyor...', type: 'info' });
      const commentRes = await fetch(`/api/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim() || null,
          userId: currentUser.id,
          fileUrl,
          fileName,
        }),
      });

      const commentData = await commentRes.json();

      if (!commentRes.ok) {
        throw new Error(`Comments API Hatası (${commentRes.status}): ${commentData.message || commentData.error || 'Kaydedilemedi'}`);
      }

      console.log('Kayıt Başarılı:', commentData);
      setStatusMsg({ text: 'Başarıyla gönderildi! ✅', type: 'success military' as any });

      // Formu temizle ve listeyi tazele
      setText('');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      await fetchComments();

      setTimeout(() => setStatusMsg(null), 4000);
    } catch (err: any) {
      console.error('HATA OLUŞTU:', err);
      setStatusMsg({ text: `Hata: ${err.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const isImage = (name?: string | null) => {
    return !!name && /\.(jpg|jpeg|png|gif|webp)$/i.test(name);
  };

  return (
    <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-200 space-y-3 mt-3">
      {/* Üst Başlık */}
      <div className="flex items-center justify-between border-b pb-2">
        <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
          💬 {t('taskDiscussion') || 'AUFGABEN-DISKUSSION'} ({comments.length})
        </h4>
        <span className="text-[10px] text-gray-400">{t('liveMessaging') || 'Live-Chat'}</span>
      </div>

      {/* Mesaj Listesi */}
      <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
        {comments.length === 0 ? (
          <p className="text-xs text-gray-400 italic text-center py-4">
            {t('noCommentsYet') || 'Noch keine Nachrichten. Schreiben Sie die erste Notiz!'}
          </p>
        ) : (
          comments.map((comment) => {
            const isMe = comment.user?.id === currentUser?.id;
            const isPM = comment.user?.role === 'PM' || comment.user?.role === 'ADMIN';

            return (
              <div key={comment.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-1 px-1">
                  <span className="font-semibold text-gray-700">{comment.user?.name || 'Kullanıcı'}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                      isPM ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {comment.user?.role}
                  </span>
                  <span>•</span>
                  <span>{new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs shadow-xs leading-relaxed space-y-2 ${
                    isMe
                      ? 'bg-indigo-600 text-white rounded-br-xs'
                      : isPM
                      ? 'bg-purple-100 text-purple-900 border border-purple-200 rounded-bl-xs'
                      : 'bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-bl-xs'
                  }`}
                >
                  {comment.text && <p className="break-words whitespace-pre-wrap">{comment.text}</p>}

                  {comment.fileUrl && (
                    <div className="pt-1">
                      {isImage(comment.fileName) ? (
                        <a href={comment.fileUrl} target="_blank" rel="noreferrer" className="block">
                          <img
                            src={comment.fileUrl}
                            alt={comment.fileName || 'Görsel'}
                            className="max-w-[200px] max-h-[140px] rounded-lg border border-black/10 hover:opacity-90 transition object-cover bg-white"
                          />
                        </a>
                      ) : (
                        <a
                            href={comment.fileUrl}
                            download={comment.fileName || 'dosya'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
                                isMe
                                  ? 'bg-white/20 text-white hover:bg-white/30'
                                  : 'bg-white border border-gray-200 text-blue-600 hover:bg-gray-50'
                                  }`}
                          >
                            <span>📄</span>
                            <span className="truncate max-w-[180px] underline">
                            {comment.fileName || 'Dosyayı İndir'}
                            </span>
                          </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ⚠️ Dinamik Bilgilendirme / Hata / Başarı Bildirim Kutusu */}
      {statusMsg && (
        <div
          className={`p-2 rounded-lg text-xs font-medium border ${
            statusMsg.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-700'
              : statusMsg.type === 'info'
              ? 'bg-blue-50 border-blue-200 text-blue-700'
              : 'bg-green-50 border-green-200 text-green-700'
          }`}
        >
          {statusMsg.text}
        </div>
      )}

      {/* Mesaj & Dosya Formu */}
      <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-2 border-t">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*,.pdf,.txt,.doc,.docx"
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`p-2.5 rounded-xl border transition-all duration-200 flex items-center justify-center shrink-0 shadow-xs ${
            selectedFile
              ? 'bg-indigo-50 border-indigo-300 text-indigo-600 ring-2 ring-indigo-200'
              : 'bg-white border-gray-200 text-gray-500 hover:text-indigo-600 hover:bg-gray-50'
          }`}
          title="Dosya veya Görsel Ekle"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
          >
            <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
        </button>

        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('send') ? `${t('send')}...` : 'Senden...'}
          className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />

        <button
          type="submit"
          disabled={loading || (!text.trim() && !selectedFile)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition disabled:opacity-50 shrink-0 shadow-xs cursor-pointer"
        >
          {loading ? '...' : t('send') || 'Senden'}
        </button>
      </form>
    </div>
  );
}