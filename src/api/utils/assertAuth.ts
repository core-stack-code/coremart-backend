import { AuthType, LoggedInAuth } from "../types/exprses";
import { AppError } from "../../core/utils/response";
import { log } from "./log";

// this aseert functions make type safe to use auth object in the controller and services

export function assertAuth(auth: AuthType | undefined): asserts auth is AuthType {
    if (!auth) {
        log.error('Authentication middleware not applied or failed.');
        throw new AppError(500, "INTERNAL_SERVER_ERROR", "Internal server error.");
    }
}

export function assertLoggedIn(auth: AuthType): asserts auth is LoggedInAuth {
    if (auth.isGuest) {
        log.error('This action requires a logged-in user.');
        throw new AppError(500, "INTERNAL_SERVER_ERROR", "Internal server error.");
    }
}