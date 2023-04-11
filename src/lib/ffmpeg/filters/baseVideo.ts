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

class BaseVideoFilter extends Ffilters {
  private data: IRenderItemBaseVideo | null = null;
  private outName: string = 'vbase';
  
  constructor (data: IFilterMakeData) {
    super(data.assetData, data.assetIndex, data.filterNumber, data.inputStream); 
    this.data = data.data as IRenderItemBaseVideo;
    this.arrageCommand();
    this.arrangeOutStream();
  }

  arrageCommand(): void {
    const datas = this.data;

    if (datas?.color) {
      this.addColorCommand(datas.color);
    }

    if (datas?.size) {
      this.addSizeCommand(datas.size.width.toFixed(0), datas.size.height.toFixed(0));
    }

    if (datas?.framerate) {
      this.addFrameRateCommand(datas.framerate.toString());
    }

    if (datas?.duration) {
      const framerate = datas.framerate;
      if (framerate){
        this.addDurationCommand((datas.duration / framerate).toFixed(6));
      }      
    }
  }

  arrangeOutStream(): void {    
    this.outStream.video = this.getAssetVideoStream();
    this.outStreamVideoName = this.outName;
  }

  getAssetVideoStream(): FfmpegStream {    
    return new VideoStream(this.data as IRenderItemBaseInfo);
  }

  addColorCommand(color: string): void {  
    const command = OptionParser.getColorCommand(color);
    this.addCommand(command);
  }

  addSizeCommand(width: string, height: string): void {
    const command = OptionParser.getSizeCommand(width, height);
    // this.command.push(`size=${width}x${height}`);
    this.addCommand(command);
  }

  addFrameRateCommand(framerate: string): void {
    const command = OptionParser.getFrameRateCommand(framerate);
    this.addCommand(command);
  }

  addDurationCommand(duration: string): void {
    const command = OptionParser.getDurationCommand(duration);
    this.addCommand(command);
  }

  getCommandString(): string {
    let commandStr = this.commands.join(':');
    commandStr = `color=${commandStr}[${this.outName}]`;
    return commandStr;
  }

  toString(): string {
    return this.getCommandString();
  }
}

export default BaseVideoFilter;