/**
 * video Trim filter option define
 * 
 * inputStream , outputStream 
 */

class TrimVideoFfilterOption {
  private _start_frame: number = 0;
  private _end_frame: number = 0;
  private _start_time: number = 0;
  private _end_time: number = 0;
  private _type: string = 'frame' || 'second';
  private _startPts: number = 0;
  private _command: string[] = [];

  constructor(start: number, end: number, type: string, startPts?: number){
    this._type = type;
    if (type === 'frame') {
      this._start_frame = start;
      this._end_frame = end;
    } else {
      this._start_time = start;
      this._end_time = end;
    } 

    if (startPts && startPts > 0) {
      this._startPts = Number(startPts.toFixed(6));
    }
  }

  get command(): string {
    return this.toString();
  }

  getFrameTrimString(): string {
    return `trim=start_frame=${this._start_frame}:end_frame=${this._end_frame}`;
  }

  getSecondTrimString(): string {
    return `trim=strt=${this._start_time}:end=${this._end_time}`;
  }

  pushTrimString(): void {
    const str = this._type === 'frame' ?  this.getFrameTrimString() : this.getSecondTrimString();
    this._command.push(str);
  }

  pushPtsString(): void {
    let str = 'setpts=PTS-STARTPTS';
    if (this._startPts > 0) {
      str+= `+${this._startPts}/TB`;
    } 

    this._command.push(str);
  }

  toString(): string {
    this.pushTrimString();
    this.pushPtsString();
    return this._command.join(',');
  }
}

export default TrimVideoFfilterOption;