import { __ } from '@app/helpers';
import { DomainException } from './domain.exception';

export class ResourceNotFoundException extends DomainException {
  constructor(
    public readonly resource?: string,
    public readonly id?: string | number,
  ) {
    super(__('error.not_found', { name: __('attributes.resource') }), 404);
  }
}
