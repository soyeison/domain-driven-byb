export type AssetType =
  | 'MAIN_IMAGE'
  | 'GALLERY_IMAGE'
  | 'BROCHURE_PDF'
  | 'PROMO_VIDEO'
  | 'VIRTUAL_TOUR';

export class CmsAsset {
  constructor(
    public readonly type: AssetType,
    public readonly url: string,
    public readonly altText?: string,
  ) {
    if (!url.startsWith('http')) {
      throw new Error(`Invalid URL for asset type ${type}`);
    }
  }
}
