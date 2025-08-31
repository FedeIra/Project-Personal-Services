// Response mapper for API Gateway responses:
interface Response {
  status: string;
  codeStatus: number;
  data?: unknown;
  errorMessage?: string;
}

export const buildResponse = (
  params: Response
): {
  statusCode: number;
  body: string;
} => {
  return {
    statusCode: params.codeStatus,
    body: JSON.stringify({
      status: params.status,
      codeStatus: params.codeStatus,
      data: params.data || null,
      errorMessage: params.errorMessage || null,
    }),
  };
};

// Response mapper for errors:
export class ErrorHandler {
  static handle(error: unknown): {
    statusCode: number;
    body: string;
  } {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === 'string'
          ? error
          : 'Internal Server Error';
    return {
      statusCode: 500,
      body: JSON.stringify({
        status: 'error',
        message: message,
      }),
    };
  }
}
