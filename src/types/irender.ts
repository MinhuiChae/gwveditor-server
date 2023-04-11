/* eslint-disable no-shadow */
/**
 * Render 관련 interface
 */

import FfmpegStream from '../lib/ffmpeg/ffmpegStream';
import VideoStream from '../lib/ffmpeg/streams/videoStream';
import AudioStream from '../lib/ffmpeg/streams/audioStream';
import { IAssetSet, IExportSet } from './iwork';

 enum ERenderDataType {
  'Default' = '',
  'Add' = 'add',
  'Overlay' = 'overlay',
  'Text' = 'text',
  'Graphic' = 'graphic',
}

enum ERenderItemType {
  'Default' = '',
  'BaseVideo' = 'base-video',
  'BaseAudio' = 'base-audio',
  'Image' = 'image',
  'Video' = 'video',
  'Audio' = 'audio',
  'Text' = 'text'
}

interface IRenderItemBaseInfo {
  size: {
    width: number,
    height: number,
  },
  position: {
    x: number,
    y: number,
  },
  frame: {
    start: number,
    end: number,
  }
  scale: number,
  alpha: number,
  framerate?: number,
  filters?: [],
}

interface IRenderItemBaseVideo extends IRenderItemBaseInfo {
  color: string,
  duration: number,
}

interface IRenderItemVideo extends IRenderItemBaseInfo {
  
  assetframe?: {
    in: number,
    out: number,
  },
  audio: boolean,
  trim: boolean,
}

interface IRenderItemAudio extends IRenderItemBaseInfo {
  samplerate?: string,
  assetframe?: {
    in: number,
    out: number,
  },
  trim: boolean,
}

interface IRenderItemImage extends IRenderItemBaseInfo {
  info?: string,
}

interface IBorderFilterOpts {
  borderWidth?: number,
  borderColor?: string,
}

interface IBoxFilterOpts {
  boxWidth?: number,
  boxColor?: string,
  boxColorOpacity?: number,
}

interface ITextDrawDatas {
  text: string,
  x: number,
  y: number,
  filePath?: string,
}

interface IRenderItemText extends IRenderItemBaseInfo {
  fontcolor: string,
  fontsize: number,
  fontFamily: string,
  text: string,
  box?: IBoxFilterOpts,
  border?: IBorderFilterOpts,
  drawDatas?: ITextDrawDatas[]
}

type TRenderItems = IRenderItemBaseVideo | IRenderItemVideo | IRenderItemImage | IRenderItemText;

interface IRenderItem {
  id: string,
  assetid?: string,
  type: ERenderItemType,
  datas?: TRenderItems,
  action?: ERenderDataType,
}

interface IRenderData {
  ord: number,
  type: ERenderDataType,
  id: string,
}

interface IRenderJson {
  items: IRenderItem[],
  datas: IRenderData[],
}

interface IRenderItemData {
  type: ERenderItemType,
  datas: IRenderItem,
}

interface IRenderItemDataInfo {
  type: ERenderItemType,
  datas: TRenderItems,
  assetid?: string,
  action?: ERenderDataType,
}

interface IFfiltersStream {
  assetIndex?: number,
  video?: FfmpegStream | string | undefined,
  audio?: FfmpegStream | string | undefined,
}

interface IFfiltersOutStream {
  stream: IFfiltersStream[],
  command: string,
}

interface IFilterMakeData {
 type: ERenderDataType,
 // asset: IAssetSet | undefined,
 // data: TRenderItems | undefined,
 // inputStream: IFfiltersStream[],
 assetIndex: number,
 renderData: IRenderItem,
 // assetStream: IFfiltersStream,
 // export?: IExportSet,  
  data: TRenderItems,
  assetData: IAssetSet | null,
  // assetStream: IFfiltersStream,
  inputStream: IFfiltersStream[],
  filterNumber: number,
}

interface IFilterInfo {  
  [key: string]: any;
}

export {
  ERenderDataType,
  ERenderItemType,
  IRenderItemBaseInfo,
  IRenderItemBaseVideo,
  IRenderItemVideo,
  IRenderItemAudio,
  IRenderItemImage,
  IRenderItemText,
  TRenderItems,
  IRenderItem,
  IRenderData,
  IRenderJson,
  IRenderItemData,
  IRenderItemDataInfo,
  IFfiltersStream,
  IFfiltersOutStream,
  IFilterMakeData,
  IAssetSet,
  FfmpegStream,
  VideoStream,
  AudioStream,
  IFilterInfo,
  IBorderFilterOpts,
  IBoxFilterOpts,
  ITextDrawDatas,
};
