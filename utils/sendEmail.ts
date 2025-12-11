// utils/sendEmail.ts
// Placeholder for sending email via API (e.g. SendGrid, Mailgun, SMTP)

export async function sendActivationEmail(to: string, code: string) {
  // TODO: Replace with real email API integration
  // Example: fetch('/api/send-email', { method: 'POST', body: JSON.stringify({ to, code }) })
  // For now, just simulate success
  return new Promise<{ success: boolean; error?: string }>((resolve) => {
    setTimeout(() => {
      if (to && code) {
        resolve({ success: true });
      } else {
        resolve({ success: false, error: 'Missing email or code' });
      }
    }, 1000);
  });
}
