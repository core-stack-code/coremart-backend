import { Log } from "@core/utils/log";
import { sendEmail } from "@core/lib/sendEmail";
import { orderRepository } from "@mod/order/order.repository";


export type OtpMailJobData = {
    to: string;
    otp: string;
    name: string;
};

export type OrderConfirmJobData = {
    to: string;
    confirmedAt: string;
    totalAmount: number;
    fullName: string;
    phone: string;
    addressLine: string;
    city: string;
};


export const handleEmailVerification = async (data: OtpMailJobData) => {
    await sendEmail(data.to, 'EMAIL_VERIFICATION', { otp: data.otp, name: data.name });
};

export const handlePasswordReset = async (data: OtpMailJobData) => {
    await sendEmail(data.to, 'PASSWORD_RESET', { otp: data.otp, name: data.name });
};

export const handleOrderConfirm = async (data: { orderId: string, confirmedAt: Date, to: string, totalAmount: number }) => {
    const result = await orderRepository.findCustomerDetails(data.orderId);

    if (!result) {
        Log.error(`Customer details not found for order ID: ${data.orderId}`);
        return;
    }

    await sendEmail(data.to, 'ORDER_CONFIRM', {
        confirmedAt: new Date(data.confirmedAt),
        totalAmount: data.totalAmount,
        fullName: result.name,
        phone: result.mobile,
        addressLine: result.addressLine1,
        city: result.city,
    });
};