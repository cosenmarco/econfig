import { NextFunction, Request, Response } from 'express';
import { EconfigError } from '../errors/EconfigError';

export default function errorMiddleware(
    error: Error,
    request: Request,
    response: Response,
    next: NextFunction,
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
