
export class KnownError extends Error {
    public name: string;

    constructor(message: string, options?: ErrorOptions) {
        super(message, options);

        this.name = "KnownError";
    }
}

export class NotFoundError extends KnownError {
    public statusCode = 404;

    constructor() {
        super("Resource Not Found");

        this.name = "NotFoundError";
    }
}

type RequestErrorOptions = ErrorOptions & {
    statusCode: number;
}

export class RequestError extends KnownError {
    public statusCode: number;

    constructor(message: string, { statusCode, ...options }: RequestErrorOptions) {
        super(message, options);

        this.name = "RequestError";
        this.statusCode = statusCode;
    }
}