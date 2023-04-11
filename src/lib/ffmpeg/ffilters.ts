
/**
 * filter 정의 class
 * filter 실행시 overlay 경우 
 * input 받아오는것은 여러개 일 수 있음
 * output 은 무조건 video 1개 , audio 1개 물로 있을 수도 있고 배열이 아니다. 
 */

import {  
  IFfiltersOutStream,
  IFfiltersStream,
  FfmpegStream,
  IAssetSet,
  AudioStream,
  VideoStream,
} from '../../types/irender';

abstract class Ffilters {
  private _inputStreams: IFfiltersStream[] = [];
  private _assetData: IAssetSet = {}
  private _assetIndex: number = -1;
  private _command: string[] = [];
  private _outStream: IFfiltersStream = {
    video: undefined,
    audio: undefined,
  };

  private _filterNumber: number = -1;

  _stream: IFfiltersStream = {
    video: undefined,
    audio: undefined,
  }

  _asset: IAssetSet | undefined = undefined;

  constructor(assetData: IAssetSet | null, assetIndex: number, filterNumber: number, inputStreams?: IFfiltersStream[]) {
    if (inputStreams) {
      this._inputStreams = [...inputStreams];
    }

    if (assetData) {
      this._assetData = assetData;
    }

    if (assetIndex > -2) {
      this._assetIndex = assetIndex;
    }

    if (filterNumber > -1) {
      this._filterNumber = filterNumber;
    }
  }

  get commands(): string[] {
    return this._command;
  } 

  get outStream(): IFfiltersStream {
    return this._outStream;
  }
  get assetIndex(): number {
    return this._assetIndex;
  }

  get inputVideoStreams(): any[] {
    return this._inputStreams.map((stream) => stream.video);
  }

  get inputAudioStreams(): any[] {
    return this._inputStreams.map((stream) => stream.audio);
  }

  get inputStreams(): IFfiltersStream[] {
    return this._inputStreams;
  }

  get videoStream(): string { 
    return `[${this.assetIndex}:v]`;
  }

  get audioStream(): string {
    return `[${this.assetIndex}:a]`;
  }

  get outVideoStreamName(): string {
    return `[outv${this.filterNumber}]`;
  }

  get outAudioStreamName(): string {
    return `[outa${this.filterNumber}]`;
  }
  
  get assetVideoFilterStreamName(): string {
    return `[assetfv${this.filterNumber}]`;
  }

  get assetAudioFilterStreamName(): string {
    return `[assetfa${this.filterNumber}]`;
  }

  get filterNumber(): number {
    return this._filterNumber;
  }

  get assetData(): IAssetSet {
    return this._assetData;
  }

  get assetFrameRate(): number {
    return this._assetData.framerate ?? 0;
  }

  set outStreamVideoName(name: string) {
    console.log(this._outStream.video);
    (this._outStream.video as FfmpegStream).name = name;
  }

  set outStreamAudioName(name: string) {
    (this._outStream.audio as FfmpegStream).name = name;
  }

  addCommand(command: string) {
    this._command.push(command);
  }

  getStreamName(index: string, stream: string): string {
    return `[${index}:${stream}]`;
  }

  getAssetIndex(): number {
    return this.assetIndex;
  }

  getOutStream(): IFfiltersStream {
    return this.outStream;
  }

  getVideoOutStream(): string | undefined | FfmpegStream {
    return this.outStream.video;
  }

  getAudioOutStream(): string | undefined | FfmpegStream {
    return this.outStream.audio;
  }

  setOutVideoStream(stream: FfmpegStream) {
    this._outStream.video = stream;
  }

  setOutAudioStream(stream: FfmpegStream) {
    this._outStream.audio = stream;
  } 

  getInputVideoStream(): VideoStream {
    return this.inputStreams[0].video as VideoStream;
  }
 
  abstract toString(): string;
  abstract arrangeOutStream(): void;
}

export default Ffilters;
