import {
  ERenderDataType,
  ERenderItemType,
  IRenderItemBaseInfo,
  IRenderItemBaseVideo,
  IRenderItemImage,
  IRenderItemText,
  IRenderItemVideo,
  IRenderJson as IRenderJsonSet,
  IRenderItem,
  IRenderData,
  TRenderItems,
  IRenderItemData,
  IRenderItemDataInfo,
} from '../types/irender'

interface ICommandOptions {
  replaceWhiteSpace: boolean,
}

interface IInfoSet {
  version: string,
  datetime: string,
  writer: string,
}

interface IAudioCodecSet {
  codec: string,
  samplerate?: string,
  bitrate?: string,
}

interface IVideoCodecSet {
  codec: string,
  bitrate?: string,
  bitratetype?: string,
}

interface IExportSet {
  aspectratio?: string,
  width?: string,
  height?: string,
  framerate?: string,
  drop?: string,
  duration?: string,
  frames?: string,
  audio?: IAudioCodecSet,
  video?: IVideoCodecSet,
}

interface IAssetSet {
  id?: string,
  type?: string,
  audiodisable?: string,
  fit?: string,
  src?: string,
  scale?: string,
  framerate?: number,
  size?: {
    width: number,
    height: number,
  }
}

interface IWorkJsonSet {
  gve:{
    info: IInfoSet,
    export: IExportSet,
    assets: IAssetSet[],
    render: IRenderJsonSet,
  }
}

export {
  IInfoSet,
  IAudioCodecSet,
  IVideoCodecSet,
  IExportSet,
  IAssetSet,
  IWorkJsonSet,
  IRenderJsonSet,
  ICommandOptions,
}