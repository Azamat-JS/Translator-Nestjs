import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { DomainException } from './domain.exception';
import { config } from 'dotenv';
import { formatDate } from 'date-fns';

config();

@Catch(HttpException, DomainException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException | DomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    void this.send(exception, host);

    if (exception instanceof DomainException) {
      return response.status(200).json({
        success: false,
        result: null,
        error: {
          code: exception.code || 400,
          message: exception.message,
        },
      });
    }

    const status = exception.getStatus();
    const errorResponse = exception.getResponse();

    // Validation error (422)
    if (status === 422) {
      return response.status(200).json(errorResponse);
    }

    response.status(200).json({
      success: false,
      result: null,
      error: {
        code: status,
        message: exception.message,
      },
    });
  }

  send(exception: HttpException | DomainException, host: ArgumentsHost) {
    if (
      !process.env.LOGGER_BOT_TOKEN ||
      !process.env.LOGGER_CHAT_ID ||
      !process.env.LOGGER_BOT_CLIENT_THREAD_ID
    ) {
      return;
    }

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : exception.code;

    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();

    const message = [
      '',
      `*${status}*`,
      '',
      `❗*Error:* ${exception.message}`,
      `⚙️ *Status Code:* ${status}`,
      `🕛 Time: ${formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss')}`,
      `🔗 *URL:* ${request.url}`,
      `🔠 *Method:* ${request.method}`,
    ];

    if (request.headers) {
      this._appendJsonBlock('Headers', request.headers, message);
    }
    if (request.body) {
      this._appendJsonBlock('Request Body', request.body, message);
    }

    if (exception.message) {
      const responseData = {
        success: false,
        result: null,
        error: {
          code: status,
          message: exception.message,
        },
      };

      this._appendJsonBlock('Response Body', responseData, message);
    }

    if (status >= 400) {
      fetch(
        `https://api.telegram.org/bot${process.env.LOGGER_BOT_TOKEN}/sendMessage`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: process.env.LOGGER_CHAT_ID,
            message_thread_id: process.env.LOGGER_BOT_CLIENT_THREAD_ID,
            text: message.join('\n'),
            parse_mode: 'Markdown',
          }),
        },
      )
        .then((r) => {
          console.log(r);
        })
        .catch((error) => console.log(error));

      return;
    }
  }

  private _appendJsonBlock(title: string, data: any, message: string[]) {
    message.push(
      '',
      `📃 ${title}: `,
      '```json',
      JSON.stringify(data, null, 2),
      '```',
    );
  }
}
