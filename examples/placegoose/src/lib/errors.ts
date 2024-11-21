type ErrorStatusCode = 400 | 401 | 403 | 404 | 500;

type ServiceErrorOptions = ErrorOptions & {
  statusCode?: ErrorStatusCode;
};

export class ServiceError extends Error {
  public name = "ServiceError";
  public statusCode: ErrorStatusCode;

  private constructor(message: string, options: ServiceErrorOptions) {
    const { statusCode, ...restOptions } = options ?? {};
    super(message, restOptions);

    this.statusCode = statusCode ?? 500;

    Error.captureStackTrace(this, this.constructor);
  }

  public static corruptedData(message: string) {
    return new ServiceError(message, { statusCode: 400 });
  }

  public static invalidRequest(message: string, options?: ErrorOptions) {
    return new ServiceError(message, { statusCode: 400, ...options });
  }

  public static notFound(message = "Resource Not Found") {
    return new ServiceError(message, { statusCode: 404 });
  }
}
