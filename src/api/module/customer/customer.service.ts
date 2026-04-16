import { userRepository } from "@mod/users/user.repository";
import { CustomersListQuery } from "./customer.validator";
import { AppError } from "@api/utils/response";
import { getPaginationData } from "@core/utils/getPaginatoinData";

class CustomerService {
    public async getCustomersList(query: CustomersListQuery) {
        const skip = (query.page - 1) * query.limit;
        const take = query.limit;

        const customers = await userRepository.findMany(skip, take)
        const total = await userRepository.count();

        const pagination = getPaginationData(query.page, query.limit, total);

        const formatedCustomers = customers.map(cus => {
            const { _count, ...rest } = cus;
            return {
                ...rest,
                orderCount: _count.orders,
            };
        });

        return {
            customers: formatedCustomers,
            pagination,
        }
    }

    public async getCustomerDetails(id: string) {
        const customerData = await userRepository.userDetails(id)

        if (!customerData) {
            throw new AppError(404, "RESOURCE_NOT_FOUND", "Customer not found");
        }

        const { orders, userAddresses, ...restCustomer } = customerData

        const ordersList = orders.map(ord => {
            const { _count, ...rest } = ord
            return {
                ...rest,
                orderItesmCounts: _count.orderItems,
            }
        })

        return {
            customer: {...restCustomer},
            orders: ordersList,
            addresses: userAddresses,
        }
    }
}

export const customerService = new CustomerService();
