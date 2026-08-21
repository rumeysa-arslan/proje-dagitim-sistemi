import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

export async function sendApprovalEmail(toEmail: string, userName: string, inviteToken: string) {
  const setupUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/set-password?token=${inviteToken}`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eaeaea; rounded-xl; border-radius: 12px;">
      <h2 style="color: #4F46E5;"> Hesabınız Onaylandı!</h2>
      <p>Merhaba <strong>${userName}</strong>,</p>
      <p>Proje Dağıtım Sistemine yapmış olduğunuz kayıt başvurusu Admin tarafından onaylandı.</p>
      <p>Aşağıdaki butona tıklayarak kendi şifrenizi belirleyebilir ve sisteme hemen giriş yapabilirsiniz:</p>
      <div style="margin: 25px 0;">
        <a href="${setupUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
          Şifremi Belirle ve Giriş Yap
        </a>
      </div>
      <p style="color: #666; font-size: 12px;">Bu link 24 saat boyunca geçerlidir. Eğer bu başvuruyu siz yapmadıysanız lütfen bu e-postayı dikkate almayınız.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Proje Dağıtım" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: '🎉 Kayıt Başvurunuz Onaylandı - Şifrenizi Belirleyin',
    html: htmlContent,
  });
}