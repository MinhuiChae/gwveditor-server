import { 
  IAssetSet,
} from '../../../types/iwork';

import { 
  ERenderItemType,
} from '../../../types/irender';

class AssetsCommand {
  assetDatas: IAssetSet[] = [];
  constructor(assets?: IAssetSet[]){
    if (assets) {
      this.assetDatas = assets.filter((asset) => asset.type !== 'text');
    }
  }

  toString(): string {
    return this.getCommand();
  }

  getCommand(): string {    
    const assetDatas = this.assetDatas;
    const assetUrls = assetDatas.map((asset) => asset.src);   
    return assetUrls.length > 0 ? `-i ${assetUrls.join(' -i ')}` : '';
  }

  findAssetIndex(id: string): number {
    return this.assetDatas.findIndex((asset: IAssetSet) => asset.id === id) ?? -1;
  }

  findAsset(id: string): IAssetSet | null {
    return this.assetDatas.find((asset: IAssetSet) => asset.id === id) ?? null;
  }

  findAssetwithIndex(id: string): { index: number, asset: IAssetSet | undefined} {
    let index = -1;
    const asset = this.assetDatas.find((asset, i) => {
      if (asset.id === id) {
        index = i;
        return asset;
      }
    })

    return {
      index: index,
      asset: asset ?? undefined,
    }
  }

  isAudioAsset(data: IAssetSet): boolean {
    return data.type === ERenderItemType.Audio;
  }

  isVideoAsset(data: IAssetSet): boolean {
    return !this.isAudioAsset(data);
  }
}

export default AssetsCommand;