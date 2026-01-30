import { env } from "./env";

interface AppConfig {
    port: number;
    baseUrl: string;
    version: string;
}

export const appConfig: AppConfig = {
    port: Number(env.PORT) || 4000,
    baseUrl: "/api",
    version: "v1",
};