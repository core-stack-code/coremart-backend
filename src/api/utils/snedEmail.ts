import { env } from "../config/env";
import { Resend } from 'resend';
import { AppError } from "../../core/utils/response";
import { log } from "./log";

const resend = new Resend(env.RESEND_API_KEY);

type RequireUserData = {
  otp: number;
  name: string;
};

export type EmailType ='FORGOT_PASSWORD' |'VERIFY_EMAIL'

export const prepareHtml = (
  userData: RequireUserData,
  emailType: EmailType
): string => {
    const { name, otp } = userData;

    const purposeMap: Record<EmailType, string> = {
        FORGOT_PASSWORD: 'reset your password',
        VERIFY_EMAIL: 'verify your email address'
    };

    const purpose = purposeMap[emailType];
    if (!purpose) {
        throw new AppError(500, "INTERNAL_SERVER_ERROR", "Invalid email type provided.");
    }

    return `
        <p>Hi ${name},</p>
        <p>Thank you for signing up with <strong>Core Mart</strong>.</p>
        <p>
            To ${purpose}, please use the One-Time Password (OTP) below.
            This code is valid for the next <strong>15 minutes</strong>:
        </p>
        <p><strong>Your OTP Code: ${otp}</strong></p>
        <p>If you did not request this, you can safely ignore this email.</p>
        <p>For your security, please do not share this code with anyone.</p>
        <p>Best regards,<br />The Core Mart Team</p>
    `;
};


export const sendEmail = async (
    to: string,
    subject: string,
    details: RequireUserData,
    emailType: EmailType
): Promise<void> => {
    try {
        const html = prepareHtml(details, emailType);

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