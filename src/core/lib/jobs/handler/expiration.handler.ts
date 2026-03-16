import { Log } from "@core/utils/log";
import { orderRepository } from "@mod/order/order.repository";


export const handleOrderExpiration = async (data: { orderId: string }) => {
    const orderId = data.orderId;
    const order = await orderRepository.findOrder(orderId);

    if (!order) return;

    const result = await orderRepository.updateOrderIfPending(orderId, {
        status: "EXPIRED"
    });

    if (result.count === 0) {
        // already processed
        Log.info(`Order ${orderId} is already processed. Skipping expiration.`, orderId);
        return;
    }

    Log.info(`Order ${orderId} has been marked as expired.`);
}


export const handlePaymentExpiration = async (data: { paymentId: string }) => {
    const paymentId = data.paymentId;
    const payment = await orderRepository.findPayment(paymentId);

    if (!payment) return;

    const result = await orderRepository.updatePaymentIfActive(paymentId, {
        cfStatus: "EXPIRED"
    });

    if (result.count === 0) {
        Log.info(`Payment ${paymentId} is already processed. Skipping expiration.`, paymentId);
        return;
    }

    Log.info(`Payment ${paymentId} has been marked as expired.`);
}