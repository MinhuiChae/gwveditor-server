import {
  IRenderItemVideo,
  IRenderItemImage,
  IFilterMakeData,
  VideoStream,
  AudioStream,
} from '../../../types/irender';

import {
  TrimVideoFfilterOption,
  ScaleVideoFfilterOption,
  TrimAudioFfilterOption,
} from './options';

import Ffilters from "../ffilters";

class overlayGraphicFilter extends Ffilters {
  private data: IRenderItemImage | null = null;
  private startFrame: number = 0;
  private endFrame: number = 0;
  private positionX: number = 0;
  private positionY: number = 0;
  private width: number = 0;
  private height: number = 0;

  private assetStreamCommand = {
    video: '',
    audio: '',
  }

  constructor (data: IFilterMakeData) {
    super(data.assetData, data.assetIndex, data.filterNumber, data.inputStream);   
    this.data = data.data as IRenderItemImage;   

    this.initData();
    this.arrangeStream();
    this.arrageCommand();
    this.arrangeOutStream();
  }

  initData(): void {
    const itemData = this.data as IRenderItemImage;
    this.startFrame = itemData.frame.start;
    this.endFrame = itemData.frame.end;
    this.positionX = itemData.position.x;
    this.positionY = itemData.position.y;
    this.width = itemData.size.width;
    this.height = itemData.size.height;
  }

  arrangeStream(): void {
    this.assetStreamCommand.video = this.getAssetVideoStreamCommand();    
  }

  getInputVideoStreamName(): string {
    return `[${this.inputVideoStreams[0].name}]`;
  }

  getAssetVideoStreamCommand(): string {
    const assetVideoStreamCommands = [];
    assetVideoStreamCommands.push(this.getVideoScaleCommand());
    return `${this.videoStream}${assetVideoStreamCommands.join(',')}${this.assetVideoFilterStreamName}`;
  }

  getVideoScaleCommand(): string {
    return new ScaleVideoFfilterOption(this.width, this.height).toString();
  }

  getGraphicOverlayCommand(): string {
    const command: string[] = [];
    command.push(
      this.getInputVideoStreamName(), 
      this.assetVideoFilterStreamName,
      `overlay=x=${this.positionX}:y=${this.positionY}`
    );

    command.push(`:enable='between(n,${this.startFrame},${this.endFrame})'`);

    return `${command.join('')}${this.outVideoStreamName}`;
  }

  arrageCommand(): void {  
    const overlayCommand = this.getGraphicOverlayCommand();
    this.addCommand(this.assetStreamCommand.video);
    this.addCommand(overlayCommand);
  }

  arrangeOutStream(): void {
    this.inputVideoStreams[0].name = this.outVideoStreamName.replace('[','').replace(']','');
    this.setOutVideoStream(this.inputVideoStreams[0]);
  }

  getCommandString(): string {
    return this.commands.join(';');
  }

  toString(): string {
    return this.getCommandString();
  }
}

export default overlayGraphicFilter;