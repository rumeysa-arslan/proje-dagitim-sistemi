// lib/rateLimit.ts
type RateLimitRecord = {
  count: number;
  resetTime: number;
};

const tracker = new Map<string, RateLimitRecord>();

/**
 * Belirli bir anahtar (IP veya Email) için hız sınırı kontrolü yapar.
 * @param key Benzersiz kimlik (örn: IP adresi veya e-posta)
 * @param limit İzin verilen maksimum istek sayısı (varsayılan: 5)
 * @param windowMs Süre penceresi milisaniye (varsayılan: 60 saniye)
 */
export function checkRateLimit(key: string, limit = 5, windowMs = 60 * 1000): boolean {
  const now = Date.now();
  const record = tracker.get(key);

  if (!record || now > record.resetTime) {
    // Süre dolmuş veya ilk istek -> sıfırla
    tracker.set(key, { count: 1, resetTime: now + windowMs });
    return true; // İstek geçerli
  }

  if (record.count >= limit) {
    return false; // Limit aşıldı!
  }

  record.count += 1;
  return true; // İstek geçerli
}