import { Resend } from "resend";

let cachedClient: Resend | null = null;
let loggedMissingKey = false;

function getClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    if (!loggedMissingKey) {
      console.warn(
        "[email] RESEND_API_KEY not set — emails will not be sent. In-app notifications still work.",
      );
      loggedMissingKey = true;
    }
    return null;
  }
  if (!cachedClient) cachedClient = new Resend(key);
  return cachedClient;
}

function getFromAddress(): string {
  return process.env.EMAIL_FROM ?? "CollabHub <notifications@collabhub.app>";
}

function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "https://collabhub.app";
}

export interface SendEmailParams {
  to: string;
  subject: string;
  title: string;
  body: string;
  ctaLabel?: string;
  ctaPath?: string;
}

function renderHtml({ title, body, ctaLabel, ctaPath }: SendEmailParams): string {
  const appUrl = getAppUrl();
  const ctaUrl = ctaPath ? `${appUrl}${ctaPath}` : null;

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background-color:#f5f3ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
      <div style="text-align:center;margin-bottom:24px;">
        <a href="${appUrl}" style="font-size:24px;font-weight:800;letter-spacing:-0.02em;text-decoration:none;background:linear-gradient(135deg,#8B5CF6 0%,#EC4899 100%);-webkit-background-clip:text;background-clip:text;color:transparent;">CollabHub</a>
      </div>
      <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;padding:32px;box-shadow:0 1px 2px rgba(0,0,0,0.04);">
        <h1 style="margin:0 0 12px 0;font-size:20px;font-weight:700;color:#111827;">${escapeHtml(title)}</h1>
        <div style="font-size:15px;line-height:1.6;color:#374151;white-space:pre-wrap;">${escapeHtml(body)}</div>
        ${
          ctaUrl && ctaLabel
            ? `<div style="margin-top:24px;"><a href="${ctaUrl}" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#8B5CF6 0%,#EC4899 100%);color:#ffffff;text-decoration:none;border-radius:10px;font-weight:600;font-size:14px;">${escapeHtml(ctaLabel)}</a></div>`
            : ""
        }
      </div>
      <p style="margin:24px 0 0 0;text-align:center;font-size:12px;color:#9ca3af;">
        You're receiving this because you have an account on CollabHub.<br/>
        Manage notifications in your <a href="${appUrl}/settings" style="color:#8B5CF6;">settings</a>.
      </p>
    </div>
  </body>
</html>`;
}

function renderText({ title, body, ctaLabel, ctaPath }: SendEmailParams): string {
  const appUrl = getAppUrl();
  const ctaUrl = ctaPath ? `${appUrl}${ctaPath}` : null;
  return `${title}\n\n${body}${ctaUrl && ctaLabel ? `\n\n${ctaLabel}: ${ctaUrl}` : ""}\n\n—\nCollabHub`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Send a transactional email. Never throws — logs and returns false on failure
 * so caller code (which also does critical DB work like inserting a
 * notification row) isn't blocked by email provider issues.
 */
export async function sendEmail(params: SendEmailParams): Promise<boolean> {
  const client = getClient();
  if (!client) return false;

  try {
    const { error } = await client.emails.send({
      from: getFromAddress(),
      to: params.to,
      subject: params.subject,
      html: renderHtml(params),
      text: renderText(params),
    });
    if (error) {
      console.error("[email] Resend error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] send failed:", err);
    return false;
  }
}
