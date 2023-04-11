/**
 * video Trim filter option define
 * 
 * inputStream , outputStream 
 */

 class ScaleVideoFfilterOption {
  private _width: number = 0;
  private _height: number = 0;
  private _command: string[] = ['scale='];

  constructor(width: number, height: number){
    this._width = width;
    this._height = height;
    this._command.push(`'${this.width}:${this.height}'`);
  }

  get width(): number {
    return this._width;
  }

  get height(): number {
    return this._height;
  }  

  toString(): string {    
    return this._command.join('');
  }
}

export default ScaleVideoFfilterOption;