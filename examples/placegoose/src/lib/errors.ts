type ServiceErrorOptions = ErrorOptions & {
  statusCode?: 400 | 401 | 403 | 404 | 500;
};

export class ServiceError extends Error {
  public name: string;
  public statusCode: 400 | 401 | 403 | 404 | 500;

  constructor(message: string, options?: ServiceErrorOptions) {
    const { statusCode, ...restOptions } = options ?? {};
    super(message, restOptions);

    this.name = "KnownError";
    this.statusCode = statusCode ?? 500;
  }
}

export class NotFoundError extends ServiceError {
  name = "NotFoundError";

  constructor(message: string) {
    super(message, { statusCode: 404 });
    Error.captureStackTrace(this, this.constructor);
  }
}

export class RequestError extends ServiceError {
  name = "RequestError";

  constructor(message: string) {
    super(message, { statusCode: 400 });
    Error.captureStackTrace(this, this.constructor);
  }
}
