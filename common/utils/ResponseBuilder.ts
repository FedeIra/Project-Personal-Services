// Response mapper for API Gateway responses:
interface Response {
  status: string;
  codeStatus: number;
  data?: any;
  errorMessage?: string;
}

export const buildResponse = (params: Response) => {
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
  static handle(error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        status: 'error',
        message: error.message || 'Internal Server Error',
      }),
    };
  }
}
