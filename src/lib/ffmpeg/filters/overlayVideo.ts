import {
  IRenderItemVideo,
  IFilterMakeData,
  VideoStream,
  AudioStream,
  IFilterInfo,
} from '../../../types/irender';

import {
  TrimVideoFfilterOption,
  ScaleVideoFfilterOption,
  TrimAudioFfilterOption,
} from './options';

import Ffilters from "../ffilters";
import FadeVideoFfilterOption from './options/fadeVideo';
import FadeAudioFfilterOption from './options/fadeAudio';
import { EFadeFilterType } from '../../../types/enums';



class OverlayVideoFilter extends Ffilters {
  private data: IRenderItemVideo | null = null;
  private assetStreamCommand = {
    video: '',
    audio: '',
  };

  private overlayVideoCommand: string = '';
  private overlayAudioCommand: string = '';
  private startFrame: number = 0;
  private endFrame: number = 0;
  private positionX: number = 0;
  private positionY: number = 0;
  private inputFrameRate: number = 0;
  private assetInFrame: number = 0;
  private asestOutFrame: number = 0;  
  private inputWidth: number = 0;
  private inputHeight: number = 0;
  private width: number = 0;
  private height: number = 0;

  private filters: any[] = [];

  private fadeFilterData: any[] = [];
  private existTrimOption: boolean = false;
  private existFadeOption: boolean = false;
  private existChangeScaleOption: boolean = false;
  private existAudio: boolean = false;

  constructor (data: IFilterMakeData) {
    
    super(data.assetData, data.assetIndex, data.filterNumber, data.inputStream);   
    this.data = data.data as IRenderItemVideo;
   // console.log('OverlayVideoFilter> ', data);
   
    this.initData();
    this.arrangeStream();
    this.arrageCommand();
    this.arrangeOutStream();
  }

  private initData(): void {
    const itemData = this.data as IRenderItemVideo;
    this.startFrame = itemData.frame.start;
    this.endFrame = itemData.frame.end;
    this.positionX = this.data?.position.x ?? 0;
    this.positionY = this.data?.position.y ?? 0;
    this.inputFrameRate = this.getInputVideoStream().framerate;
    this.inputWidth = this.getInputVideoStream().size.width;
    this.inputHeight = this.getInputVideoStream().size.height;
    this.assetInFrame = itemData.assetframe?.in ?? 0;
    this.asestOutFrame = itemData.assetframe?.out ?? 0;
    this.width = itemData.size.width;
    this.height = itemData.size.height;

    this.filters = this.data?.filters ?? [];
    this.fadeFilterData = this.getFadeFilterData();

    this.existTrimOption = this.useTrim();
    this.existChangeScaleOption = this.isChangeScale();    
    this.existFadeOption = this.existFadeFilter();
    this.existAudio = this.isExistAudio();    

  }

  private arrangeStream(): void {    
    this.assetStreamCommand.video = this.getAssetVideoStreamCommand();    
    if (this.existAudio) {
      this.assetStreamCommand.audio = this.getAssetAudioStreamCommand();
    }
  }

  private isExistAudio(): boolean {
    return this.data?.audio ?? false;
  }

  private getAssetAudioStreamCommand(): string {
    const assetAudioStreamCommands = [];

    if (this.existTrimOption) {      
      assetAudioStreamCommands.push(this.getAudioTrimCommand());
    }

    if (this.existFadeOption) {
      assetAudioStreamCommands.push(this.getFadeFilterCommand('audio'));
    }

    if (assetAudioStreamCommands.length >0 ) {
      return `${this.audioStream}${assetAudioStreamCommands.join(',')}${this.assetAudioFilterStreamName}`;
    }

    return  `${this.audioStream}acopy${this.assetAudioFilterStreamName}`;  
  }

