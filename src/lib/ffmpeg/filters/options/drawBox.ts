/**
 * Draw Box option
 * 
 * inputStream , outputStream  X
 */
 import hexRgb from '../../../rgbtohex';

 class DrawBoxFilterOption { 
  private _command: string[] = [];
  constructor(boxFilter: any, startFrame?: number, endFrame?: number){ 

    const { alpha } = hexRgb(boxFilter.color); 
    const opacity = Number(alpha).toFixed(2);
    const color = boxFilter.color.slice(0,7);

    this._command.push(
      `drawbox=x=${boxFilter.position.x}`,
      `${boxFilter.position.y}`,
      `w=${boxFilter.width}`,
      `h=${boxFilter.height}`,
      `color=${color}@${opacity}`,
      `t=fill`,
    )

    if (endFrame && endFrame > 0) {
      this._command.push( `enable='between(n,${startFrame},${endFrame})'`);
    }
  }
  
  toString(): string {    
    return this._command.join(':');
  }
}

export default DrawBoxFilterOption;