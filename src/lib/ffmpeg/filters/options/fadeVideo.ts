/**
 * video fade filter option define
 * 
 * start : frame 단위
 * end 
 */

import { EFadeFilterType } from "../../../../types/enums";

class FadeVideoFfilterOption {  
  private _start: number = 0;
  private _duration: number = 0;
  private _command: string[] = ['fade='];
  private _type: EFadeFilterType =  EFadeFilterType.In;

  constructor(start: number, duration: number, type: EFadeFilterType){
    this._start = start;
    this._duration = duration;
    this._type = type;
    this._command.push(`t=${this.type}:st=${this.start}:d=${this.duration}:alpha=1`);
  }

  get start(): number {
    return this._start;
  }

  get duration(): number {
    return this._duration;
  }  

  get type(): EFadeFilterType {
    return this._type;
  }

  toString(): string {    
    return this._command.join('');
  }
}

export default FadeVideoFfilterOption;