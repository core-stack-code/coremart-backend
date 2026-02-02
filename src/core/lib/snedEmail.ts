import { Resend } from 'resend';
import { OtpSessionType } from 'generated/prisma/enums';

import { env } from '@core/config/env';
import { log } from '@api/utils/log';
import { AppError } from '@core/utils/response';


const resend = new Resend(env.RESEND_API_KEY);

type RequireUserData = {
  otp: string;
  name: string;
};


const prepareMailData = (
  userData: RequireUserData,
  emailType: OtpSessionType
) => {
    const { name, otp } = userData;

    const mailMap: Record<OtpSessionType, { purpose: string, subject: string }> = {
        PASSWORD_RESET: { purpose: 'reset your password', subject: 'Password Reset Request' },
        EMAIL_VERIFICATION: { purpose: 'verify your email address', subject: 'Email Verification' }
    };

    const { purpose, subject } = mailMap[emailType];

    const html = `
        <p>Hi ${name},</p>
        <p>Thank you for signing up with <strong>Core Mart</strong>.</p>
        <p>
            To ${purpose}, please use the One-Time Password (OTP) below.
            This code is valid for the next <strong>5 minutes</strong>:
        </p>
        <p><strong>Your OTP Code: ${otp}</strong></p>
        <p>If you did not request this, you can safely ignore this email.</p>
        <p>For your security, please do not share this code with anyone.</p>
        <p>Best regards,<br />The Core Mart Team</p>
    `;

    return { html, subject }
};


export const sendEmail = async (
    to: string,
    details: RequireUserData,
    emailType: OtpSessionType
): Promise<void> => {
    try {
        const { html, subject } = prepareMailData(details, emailType);

        const response = await resend.emails.send({
            from: 'Core Mart <hello@maulikkoli.me>',
            to,
            subject,
            html
        });

        log.info("Email response", response);
        if (!response || !response.data || response.error) {
            throw new AppError(500, "INTERNAL_SERVER_ERROR", "Failed to send email. Please try again later.");
        }

    } catch (error: any) {
        throw new AppError(
            error?.statusCode || 500,
            "INTERNAL_SERVER_ERROR",
            error?.message || "Something went wrong while sending email.",
        );
    }
};