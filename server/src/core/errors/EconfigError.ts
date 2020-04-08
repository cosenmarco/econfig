/**
 * The error code is a unique identifier for the error
 * The error message is a human readable description of the error
 */
export class EconfigError extends Error {

    public readonly code: string;
    public readonly message: string;
    public readonly statusCode: number;

    public constructor(code: string, message: string, statusCode?: number) {
        super(message);
        this.code = code;
        this.message = message;
        this.statusCode = statusCode || 500;
    }

    public static fromError(error: Error) {
        return new EconfigError('GENERIC_ERROR', error.message, 500);
    }
}
