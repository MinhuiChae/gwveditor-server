
/**
 * 여거 WorkJsonParser
 */

import {  
  IWorkJsonSet,
} from '../types/iwork';

import FfmpegCommand from '../lib/ffmpeg/ffmpegCommand';

class WorkService {    
  private workjson: IWorkJsonSet;
  private ffmpegCommand: FfmpegCommand;
 
  constructor(json: IWorkJsonSet) {
    this.workjson = json;
    if (this.inVailidation())  {
      const gve = this.workjson.gve;
      this.ffmpegCommand = new FfmpegCommand(gve.export, gve.assets, gve.render);
    } else {
      throw new Error('Not constructor WorkService');
    }
  }

  runFfmpegCommand(): WorkService {
    this.ffmpegCommand.runCommand();
    return this;
  }

  getCommandForSpawn(): string[] {
    return this.ffmpegCommand.getSpawnArgs();
  }

  getCommand(): string {
    return this.ffmpegCommand.toString();
  }

  getExportFrames(): string {
    return this.ffmpegCommand.getExportFrames();
  }

  getExportFileName(): string {
    return this.ffmpegCommand.getExportFileName();
  }

  inVailidation(): boolean {
    if (this.workjson) {
      const gve = this.workjson.gve;
      return (gve.assets && gve.export && gve.info && gve.render) ? true : false;
    } else {
      return false;
    }
  }
}

export { IWorkJsonSet };
export default WorkService;