export class DomainException extends Error {
  constructor(
    public readonly message: string,
    public readonly code: number,
  ) {
    super(message);
    this.name = 'DomainException';
  }
}
