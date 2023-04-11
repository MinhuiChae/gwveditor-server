/**
 * video Trim filter option define
 * 
 * inputStream , outputStream 
 */

 class TrimAudioFfilterOption {
  private _start: number = 0;
  private _end: number = 0;
  private _type: string = 'milli' || 'second';
  private _startPts: number = 0;

  private _command: string[] = [];
  private _useTrim: boolean = true;

  constructor(useTrim: boolean = true, start: number, end: number, type: string, startPts?: number){
    this._type = type;
    this._start = start;
    this._end = end;
    this._useTrim = useTrim;

    if (startPts && startPts > 0) {
      this._startPts = Number(startPts.toFixed(6));
    }
  }

  get command(): string {
    return this.toString();
  }

  getTrimString(): string {
    return `atrim=start=${this._start}:end=${this._end}`;
  }

  pushTrimString(): void {
    const str = this.getTrimString();
    this._command.push(str);
  }

  pushPtsString(): void {
    let str = 'asetpts=PTS-STARTPTS';
    if (this._startPts > 0) {
      str+= `,adelay='${this._startPts}|${this._startPts}'`;
    } 

    this._command.push(str);
  }

  toString(): string {
    if (this._useTrim) this.pushTrimString();
    this.pushPtsString();
    return this._command.join(',');
  }
 }

 export default TrimAudioFfilterOption;