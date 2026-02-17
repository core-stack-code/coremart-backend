import { Application, Request, Response } from "express";

import authRoutes from '@mod/auth/auth.routes';
import oauthRouter from "@mod/oauth/oauth.routes";
import attributesRouter from "@mod/attributes/attributes.routes";
import categoryRouter from "@mod/category/category.routes";
import productRouter from "@mod/product/product.routes";
import variantsRouter from "@mod/variants/variants.routes";
import catalogRouter from "@mod/catalog/catalog.routes";
import brandRouter from "@mod/brand/brand.routes";
import mediaRouter from "@mod/media/media.routes";
import adminRouter from "@mod/admin/admin.routes";
import userRouter from "@mod/users/user.routes";
import addressRouter from "@mod/address/address.routes";
import favoritesRouter from "@mod/favorites/favorites.routes";
import wishlistRouter from "@mod/wishlist/wishlist.routes";
import cartRouter from "@mod/cart/cart.routes";

import reviewRoutes from '@mod/reviews/reviews.routes'
import checoutRoutes from '@mod/checkout/checkout.routes'
import paymentRoutes from '@mod/payment/payment.routes';

import { authMiddleware } from "@api/middlewares/auth.middleware";
import { appConfig } from "@/core/config/app.config";


const { baseUrl, version } = appConfig;
const baseRouteUrl = `${baseUrl}/${version}`;


export default function appRoutes(app: Application) {
    app.use(`${baseRouteUrl}/auth`, authRoutes);
    app.use(`${baseRouteUrl}/oauth`, oauthRouter);

    app.use(`${baseRouteUrl}/attributes`, attributesRouter);
    app.use(`${baseRouteUrl}/category`, categoryRouter);
    app.use(`${baseRouteUrl}/product`, productRouter);
    app.use(`${baseRouteUrl}/variants`, variantsRouter);
    app.use(`${baseRouteUrl}/brand`, brandRouter);
    
    app.use(`${baseRouteUrl}/catalog`, catalogRouter);

    app.use(`${baseRouteUrl}/admin`, adminRouter);
    app.use(`${baseRouteUrl}/media`, mediaRouter);

    app.use(`${baseRouteUrl}/user`, userRouter);
    app.use(`${baseRouteUrl}/address`, addressRouter);
    app.use(`${baseRouteUrl}/favorite`, favoritesRouter);
    app.use(`${baseRouteUrl}/wishlist`, wishlistRouter);
    app.use(`${baseRouteUrl}/cart`, cartRouter);

    // old routes
    app.use(`${baseRouteUrl}/review`, reviewRoutes)
    app.use(`${baseRouteUrl}/checkout`, checoutRoutes)
    app.use(`${baseRouteUrl}/payment`, paymentRoutes)

    // test routes
    app.get(`${baseRouteUrl}/test`, (req: Request, res: Response) => {
        res.json({ message: 'I am just a guy who is hero for fun!'});
    });

    app.get(`${baseRouteUrl}/protected_test`, authMiddleware(), (req: Request, res: Response) => {
        res.send({ message: 'This is a protected route, you are authenticated!' });
    })
}