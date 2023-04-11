import { 
  IExportSet,
  IAssetSet,
  IRenderJsonSet,
} from '../../types/iwork';

import FfmpegRenderCommand from './commands/renderCommand';
import FfmpegAssetCommand from './commands/assetsCommand';
import FfmpegExportCommand from './commands/exportsCommand';

class FfmpegCommand {
  private renderCommand: FfmpegRenderCommand;
  private assetCommand: FfmpegAssetCommand; 
  private exportCommand: FfmpegExportCommand;
  
  private commands: string[] = []; // ['ffmpeg'];  

  constructor(exports: IExportSet, assets: IAssetSet[], renderData: IRenderJsonSet){
    this.exportCommand = new FfmpegExportCommand(exports);
    this.assetCommand = new FfmpegAssetCommand(assets);
    this.renderCommand = new FfmpegRenderCommand(renderData, this.assetCommand, this.exportCommand);
  }

  addCommmand(command: string) {
    this.commands.push(command);
  }

  getExportCommand(): FfmpegExportCommand {
    return this.exportCommand;
  }

  getRenderCommnad(): FfmpegRenderCommand {
    return this.renderCommand;
  }

  getExportFrames(): string {
    return this.exportCommand.Frames;
  }

  getExportFileName(): string {
    return this.exportCommand.getExportFileName();
  }

  /**
   * Swpan 명령을 사용하기위해 만든 함수
   * @returns string[]
   */
  getSpawnArgs(): string[] {
    const assetCmdStrs = this.assetCommand.toString().split(' ');
    const renderCmdStrs = this.renderCommand.toString().replace(/\"/g,'').split('-filter_complex ');
    
    // console.log('renderCmdStrs> ', renderCmdStrs);
    if (renderCmdStrs.length > 1) {
      renderCmdStrs[0] = '-filter_complex';
    }

    const exportCmdStrs =  this.exportCommand.toString().split(' ');
    
    return [...assetCmdStrs, '-progress', 'pipe:1',  ...renderCmdStrs, ...exportCmdStrs].filter(Boolean);
  }

  runCommand(): void {
    const assetCommand = this.assetCommand.toString();
    const renderCommand = this.renderCommand.toString();
    const exportVideoStreamName = this.renderCommand.getExportVideoStreamName();
    const exportAudioStreamName = this.renderCommand.getExportAudioStreamName();

    if (assetCommand) {
      this.commands.push(assetCommand);
    }

    if (renderCommand) {
      this.commands.push(renderCommand);
    }
    
    if (exportVideoStreamName) {
      this.exportCommand.setExportVideoStream(exportVideoStreamName);
    }

    if (exportAudioStreamName) {
      this.exportCommand.setExportAudioStream(exportAudioStreamName);
    }

    this.commands.push(this.exportCommand.toString());
  }

  toString(): string {
    return `${this.commands.join(' ')}`;
  }
}

export default FfmpegCommand;