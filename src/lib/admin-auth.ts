import fs from "fs";
import path from "path";
import crypto from "crypto";
import { Resend } from "resend";

export const VERIFIED_ADMIN_EMAIL = "rishabhtripathi2022@gmail.com";

const CONFIG_PATH = path.join(process.cwd(), "src", "data", "admin_config.json");

interface AdminConfig {
  password: string;
  verifiedEmail: string;
  lastUpdated?: string;
  activeOtp?: {
    code: string;
    expiresAt: number;
  };
}

function readConfig(): AdminConfig {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const data = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
      return {
        password: data.password || process.env.ADMIN_PASSWORD || "rishabh@2022",
        verifiedEmail: VERIFIED_ADMIN_EMAIL,
        lastUpdated: data.lastUpdated,
        activeOtp: data.activeOtp,
      };
    }
  } catch (error) {
    console.error("Error reading admin_config.json:", error);
  }

  return {
    password: process.env.ADMIN_PASSWORD || "rishabh@2022",
    verifiedEmail: VERIFIED_ADMIN_EMAIL,
  };
}

function writeConfig(config: AdminConfig): boolean {
  try {
    const dir = path.dirname(CONFIG_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(
      CONFIG_PATH,
      JSON.stringify(
        {
          password: config.password,
          verifiedEmail: VERIFIED_ADMIN_EMAIL,
          lastUpdated: new Date().toISOString(),
          activeOtp: config.activeOtp,
        },
        null,
        2
      ),
      "utf8"
    );
    return true;
  } catch (error) {
    console.error("Error writing admin_config.json:", error);
    return false;
  }
}

export function getAdminPassword(): string {
  const config = readConfig();
  return config.password;
}

export function updateAdminPassword(newPassword: string): boolean {
  const config = readConfig();
  config.password = newPassword;
  config.activeOtp = undefined; // clear used OTP
  return writeConfig(config);
}

export function verifyAdminPassword(password: string): boolean {
  if (!password) return false;
  const current = getAdminPassword();
  return password === current;
}

export function generateSessionToken(password: string): string {
  const secret = process.env.AUTH_SECRET || "rishabh-portfolio-secure-session-key";
  return crypto
    .createHmac("sha256", secret)
    .update(`${password}::${VERIFIED_ADMIN_EMAIL}`)
    .digest("hex");
}

export function verifySessionToken(token: string): boolean {
  if (!token) return false;
  const expected = generateSessionToken(getAdminPassword());
  return token === expected;
}

// Generate a random 6-digit OTP code
export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function requestPasswordResetOtp(): Promise<{
  success: boolean;
  message: string;
  mockMode?: boolean;
}> {
  const otp = generateOtp();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  const config = readConfig();
  config.activeOtp = { code: otp, expiresAt };
  writeConfig(config);

  const resendApiKey = process.env.RESEND_API_KEY;

  if (resendApiKey && resendApiKey !== "re_your_api_key_here") {
    try {
      const resend = new Resend(resendApiKey);
      const emailResult = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "Rishabh Portfolio Admin <onboarding@resend.dev>",
        to: [VERIFIED_ADMIN_EMAIL],
        subject: `Your Admin Verification Code: ${otp}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #09090b; color: #fafafa; border-radius: 16px; border: 1px solid #27272a;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h2 style="margin: 0; color: #818cf8; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Portfolio Admin Security</h2>
              <p style="margin-top: 6px; color: #a1a1aa; font-size: 14px;">Password Reset Verification Request</p>
            </div>
            
            <div style="background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
              <p style="margin: 0 0 12px; color: #a1a1aa; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">Your 6-Digit OTP Code</p>
              <div style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #ffffff; font-family: monospace; padding: 12px 0;">
                ${otp}
              </div>
              <p style="margin: 8px 0 0; color: #71717a; font-size: 12px;">This code will expire in <strong>10 minutes</strong>.</p>
            </div>

            <p style="color: #a1a1aa; font-size: 13px; line-height: 1.6; margin: 16px 0;">
              This code was requested to change the administrator password for your portfolio. If you did not request this change, you can safely ignore this email.
            </p>

            <div style="border-top: 1px solid #27272a; padding-top: 16px; margin-top: 24px; text-align: center; font-size: 11px; color: #71717a;">
              Sent securely to verified administrator: <span style="color: #818cf8;">${VERIFIED_ADMIN_EMAIL}</span>
            </div>
          </div>
        `,
      });

      if (emailResult.error) {
        console.error("Resend API Error:", emailResult.error);
        return {
          success: false,
          message: `Failed to send email via Resend: ${emailResult.error.message}`,
        };
      }

      return {
        success: true,
        message: `A 6-digit verification code has been sent to ${VERIFIED_ADMIN_EMAIL}.`,
      };
    } catch (err: any) {
      console.error("Resend Exception:", err);
      return {
        success: false,
        message: `Email sending failed: ${err.message || "Unknown error"}`,
      };
    }
  } else {
    // If no Resend API key is configured yet, log OTP to server console
    console.log(`\n========================================`);
    console.log(`[ADMIN SECURITY] RESEND_API_KEY is not configured.`);
    console.log(`[ADMIN SECURITY] OTP for ${VERIFIED_ADMIN_EMAIL}: >>> ${otp} <<<`);
    console.log(`[ADMIN SECURITY] Valid for 10 minutes.`);
    console.log(`========================================\n`);

    return {
      success: true,
      message: `Verification code generated for ${VERIFIED_ADMIN_EMAIL}. (Resend API key not set: Check server terminal for OTP or configure RESEND_API_KEY in .env.local)`,
      mockMode: true,
    };
  }
}

export function verifyOtpAndChangePassword(
  otp: string,
  newPassword: string
): { success: boolean; message: string } {
  const config = readConfig();

  if (!config.activeOtp) {
    return {
      success: false,
      message: "No active password reset request. Please request a new code.",
    };
  }

  if (Date.now() > config.activeOtp.expiresAt) {
    config.activeOtp = undefined;
    writeConfig(config);
    return {
      success: false,
      message: "Verification code has expired. Please request a new code.",
    };
  }

  if (config.activeOtp.code !== otp.trim()) {
    return {
      success: false,
      message: "Invalid verification code. Please check and try again.",
    };
  }

  if (!newPassword || newPassword.length < 6) {
    return {
      success: false,
      message: "New password must be at least 6 characters long.",
    };
  }

  const updated = updateAdminPassword(newPassword);
  if (!updated) {
    return {
      success: false,
      message: "Failed to persist new password to storage.",
    };
  }

  return {
    success: true,
    message: "Password updated successfully! You can now log in with your new password.",
  };
}