  private getAssetVideoStreamCommand(): string {
    const assetVideoStreamCommands = [];

    if (this.existTrimOption) {      
      assetVideoStreamCommands.push(this.getVideoTrimCommand());
    }

    if (this.existChangeScaleOption) {
      assetVideoStreamCommands.push(this.getVideoScaleCommand());
    }

    if (this.existFadeOption) {
      assetVideoStreamCommands.push('format=rgba');
      assetVideoStreamCommands.push(this.getFadeFilterCommand('video'));
    }

    if (assetVideoStreamCommands.length > 0 ) {
      return `${this.videoStream}${assetVideoStreamCommands.join(',')}${this.assetVideoFilterStreamName}`;
    }
    
    return `${this.videoStream}copy${this.assetVideoFilterStreamName}`;
  }

  getFadeFilterData() {
    return this.filters.filter((filter) => (filter as IFilterInfo).type === 'fade');
  }

  existFadeFilter(): boolean {    
    return this.fadeFilterData.length > 0;
  }

  getInputVideoStreamName(): string {
    return `[${this.inputVideoStreams[0].name}]`;
  }

  getInputAudioStreamName(): string {
    return `[${this.inputAudioStreams[0].name}]`; 
  }

  getInputVideoStream(): VideoStream {
    return this.inputStreams[0].video as VideoStream;
  }

  getInputAudioStream(): AudioStream {
    return this.inputStreams[0].audio as AudioStream;
  }

  getOverLayAudioCommand(): string {
    if (!this.isExistAudio()) return '';
    const streamCommand = [];    
    // const itemData = this.data as IRenderItemVideo;
    // const startFrame = itemData.frame.start;
    // const endFrame = itemData.frame.end;
    // const inputStreamAudio = this.inputStreams[0].audio as AudioStream;

    streamCommand.push(
      this.getInputAudioStreamName(),
      this.assetAudioFilterStreamName,
      `amix=inputs=2:duration=longest`
    );
    
    // 우선 오디오 부분이 필요할지 모르겠다 우선 주석.
    // if (inputStreamAudio.frame.start !== startFrame || inputStreamAudio.frame.end !== endFrame ) { 
    //   const enableCommand = `:enable='between(n,0,${endFrame})'`; // `:enable='between(n,${startFrame},${endFrame})'`
    //   streamCommand.push(enableCommand);
    // }

    return `${streamCommand.join('')}${this.outAudioStreamName}`;
  }

  getOverLayVideoCommand(): string {
    const streamCommand = [];    

    streamCommand.push(
      this.getInputVideoStreamName(), 
      this.assetVideoFilterStreamName,
      `overlay=x=${this.positionX}:y=${this.positionY}`
    );

    if (this.isDiffVideoFrame()) { 
      // const enableCommand = ; // `:enable='between(n,${startFrame},${endFrame})'`
      streamCommand.push(`:enable='between(n,0,${this.endFrame})'`);
    }

    return `${streamCommand.join('')}${this.outVideoStreamName}`;
  }

  getFadeFilterCommand(streamType: string): string {
    const filterCommand: string[] = [];
    let start = 0;
    let duration = 0;
    let type = EFadeFilterType.In;

    this.fadeFilterData.forEach((filter) => {
      start = ((filter as IFilterInfo).options.start + this.startFrame) / this.inputFrameRate;
      duration = (filter as IFilterInfo).options.duration / this.inputFrameRate;
      type = (filter as IFilterInfo).options.type === 'fadeIn' ? EFadeFilterType.In : EFadeFilterType.Out;     
      if (streamType === 'audio') {
        filterCommand.push(new FadeAudioFfilterOption(start, duration, type).toString());
      } else {
        filterCommand.push(new FadeVideoFfilterOption(start, duration, type).toString());
      }
    });
   
    return filterCommand.length > 0 ?  filterCommand.join(',') : '';
  }

  // getAudioFadeFilterCommand(): string { 
  //   const filterCommand: string[] = [];
  //   let start = 0;
  //   let duration = 0;
  //   let type = EFadeFilterType.In;

