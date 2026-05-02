export class UrlSlug {
  public readonly value: string;
  constructor(value: string) {
    if (/\s/.test(value)) throw new Error('Slug cannot contain spaces');
    this.value = value.toLowerCase();
  }
}
