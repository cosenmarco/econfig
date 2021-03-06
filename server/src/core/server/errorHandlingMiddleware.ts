import { Request, Response } from 'express';
import { EconfigError } from '../errors/EconfigError';

export function errorMiddleware(
    error: Error,
    request: Request,
    response: Response,
) {
    const econfigError = error instanceof EconfigError ? error : EconfigError.fromError(error);
    const status = econfigError.statusCode;
    const code = econfigError.code;
    const message = econfigError.message;
    response.status(status).send({
        status,
        code,
        message,
    });
}