  //   this.fadeFilterData.forEach((filter) => {
  //     start = (filter as IFilterInfo).options.start;
  //     duration = (filter as IFilterInfo).options.duration;
  //     type = (filter as IFilterInfo).options.type === 'fadeIn' ? EFadeFilterType.In : EFadeFilterType.Out;     
  //     filterCommand.push(new FadeAudioFfilterOption(start, duration, type).toString());
  //   });
   
  //   return filterCommand.length > 0 ?  filterCommand.join(',') : '';
  // }

  // getVideoFadeFilterCommand(): string {
  //   const filterCommand: string[] = [];
  //   let start = 0;
  //   let duration = 0;
  //   let type = EFadeFilterType.In;

  //   this.fadeFilterData.forEach((filter) => {
  //     start = (filter as IFilterInfo).options.start;
  //     duration = (filter as IFilterInfo).options.duration;
  //     type = (filter as IFilterInfo).options.type === 'fadeIn' ? EFadeFilterType.In : EFadeFilterType.Out;     
  //     filterCommand.push(new FadeVideoFfilterOption(start, duration, type).toString());
  //   });
   
  //   return filterCommand.length > 0 ?  filterCommand.join(',') : '';
  // }

  // isDiffAudioFrame(): boolean {
  //   return this.getInputAudioStream().frame.start != this.startFrame || 
  //          this.getInputAudioStream().frame.end != this.endFrame;
  // }

  isDiffVideoFrame(): boolean {
    return this.getInputVideoStream().frame.start != this.startFrame || 
           this.getInputVideoStream().frame.end != this.endFrame;
  }

  getVideoScaleCommand(): string {
    const width = this.width || this.inputWidth;
    const height = this.height || this.inputHeight;
    return new ScaleVideoFfilterOption(width, height).toString();
  }

  getAudioTrimCommand(): string {    
    const trimStartSec = (this.assetInFrame / this.assetFrameRate).toFixed(6);    
    const trimEndSec = (this.asestOutFrame / this.assetFrameRate).toFixed(6);
    const startPts = this.startFrame > 0 ? 
          Number((Number(this.startFrame) / Number(this.inputFrameRate)).toFixed(3)) * 1000 :
          0;

    return new TrimAudioFfilterOption(true, Number(trimStartSec), Number(trimEndSec), 'sec', startPts).toString();
  }

  getVideoTrimCommand(): string {
    const startPts = this.startFrame > 0 ? Number(this.startFrame) / Number(this.inputFrameRate) : 0;
    return new TrimVideoFfilterOption(this.assetInFrame, this.asestOutFrame, 'frame', startPts).toString();
  }

  useTrim(): boolean {
    return this.data?.trim as boolean;
  }

  isChangeScale(): boolean {
    const inputStreamVideo = this.inputStreams[0].video as VideoStream;
    const width = inputStreamVideo.size.width;
    const height = inputStreamVideo.size.height;
    const assetWidth = this.assetData.size?.width;
    const assetHeight = this.assetData.size?.height;

    return (width !== assetWidth || height !== assetHeight || this.data?.scale !== 1);
  }

  arrageCommand(): void {  
    this.overlayVideoCommand = this.getOverLayVideoCommand();
    this.overlayAudioCommand = this.getOverLayAudioCommand();
    

    if (this.assetStreamCommand.video) this.addCommand(this.assetStreamCommand.video);
    if (this.assetStreamCommand.audio) this.addCommand(this.assetStreamCommand.audio);

    this.addCommand(this.overlayVideoCommand);

    if (this.overlayAudioCommand) {
      this.addCommand(this.overlayAudioCommand);
    }
  }

  arrangeOutStream(): void {
    this.inputVideoStreams[0].name = this.outVideoStreamName.replace('[','').replace(']','');
    this.setOutVideoStream(this.inputVideoStreams[0]);

    if (this.overlayAudioCommand) { 
      this.inputAudioStreams[0].name = this.outAudioStreamName.replace('[','').replace(']','');
      this.setOutAudioStream(this.inputAudioStreams[0]);
    }
  }

  getCommandString(): string {
    return this.commands.join(';');
  }

  toString(): string {
    return this.getCommandString();
  }
}

export default OverlayVideoFilter;
