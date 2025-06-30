import { AuthType, LoggedInAuth } from "../types/exprses";
import { CustomError } from "./response";
import { logger } from "./logger";

// this aseert functions make type safe to use auth object in the controller and services

export function assertAuth(auth: AuthType | undefined): asserts auth is AuthType {
    if (!auth) {
        logger.error('Authentication middleware not applied or failed.');
        throw new CustomError('Internal server error.', 500)
    }
}

export function assertLoggedIn(auth: AuthType): asserts auth is LoggedInAuth {
    if (auth.isGuest) {
        logger.error('This action requires a logged-in user.');
        throw new CustomError('Internal server error.', 500)
    }
}