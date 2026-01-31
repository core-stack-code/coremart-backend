import { env } from "./env";

interface AppConfig {
    port: number;
    baseUrl: string;
    version: string;
}

export const appConfig: AppConfig = {
    port: env.PORT,
    baseUrl: "/api",
    version: "v1",
};