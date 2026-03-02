import { Request, Response } from "express";
import { customerService } from "./customer.service";
import { CustomersListQuery } from "./customer.validator";
import { AppResponse } from "@core/utils/response";

class CustomerController {
    public async getCustomers(req: Request, res: Response) {
        const query = req.localsQuery as CustomersListQuery

        const result = await customerService.getCustomersList(query);
        
        AppResponse(res, 200, {
            code: "OK",
            message: "Customers retrieved successfully",
            data: result
        })
    }

    public async getCustomerDetail(req: Request, res: Response) {
        const customerId = req.params.customerId

        const result = await customerService.getCustomerDetails(customerId);

        AppResponse(res, 200, {
            code: "OK",
            message: "Customer details retrieved successfully",
            data: result
        })
    }
}

export const customerController = new CustomerController();