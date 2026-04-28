export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly howToFix?: string;

    constructor(message: string, statusCode: number, howToFix?: string, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.howToFix = howToFix;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class ValidationError extends AppError {
    constructor(message: string, howToFix?: string) {
        super(message, 400, howToFix);
    }
}

export class AuthenticationError extends AppError {
    constructor(message = 'Authentication failed.') {
        super(message, 401, 'Please double check your credentials or run forgot-password.');
    }
}
