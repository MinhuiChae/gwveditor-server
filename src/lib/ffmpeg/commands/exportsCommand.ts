import {
  IInfoSet,
  IAudioCodecSet,
  IVideoCodecSet,
  IExportSet,
  IAssetSet,
  IWorkJsonSet,
  IRenderJsonSet,
} from '../../../types/iwork';

import common from '../../common';
// import * as dotenv from 'dotenv';

// dotenv.config();


class ExportCommand {
  exports: IExportSet = {};
  exportVideoStreamName: string = '';
  exportAudioStreamName: string = '';
  commands: string[] = [];

  exportFileName: string = common.getRandomfileName('export', 'mp4');

  constructor(exports: IExportSet){
    this.exports = exports;
  }

  get Frames(): string {
    return this.exports.frames ?? '0';
  }

  get videoBitRate(): string {
    return this.exports.video?.bitrate ?? '';
  }

  get videoCodec(): string {
    return this.exports.video?.codec ?? '';
  }

  get samplerate(): string {
    return this.exports.audio?.samplerate ?? '';
  }

  get audioCodec(): string {
    return this.exports.audio?.codec ?? '';
  }

  get audioBitrate(): string {
    return this.exports.audio?.bitrate ?? '';
  }

  setExportVideoStream(streamName: string): void {
    this.exportVideoStreamName = streamName;
  }

  setExportAudioStream(streamName: string): void {
    this.exportAudioStreamName = streamName;
  }

  existVideoStream(): boolean {
    return this.exportVideoStreamName !== '';
  }

  existAudioStream(): boolean {
    return this.exportAudioStreamName !== '';
  }

  getExportFileName(): string {
    return this.exportFileName;
  }

  getVideoCodecCommand(): string {
    const commands: string[] = [];

    if (this.videoCodec) commands.push(`-c:v ${this.videoCodec}`);
    if (this.videoBitRate) {
      commands.push(`-b:v ${this.videoBitRate}`);
      // commands.push(`-maxrate ${this.videoBitRate}`);
      // commands.push(`-bufsize ${this.videoBitRate}`);
    }

    return commands.join(' ');
  }

  getAudioCodecCommand(): string {
    const commands: string[] = [];
    if (this.audioCodec) commands.push(`-c:a ${this.audioCodec}`);
    // if (this.samplerate) commands.push(`-b:a ${this.samplerate}`);
    if (this.samplerate) commands.push(`-ar ${this.samplerate}`);
    if (this.audioBitrate) commands.push(`-b:a ${this.audioBitrate}`);

    return commands.join(' ');
  }
   
  getCommand(): string {
    this.commands = [];
    const exportVideoStreamCommand = this.existVideoStream() ? 
    `-map [${this.exportVideoStreamName}]` : '-vn';
    const exportAudioStreamCommand = this.existAudioStream() ? 
    `-map [${this.exportAudioStreamName}]` : '-an';

    const videoCodecCommand = this.getVideoCodecCommand();
    const audioCodecCommand = this.getAudioCodecCommand();

    const exportFilePath = `${process.env.EXPORT_FILE_PREFIX_PATH}/${this.exportFileName}`;

    this.commands.push(
      exportVideoStreamCommand,
      exportAudioStreamCommand,      
    );

    if (videoCodecCommand) this.commands.push(videoCodecCommand);
    if (audioCodecCommand && this.existAudioStream()) this.commands.push(audioCodecCommand);

    this.commands.push(exportFilePath);

    return this.commands.join(' ');
  }

  toString(): string {
    return this.getCommand();
  }
}

export default ExportCommand;