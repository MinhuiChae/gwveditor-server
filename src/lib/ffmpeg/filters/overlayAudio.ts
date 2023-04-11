import {
  IRenderItemAudio,
  IFilterMakeData,
  VideoStream,
  AudioStream,
  IFilterInfo,
} from '../../../types/irender';

import {
  TrimAudioFfilterOption,
} from './options';

import Ffilters from "../ffilters";
import { EFadeFilterType } from '../../../types/enums';
import FadeAudioFfilterOption from './options/fadeAudio';

class OverlayAudioFilter extends Ffilters {
  private data: IRenderItemAudio;
  private startFrame: number = 0;
  private endFrame: number = 0;
  private assetInFrame: number = 0;
  private asestOutFrame: number = 0; 
  private assetStreamCommand = {
    video: '',
    audio: '',
  };

  private inputFrameRate: number = 0;

  private overlayAudioCommand: string = '';

  private filters: any[] = [];

  private fadeFilterData: any[] = [];
  private existTrimOption: boolean = false;
  private existFadeOption: boolean = false;

  constructor(data: IFilterMakeData) {
    super(data.assetData, data.assetIndex, data.filterNumber, data.inputStream);   
    console.log('OverlayAudioFilter> ', data);
    this.data = data.data as IRenderItemAudio;
    this.initData();
    this.arrangeStream();
    this.arrageCommand();
    this.arrangeOutStream();
  }

  private initData(): void {
    const itemData = this.data as IRenderItemAudio;
    this.startFrame = itemData.frame.start;
    this.endFrame = itemData.frame.end;
    this.assetInFrame = itemData.assetframe?.in ?? 0;
    this.asestOutFrame = itemData.assetframe?.out ?? 0;
    this.inputFrameRate = this.getInputVideoStream().framerate;

    this.filters = this.data?.filters ?? [];
    this.fadeFilterData = this.getFadeFilterData();

    this.existTrimOption = this.useTrim();
    
    this.existFadeOption = this.existFadeFilter();
  }

  private arrangeStream(): void {    
    this.assetStreamCommand.audio = this.getAssetAudioStreamCommand();
  }

  private getAssetAudioStreamCommand(): string {
    const assetAudioStreamCommands = [];    
    if (this.existTrimOption) {      
      assetAudioStreamCommands.push(this.getAudioTrimCommand());
    } else if (this.startFrame > 0) {
      assetAudioStreamCommands.push(this.getAudioDelayCommand());
    }

    if (this.existFadeOption) {
      assetAudioStreamCommands.push(this.getFadeFilterCommand());
    }

    if (assetAudioStreamCommands.length > 0 ) {
      return `${this.audioStream}${assetAudioStreamCommands.join(',')}${this.assetAudioFilterStreamName}`;
    }

    return  `${this.audioStream}acopy${this.assetAudioFilterStreamName}`;  
  }

  getOverLayAudioCommand(): string {
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

  getFadeFilterCommand(): string {
    const filterCommand: string[] = [];
    let start = 0;
    let duration = 0;
    let type = EFadeFilterType.In;

    this.fadeFilterData.forEach((filter) => {
      start = ((filter as IFilterInfo).options.start + this.startFrame) / this.inputFrameRate;
      duration = (filter as IFilterInfo).options.duration / this.inputFrameRate;
      type = (filter as IFilterInfo).options.type === 'fadeIn' ? EFadeFilterType.In : EFadeFilterType.Out;     
      filterCommand.push(new FadeAudioFfilterOption(start, duration, type).toString());
    });
   
    return filterCommand.length > 0 ?  filterCommand.join(',') : '';
  }

  getInputAudioStreamName(): string {
    return `[${this.inputAudioStreams[0].name}]`; 
  }

  getFadeFilterData() {
    return this.filters.filter((filter) => (filter as IFilterInfo).type === 'fade');
  }

  existFadeFilter(): boolean {    
    return this.fadeFilterData.length > 0;
  }

  getAudioTrimCommand(): string {    
    const frameRate = this.inputFrameRate;
    const trimStartSec = (this.assetInFrame / frameRate).toFixed(6);    
    const trimEndSec = (this.asestOutFrame / frameRate).toFixed(6);
    const startPts = 0;

    return new TrimAudioFfilterOption(true, Number(trimStartSec), Number(trimEndSec), 'sec', startPts).toString();
  }

  getAudioDelayCommand(): string {
    const frameRate = this.inputFrameRate;
    const trimStartSec = (this.startFrame / frameRate).toFixed(6);    
    const trimEndSec = (this.endFrame / frameRate).toFixed(6);
    
    return new TrimAudioFfilterOption(false, Number(trimStartSec), Number(trimEndSec), 'sec', Number(trimStartSec) * 1000).toString();
  }

  arrageCommand(): void {  
    this.overlayAudioCommand = this.getOverLayAudioCommand();    
    if (this.assetStreamCommand.audio) this.addCommand(this.assetStreamCommand.audio);
    this.addCommand(this.overlayAudioCommand);
  }


  arrangeOutStream(): void {
    // this.inputVideoStreams[0].name = this.outVideoStreamName.replace('[','').replace(']','');
    this.setOutVideoStream(this.inputVideoStreams[0]);
    this.inputAudioStreams[0].name = this.outAudioStreamName.replace('[','').replace(']','');
    this.setOutAudioStream(this.inputAudioStreams[0]);
  }

  getCommandString(): string {
    return this.commands.join(';');
  }

  toString(): string {
    return this.getCommandString();
  }

  useTrim(): boolean {
    return this.data?.trim as boolean;
  }
}

export default OverlayAudioFilter;