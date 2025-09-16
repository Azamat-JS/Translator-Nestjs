import {
  Controller,
  Get,
  Headers,
  Param,
  ParseUUIDPipe,
  Req,
  Res,
} from '@nestjs/common';
import { StreamService } from './stream.service';
import { ApiBearerAuth } from '@nestjs/swagger'; // your service
import { Request, Response } from 'express';
import { titleType } from '@movie/db/enums/base.enum';
import { UAParser } from 'ua-parser-js';

@ApiBearerAuth('access-token')
@Controller('stream/videos')
export class StreamController {
  constructor(private readonly streamService: StreamService) {}

  @Get(':type/:id/*path')
  async getHlsFiles(
    @Param('type') type: titleType,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('path') segment: string,
    @Headers('x-check') secure: string, //query
    // @Query('x-check') secure: string,
    @Req() request: Request,
    @Res() res: Response,
  ) {
    const ua = request.headers['user-agent'] ?? '';
    const os = new UAParser(ua).getOS().name;

    // Telegram logging
    // const message = [
    //   `🔗 *URL:* ${request.originalUrl}`,
    //   `🔠 *Method:* ${request.method}`,
    //   `📃 Headers: `,
    //   '```json',
    //   JSON.stringify(request.headers, null, 2),
    //   '```',
    // ];

    // fetch(
    //   'https://api.telegram.org/bot8020649765:AAHGaG-fYZI5G4y-l0Y9-bKfX1KAlpvYsHU/sendMessage',
    //   {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //       chat_id: -4800645746,
    //       text: message.join('\n'),
    //       parse_mode: 'Markdown',
    //     }),
    //   },
    // ).catch((error) => console.error('Telegram log error:', error));
    let normalizedSegment: string = `${segment.replaceAll(',', '/')}`;

    if ((os === 'iOS' && secure !== undefined) || os !== 'iOS') {
      const isValid = await this.streamService.validateToken(
        secure,
        id,
        normalizedSegment,
      );

      if (!isValid) {
        return res.status(403).send('Forbidden');
      }
    }

    normalizedSegment = `videos/${type}/${id}/${normalizedSegment}`;

    const { file, mimeType } = await this.streamService.stream(
      type,
      id,
      normalizedSegment,
    );
    res.setHeader('Content-Type', await mimeType);

    (await file).pipe(res);
  }
}
