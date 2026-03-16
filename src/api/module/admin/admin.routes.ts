import express from "express";
import { adminController } from "./admin.controller";
import { adminLoginSchema, adminSchema, updateAdminProfileSchema } from "./admin.validator";

import { adminMiddleware } from "@api/middlewares/admin.middleware";
import { validationMiddleware } from "@api/middlewares/validate.middlewate";
import { asyncWrapper } from "@api/utils/asyncWrapper";
import { changePasswordZodSchema } from "@core/validator/password.validator";

const adminRouter = express.Router();

adminRouter.post(
    "/register",
    validationMiddleware.validateRequest(adminSchema),
    asyncWrapper(adminController.registerAdmin)
);

adminRouter.post(
    "/login",
    validationMiddleware.validateRequest(adminLoginSchema),
    asyncWrapper(adminController.loginAdmin)
);

adminRouter.post(
    "/logout",
    adminMiddleware,
    asyncWrapper(adminController.logoutAdmin)
);

adminRouter.post(
    "/change-password",
    adminMiddleware,
    validationMiddleware.validateRequest(changePasswordZodSchema),
    asyncWrapper(adminController.changePassword)
);

adminRouter.post(
    "/refresh-token",
    asyncWrapper(adminController.refreshToken)
);

adminRouter.get(
    "/profile",
    adminMiddleware,
    asyncWrapper(adminController.getProfile)
);

adminRouter.patch(
    "/profile",
    adminMiddleware,
    validationMiddleware.validateRequest(updateAdminProfileSchema),
    asyncWrapper(adminController.updateProfile)
);

export default adminRouter;