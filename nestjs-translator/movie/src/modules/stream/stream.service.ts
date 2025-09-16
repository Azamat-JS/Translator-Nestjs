import { Injectable } from '@nestjs/common';
import { TitleService } from '../title/title.service';
import { FsService } from '@movie/fs/fs.service';
import { InjectFs } from '@movie/fs';
import { titleAccessType, titleType } from '@movie/db/enums/base.enum';
import { EpisodeService } from '../episode/episode.service';
import * as crypto from 'crypto';
import { AppConfig } from '../../common/config/app.config';
import { SubscriptionRequiredException } from '../../common/exception/stream-no-access.exception';
import { __ } from '@app/helpers/translation.helper';

@Injectable()
export class StreamService {
  constructor(
    private readonly titleService: TitleService,
    private readonly episodesService: EpisodeService,
    @InjectFs('private')
    private readonly fs: FsService,
    private readonly config: AppConfig,
  ) {}

  async validateToken(
    secure: string,
    id: string,
    segment: string,
  ): Promise<boolean> {
    try {
      const hash = crypto
        .createHmac('sha256', this.config.streamSecret)
        .update(`${id}${segment}`)
        .digest('hex');

      // Compare the provided salt with the generated hash
      return hash === secure;
    } catch (e) {
      return false;
    }
  }

  async stream(type: titleType, id: string, segment: string) {
    // faqat birinchi marta (master.m3u8) bo‘lsa check qilish
    if (segment.endsWith('master.m3u8')) {
      await this.checkById(type, id);
    }

    return {
      file: this.fs.read(segment),
      mimeType: this.fs.mimeType(segment),
    };
  }

  async checkById(type: titleType, id: string) {
    let title;

    if (type === titleType.SERIES) {
      const current = await this.episodesService.getOneById(id);
      title = await this.titleService.getOneById(current.titleId);
    } else {
      const current = await this.titleService.getOneById(id);
      title = current;
    }

    if (title.accessType !== titleAccessType.FREE) {
      // throw new SubscriptionRequiredException();
      if (title.accessType === titleAccessType.PURCHASE) {
        throw new SubscriptionRequiredException(
          __('error.required', { name: __('attributes.subscription') }),
        );
      } else if (title.accessType === titleAccessType.SUBSCRIPTION) {
        throw new SubscriptionRequiredException(
          __('error.required', { name: __('attributes.subscription') }),
        );
      }
    }
  }
}
