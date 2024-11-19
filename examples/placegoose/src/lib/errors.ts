export class KnownError extends Error {
  public name: string;

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);

    this.name = "KnownError";
  }
}

export class NotFoundError extends KnownError {
  public statusCode = 404 as const;

  constructor() {
    super("Resource Not Found");

    this.name = "NotFoundError";
  }
}

type RequestErrorOptions = ErrorOptions & {
  statusCode: 400 | 401 | 403;
};

export class RequestError extends KnownError {
  public statusCode: 400 | 401 | 403;

  constructor(
    message: string,
    { statusCode, ...options }: RequestErrorOptions,
  ) {
    super(message, options);

    this.name = "RequestError";
    this.statusCode = statusCode;
  }
}
