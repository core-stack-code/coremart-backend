import { Application, Request, Response } from "express";

import authRoutes from '@api/module/auth/auth.routes';
import productRoutes from '@api/module/products/products.routes'
import reviewRoutes from '@api/module/reviews/reviews.routes'
import favoriteRoutes from '@api/module/favorites/favorites.routes';
import saveForLaterRoutes from '@api/module/save-for-later/saveForLater.routes';
import cartRoutes from '@api/module/cart/cart.routes';
import checoutRoutes from '@api/module/checkout/checkout.routes'
import addressRoutes from '@api/module/address/address.routes'
import paymentRoutes from '@api/module/payment/payment.routes';

import { authMiddleware } from "@/api/middlewares/auth.middleware";
import { appConfig } from "@/api/config/app.config";


const { baseUrl, version } = appConfig;
const baseRouteUrl = `${baseUrl}/${version}`;


export default function appRoutes(app: Application) {
    app.use(`${baseRouteUrl}/auth`, authRoutes)
    app.use(`${baseRouteUrl}/product`, productRoutes)
    app.use(`${baseRouteUrl}/review`, reviewRoutes)
    app.use(`${baseRouteUrl}/favorite`, favoriteRoutes)
    app.use(`${baseRouteUrl}/save-for-later`, saveForLaterRoutes)
    app.use(`${baseRouteUrl}/cart`, cartRoutes)
    app.use(`${baseRouteUrl}/checkout`, checoutRoutes)
    app.use(`${baseRouteUrl}/address`, addressRoutes)
    app.use(`${baseRouteUrl}/payment`, paymentRoutes)

    // test routes
    app.get(`${baseRouteUrl}/test`, (req: Request, res: Response) => {
        res.json({ message: 'I am just a guy who is hero for fun!'});
    });

    app.get(`${baseRouteUrl}/protected_test`, authMiddleware, (req: Request, res: Response) => {
        res.send({ message: 'This is a protected route, you are authenticated!' });
    })
}