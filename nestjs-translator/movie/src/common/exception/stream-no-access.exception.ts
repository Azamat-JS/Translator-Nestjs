import { __ } from '@app/helpers';
import { DomainException } from './domain.exception';

export class SubscriptionRequiredException extends DomainException {
  constructor(
    public message: string = __('error.required', {
      name: __('attributes.subscription'),
    }),
    public code: number = 488,
  ) {
    super(message, code);
  }
}
