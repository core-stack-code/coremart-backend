import express, { Application } from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import hpp from "hpp";

import appRoutes from "./core/router/appRoutes";
import { env } from "./core/config/env";
import { apiLimiter } from "./core/lib/rateLimit";
import { globalErrorHandler } from "./api/middlewares/error.middleware";
import { rawBodyMiddleware } from "./api/middlewares/rawBody.middleware";
import { log } from "./api/utils/log";
import { AppError } from "./core/utils/response";
import { connectDB } from "./core/config/database";
import { connectPrisma } from "./core/config/prisma";
import { logger } from "./api/utils/logger";
import { appConfig } from "./core/config/app.config";

class App {
    public app: Application;

    constructor() {
        this.app = express();
        this.setUpMiddleware();
        this.setUpRoutes();
        this.setErrorHandler();
        this.start();
    }

    private setUpMiddleware(): void {
        this.app.use(cors({
            origin: function (origin, callback) {
                if (!origin) return callback(null, true);
                
                if (origin === env.CLIENT_DOMAIN_URL) {
                    callback(null, true);
                } else {
                    log.error('Blocked origin:', origin);
                    callback(new Error('Not allowed by CORS'));
                }
            },
            credentials: true
        }));

        this.app.use(rawBodyMiddleware);
        this.app.use(express.json({
            verify: (req: any, res, buf) => {
                req.rawBody = buf.toString();
            },
        }));
        this.app.use(express.json());
        this.app.set("trust proxy", true);
        
        this.app.use(cookieParser());
        this.app.use(morgan('dev'));
        this.app.use(helmet());
        this.app.use(hpp());
        this.app.use('/api', apiLimiter);
    }

    private setUpRoutes(): void {
        appRoutes(this.app);
    }

    private setErrorHandler(): void {
        this.app.use((_req, res, next) => {
            next(new AppError(404, "RESOURCE_NOT_FOUND", "Request not found."));
        });
        
        // Global error handler
        this.app.use(globalErrorHandler);
    }

    private async initializeDatabase(): Promise<void> {
        await connectDB();
        await connectPrisma();
    }

    private async initializeApp(): Promise<void> {
        const PORT = appConfig.port;
        this.app.listen(PORT, () => {
            logger.info(`Server running... at ${PORT}`);
        });
    }

    private async start(): Promise<void> {
        try {
            await this.initializeDatabase();
            await this.initializeApp();
        }
        catch (error) {
            logger.error('Failed to start server:', error);
        }
    }
}

export default App;