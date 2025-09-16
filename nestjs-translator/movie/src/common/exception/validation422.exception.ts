import { HttpException, HttpStatus } from '@nestjs/common';

export interface FieldError {
  key: string;
  message: string;
}

function formatFieldErrors(errors: FieldError[]): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const error of errors) {
    if (!result[error.key]) {
      result[error.key] = [];
    }
    result[error.key].push(error.message);
  }
  return result;
}

export class Validation422Exception extends HttpException {
  constructor(errors: FieldError[]) {
    // super(
    //   {
    //     statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    //     errors: errors,
    //     error: 'Unprocessable Entity',
    //   },
    //   HttpStatus.UNPROCESSABLE_ENTITY,
    // );  turn to toFormattedResponse
    super(
      Validation422Exception.toFormattedResponse(errors),
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }

  static toFormattedResponse(errors: FieldError[]) {
    const firstError = errors[0].message;
    return {
      success: false,
      result: null,
      error: {
        code: 422,
        message: firstError,
      },
      errors: formatFieldErrors(errors),
    };
  }
}
