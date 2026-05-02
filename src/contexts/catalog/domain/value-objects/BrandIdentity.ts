export class BrandIdentity {
  constructor(
    public readonly logoUrl: string,
    public readonly primaryColor: string,
    public readonly secondaryColor: string,
  ) {
    if (!/^#[0-9A-F]{6}$/i.test(primaryColor))
      throw new Error('Invalid primary color hex');
  }
}
