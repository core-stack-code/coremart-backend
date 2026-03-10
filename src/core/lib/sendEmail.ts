import { Resend } from 'resend';
import { env } from '@core/config/env';
import { log } from '@api/utils/log';
import { AppError } from '@core/utils/response';
import { paiseToRupees } from '@core/utils/product.helper';


const resend = new Resend(env.RESEND_API_KEY);


type OtpMailData = {
    otp: string;
    name: string;
};

type OrderConfirmMailData = {
    confirmedAt: Date;
    totalAmount: number;
    fullName: string;
    phone: string;
    addressLine: string;
    city: string;
};

export type EmailDataMap = {
    EMAIL_VERIFICATION: OtpMailData;
    PASSWORD_RESET: OtpMailData;
    ORDER_CONFIRM: OrderConfirmMailData;
};

export type EmailType = keyof EmailDataMap;


const mailBuilderMap: { [K in EmailType]: (data: EmailDataMap[K]) => { html: string; subject: string } } = {
    EMAIL_VERIFICATION: ({ name, otp }) => ({
        subject: 'Email Verification',
        html: `
            <p>Hi ${name},</p>
            <p>Thank you for signing up with <strong>Core Mart</strong>.</p>
            <p>
                To verify your email address, please use the One-Time Password (OTP) below.
                This code is valid for the next <strong>5 minutes</strong>:
            </p>
            <p><strong>Your OTP Code: ${otp}</strong></p>
            <p>If you did not request this, you can safely ignore this email.</p>
            <p>For your security, please do not share this code with anyone.</p>
            <p>Best regards,<br />The Core Mart Team</p>
        `,
    }),

    PASSWORD_RESET: ({ name, otp }) => ({
        subject: 'Password Reset Request',
        html: `
            <p>Hi ${name},</p>
            <p>Thank you for signing up with <strong>Core Mart</strong>.</p>
            <p>
                To reset your password, please use the One-Time Password (OTP) below.
                This code is valid for the next <strong>5 minutes</strong>:
            </p>
            <p><strong>Your OTP Code: ${otp}</strong></p>
            <p>If you did not request this, you can safely ignore this email.</p>
            <p>For your security, please do not share this code with anyone.</p>
            <p>Best regards,<br />The Core Mart Team</p>
        `,
    }),

    ORDER_CONFIRM: ({ confirmedAt, totalAmount, fullName, phone, addressLine, city }) => {
        const formattedDate = confirmedAt.toLocaleDateString('en-IN', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });

        const amount = paiseToRupees(totalAmount);

        return {
            subject: 'Order Confirmed - Core Mart',
            html: `
                <p>Hi ${fullName},</p>
                <p>Your order has been <strong>confirmed</strong>! Here are the details:</p>
                <table style="border-collapse: collapse; width: 100%; max-width: 500px;">
                    <tr>
                        <td style="padding: 8px; font-weight: bold;">Confirmed At</td>
                        <td style="padding: 8px;">${formattedDate}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; font-weight: bold;">Total Amount</td>
                        <td style="padding: 8px;">&#8377;${amount.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; font-weight: bold;">Name</td>
                        <td style="padding: 8px;">${fullName}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; font-weight: bold;">Phone</td>
                        <td style="padding: 8px;">${phone}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; font-weight: bold;">Delivery Address</td>
                        <td style="padding: 8px;">${addressLine}, ${city}</td>
                    </tr>
                </table>
                <p>We'll notify you once your order is shipped.</p>
                <p>Best regards,<br />The Core Mart Team</p>
            `,
        };
    },
};


const prepareMailData = <T extends EmailType>(emailType: T, data: EmailDataMap[T]) => {
    const builder = mailBuilderMap[emailType] as (data: EmailDataMap[T]) => { html: string; subject: string };
    return builder(data);
};


export const sendEmail = async <T extends EmailType>(
    to: string,
    emailType: T,
    details: EmailDataMap[T]
): Promise<void> => {
    try {
        const { html, subject } = prepareMailData(emailType, details);

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