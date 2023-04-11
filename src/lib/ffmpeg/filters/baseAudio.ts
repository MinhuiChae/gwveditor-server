/**
 * 직관적으로 그냥 command를 filter 마다 했어야 하는가 
 * 중복을 피해서 공통으로 사용하도록 했어야 하나. 
 * addSizeCommand 참고
 */
 import {
  IRenderItemBaseVideo,
  IFfiltersOutStream,
  IFfiltersStream,
  IFilterMakeData,
  IAssetSet,
  IRenderItemBaseInfo,
  VideoStream,
  AudioStream,
  FfmpegStream,
} from '../../../types/irender';

import Ffilters from "../ffilters";
import { FFilterOptionParser as OptionParser } from './filterOptionParser';

class BaseAudioFilter extends Ffilters {
  private data: IRenderItemBaseVideo | null = null;
  private outName: string = 'abase';
  
  constructor (data: IFilterMakeData) {
    super(data.assetData, data.assetIndex, data.filterNumber, data.inputStream); 
    this.data = data.data as IRenderItemBaseVideo;
    this.arrageCommand();
    this.arrangeOutStream();
  }

  arrageCommand(): void {
    const datas = this.data;

    if (datas?.duration) {
      const framerate = datas.framerate;
      if (framerate){
        this.addDurationCommand((datas.duration / framerate).toFixed(6));
      }      
    }
  }

  arrangeOutStream(): void {    
    this.outStream.audio = this.getAssetAudioStream();
    this.outStreamAudioName = this.outName;
  }

  getAssetAudioStream(): FfmpegStream {    
    return new AudioStream(this.data as IRenderItemBaseInfo);
  }

  addDurationCommand(duration: string): void {
    const command = OptionParser.getDurationCommand(duration);
    this.addCommand(command);
  }

  getCommandString(): string {
    let commandStr = this.commands.join(':');
    commandStr = `anullsrc=${commandStr}[${this.outName}]`;
    return commandStr;
  }

  toString(): string {
    return this.getCommandString();
  }
}

export default BaseAudioFilter;