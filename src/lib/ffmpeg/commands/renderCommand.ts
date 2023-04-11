import { 
  IAssetSet,
  IRenderJsonSet,
} from '../../../types/iwork';

import {
  IRenderData,
  IRenderItem,
  ERenderDataType,
  ERenderItemType,
  IRenderItemVideo,
  IFfiltersStream,
  IFilterMakeData,
  TRenderItems,
} from '../../../types/irender';

import {
  BaseVideoFilter,
  BaseAudioFilter,
  OverlayVideoFilter,
  OverlayTextFilter,
  OverlayAudioFilter,
  OverlayGraphicFilter,
} from '../../../lib/ffmpeg/filters';

import Ffilters from '../../ffmpeg/ffilters';
import AudioStream from '../../ffmpeg/streams/audioStream';
import VideoStream from '../../ffmpeg/streams/videoStream';

import ExportCommand from './exportsCommand';
import AssetsCommand from './assetsCommand';

class FfmpegRenderCommand {
  private renderDatas: IRenderData[] = []; 
  private renderItems: IRenderItem[] = [];
  private assetCommand: AssetsCommand; 
  private exportCommand: ExportCommand;
  private commands: string[] = [];
  private baseCommand: string = '-filter_complex';

  private lastStream: IFfiltersStream = {};
  private filter: Ffilters | null = null;

  private outStreamNumber: number = 0;
  private filterNumber: number = 0;

  constructor(render: IRenderJsonSet, assetCommand: AssetsCommand, exportCommand: ExportCommand){
    this.assetCommand = assetCommand;
    this.exportCommand = exportCommand;
    this.setRenderDatas(render.datas);
    this.setRenderItems(render.items);   
    this.analysisRenderCommand();
  }

  setRenderItems(items: IRenderItem[]) {
    this.renderItems = items;
  }

  setRenderDatas(datas: IRenderData[]) {
    this.renderDatas = datas;
  }
 
  getCommand(): string {
    return `${this.baseCommand} "${this.commands.join(';')}"`;
  }

  toString(): string {
    return this.getCommand();
  }

  addCommand(command: string | undefined) {
    if (command) {
      this.commands.push(command);
    }
  }

  analysisRenderCommand(): void {
    this.renderDatas.forEach((data: IRenderData) => {
      const renderItem = this.findRenderItem(data.id);      
      if (renderItem) {
        this.filter = this.getfilterToDatas(this.getRenderData(data, renderItem));
        this.updateLastStream();
        this.addCommand(this.filter?.toString());
        this.filterNumber++;
      }
    });

    // console.log('this.lastStream.video', this.lastStream.video);
  }

  getfilterToDatas(datas: IFilterMakeData): Ffilters | null {
    let filter = null;  
    
    switch (datas.type) {
      case ERenderDataType.Add:
        filter = this.isBaseVideoType(datas.renderData.type) ? 
                  new BaseVideoFilter(datas) : new BaseAudioFilter(datas);
      break;

      case ERenderDataType.Overlay:    
        filter = this.isVideoOverlay(datas.renderData.type) ?
                  new OverlayVideoFilter(datas) : new OverlayAudioFilter(datas);
      break;

      case ERenderDataType.Text:
        filter = new OverlayTextFilter(datas); 
      break;

      case ERenderDataType.Graphic:
        filter = new OverlayGraphicFilter(datas);
      break;
    }
    
    return filter;
  }

  updateLastStream() {
    this.lastStream.video = this.filter?.getVideoOutStream() ?? this.lastStream.video;
    this.lastStream.audio = this.filter?.getAudioOutStream() ?? this.lastStream.audio;
  }

  isBaseVideoType(type: string): boolean {
    return type === ERenderItemType.BaseVideo;
  }

  isVideoOverlay(type: string): boolean {
    return type === ERenderItemType.Video;
  }
  
  getRenderData(data: IRenderData, renderItem: IRenderItem): IFilterMakeData {  
    const dataId = data.id;
    const assetDatas = this.assetCommand.findAssetwithIndex(renderItem.assetid as string);
   
    return {
      type: data.type,
      data: renderItem.datas as TRenderItems,
      renderData: renderItem,
      assetIndex: assetDatas.index,
      assetData: assetDatas.asset ?? null,
      inputStream: [this.lastStream],
      filterNumber: this.filterNumber,
    }
  }

  findRenderItem(id: string): IRenderItem | null {
    return this.renderItems.find((renderItem) => renderItem.id === id) ?? null;
  }
    

  getExportVideoStreamName(): string  {
    return (this.lastStream.video as VideoStream)?.name;
  }

  getExportAudioStreamName(): string {
    return (this.lastStream.audio as AudioStream)?.name;
  }
}

export default FfmpegRenderCommand;