import { Router, Request, Response } from 'express';

const router = Router();

// Default HTML email template
const getDefaultTemplate = () => `<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SipTakip - Yeni Nesil Restoran Yönetimi</title>
</head>
<body style="margin:0;padding:0;background:#0a0a1a;font-family:'Segoe UI',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a1a;padding:40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background:#12122a;border-radius:20px;border:1px solid #1e1e3a;overflow:hidden;">

                    <!-- Header -->
                    <tr>
                        <td style="background:linear-gradient(135deg,#7c3aed,#ec4899);padding:40px 32px;text-align:center;">
                            <div style="font-size:32px;margin-bottom:8px;">🍽️</div>
                            <h1 style="color:#fff;font-size:28px;margin:0;font-weight:800;">SipTakip</h1>
                            <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:8px 0 0;">Yeni Nesil Restoran Yönetim Platformu</p>
                        </td>
                    </tr>

                    <!-- Hero -->
                    <tr>
                        <td style="padding:40px 32px 24px;">
                            <h2 style="color:#fff;font-size:22px;margin:0 0 16px;font-weight:700;">
                                Restoranınızı Dijital Çağa Taşıyın 🚀
                            </h2>
                            <p style="color:#94a3b8;font-size:15px;line-height:1.7;margin:0;">
                                Merhaba,<br><br>
                                Restoranınızın sipariş süreçlerini hızlandırmak, müşteri memnuniyetini artırmak ve
                                operasyonel maliyetlerinizi düşürmek ister misiniz?
                                <strong style="color:#a78bfa;">SipTakip</strong> ile bunu başarmak artık çok kolay.
                            </p>
                        </td>
                    </tr>

                    <!-- Features -->
                    <tr>
                        <td style="padding:0 32px 24px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="padding:12px 16px;background:rgba(124,58,237,0.08);border-radius:12px;margin-bottom:8px;">
                                        <table><tr>
                                            <td style="font-size:24px;padding-right:12px;">📱</td>
                                            <td>
                                                <div style="color:#fff;font-weight:700;font-size:14px;">QR Menü & Dijital Sipariş</div>
                                                <div style="color:#94a3b8;font-size:13px;">Müşteriler QR okutup anında sipariş verir</div>
                                            </td>
                                        </tr></table>
                                    </td>
                                </tr>
                                <tr><td style="height:8px;"></td></tr>
                                <tr>
                                    <td style="padding:12px 16px;background:rgba(124,58,237,0.08);border-radius:12px;">
                                        <table><tr>
                                            <td style="font-size:24px;padding-right:12px;">👨‍🍳</td>
                                            <td>
                                                <div style="color:#fff;font-weight:700;font-size:14px;">Mutfak Ekranı & Garson Takibi</div>
                                                <div style="color:#94a3b8;font-size:13px;">Siparişler anlık mutfağa düşer, garsonlar bilgilendirilir</div>
                                            </td>
                                        </tr></table>
                                    </td>
                                </tr>
                                <tr><td style="height:8px;"></td></tr>
                                <tr>
                                    <td style="padding:12px 16px;background:rgba(124,58,237,0.08);border-radius:12px;">
                                        <table><tr>
                                            <td style="font-size:24px;padding-right:12px;">🔗</td>
                                            <td>
                                                <div style="color:#fff;font-weight:700;font-size:14px;">Pazar Yeri Entegrasyonu</div>
                                                <div style="color:#94a3b8;font-size:13px;">Trendyol Go, Getir, Migros Yemek, Yemek Sepeti tek panelden</div>
                                            </td>
                                        </tr></table>
                                    </td>
                                </tr>
                                <tr><td style="height:8px;"></td></tr>
                                <tr>
                                    <td style="padding:12px 16px;background:rgba(124,58,237,0.08);border-radius:12px;">
                                        <table><tr>
                                            <td style="font-size:24px;padding-right:12px;">📊</td>
                                            <td>
                                                <div style="color:#fff;font-weight:700;font-size:14px;">Anlık Raporlama & Analiz</div>
                                                <div style="color:#94a3b8;font-size:13px;">Satış, doluluk, garson performansı anlık takip</div>
                                            </td>
                                        </tr></table>
                                    </td>
                                </tr>
                                <tr><td style="height:8px;"></td></tr>
                                <tr>
                                    <td style="padding:12px 16px;background:rgba(124,58,237,0.08);border-radius:12px;">
                                        <table><tr>
                                            <td style="font-size:24px;padding-right:12px;">🤖</td>
                                            <td>
                                                <div style="color:#fff;font-weight:700;font-size:14px;">AI Rezervasyon Chat Botu</div>
                                                <div style="color:#94a3b8;font-size:13px;">7/24 otomatik masa rezervasyonu — hediye!</div>
                                            </td>
                                        </tr></table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Pricing -->
                    <tr>
                        <td style="padding:0 32px 24px;">
                            <div style="background:rgba(124,58,237,0.12);border:1px solid rgba(124,58,237,0.25);border-radius:16px;padding:24px;text-align:center;">
                                <div style="color:#a78bfa;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">UYGUN FİYATLANDIRMA</div>
                                <div style="color:#fff;font-size:14px;line-height:1.8;">
                                    <strong>Başlangıç:</strong> ₺750/ay &nbsp;•&nbsp;
                                    <strong>Profesyonel:</strong> ₺1.300/ay &nbsp;•&nbsp;
                                    <strong>Kurumsal:</strong> ₺2.000/ay
                                </div>
                                <div style="color:#94a3b8;font-size:13px;margin-top:8px;">
                                    İlk kurulum ücreti bir kereye mahsus 30.000₺ — QR Menü & Rezervasyon Botu hediye!
                                </div>
                            </div>
                        </td>
                    </tr>

                    <!-- CTA -->
                    <tr>
                        <td style="padding:0 32px 32px;text-align:center;">
                            <a href="https://restuarantsiparistakip.com.tr"
                               style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#ec4899);color:#fff;text-decoration:none;padding:16px 40px;border-radius:12px;font-size:16px;font-weight:700;">
                                🌐 Platformu İnceleyin
                            </a>
                            <p style="color:#94a3b8;font-size:13px;margin:16px 0 0;">
                                14 gün ücretsiz deneme — Kredi kartı gerekmez
                            </p>
                        </td>
                    </tr>

                    <!-- WhatsApp -->
                    <tr>
                        <td style="padding:0 32px 32px;text-align:center;">
                            <a href="https://wa.me/905077605747"
                               style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:12px 32px;border-radius:10px;font-size:14px;font-weight:600;">
                                📲 WhatsApp ile İletişime Geçin
                            </a>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding:24px 32px;border-top:1px solid #1e1e3a;text-align:center;">
                            <p style="color:#64748b;font-size:12px;margin:0;">
                                © 2026 SipTakip. Bir <strong style="color:#a78bfa;">Newant Agency</strong> yazılımıdır.
                            </p>
                            <p style="color:#475569;font-size:11px;margin:8px 0 0;">
                                Bu e-postayı almak istemiyorsanız lütfen bize bildirin.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

// GET default template for preview/editing
router.get('/template', (_req: Request, res: Response) => {
    res.json({ html: getDefaultTemplate() });
});

// Send email via Brevo HTTP API
async function sendViaBrevo(
    to: string,
    subject: string,
    htmlContent: string,
    senderEmail: string,
    senderName: string,
    apiKey: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': apiKey,
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                sender: { name: senderName, email: senderEmail },
                to: [{ email: to }],
                subject,
                htmlContent,
            }),
        });

        if (response.ok) {
            return { success: true };
        } else {
            const errorData: any = await response.json();
            return { success: false, error: errorData.message || `HTTP ${response.status}` };
        }
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

// Send bulk email to leads
router.post('/send', async (req: Request, res: Response) => {
    try {
        const { emails, subject, customHtml } = req.body;

        if (!emails || !Array.isArray(emails) || emails.length === 0) {
            res.status(400).json({ error: 'En az bir e-posta adresi gereklidir' });
            return;
        }

        const brevoApiKey = process.env.BREVO_API_KEY;
        if (!brevoApiKey) {
            res.status(500).json({ error: 'BREVO_API_KEY ortam değişkeni tanımlı değil' });
            return;
        }

        const senderEmail = process.env.SENDER_EMAIL || 'erdimboz@gmail.com';
        const senderName = process.env.SENDER_NAME || 'SipTakip';
        const emailSubject = subject || '🍽️ SipTakip — Restoranınızı Dijital Çağa Taşıyın';
        const html = customHtml || getDefaultTemplate();

        console.log('📧 Email send request via Brevo:', {
            recipientCount: emails.length,
            subject: emailSubject,
            senderEmail,
            hasCustomHtml: !!customHtml,
        });

        const results: { email: string; success: boolean; error?: string }[] = [];

        for (const email of emails) {
            const result = await sendViaBrevo(email, emailSubject, html, senderEmail, senderName, brevoApiKey);
            if (result.success) {
                console.log(`✅ Email sent to: ${email}`);
                results.push({ email, success: true });
            } else {
                console.error(`❌ Failed to send to ${email}:`, result.error);
                results.push({ email, success: false, error: result.error });
            }
        }

        const sent = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;

        console.log(`📊 Email results: ${sent} sent, ${failed} failed`);

        res.json({
            message: `${sent} e-posta gönderildi, ${failed} başarısız.`,
            results,
        });
    } catch (error: any) {
        console.error('Bulk email error:', error.message, error.stack);
        res.status(500).json({ error: `E-posta gönderilemedi: ${error.message}` });
    }
});

export default router;
