

class FFilterOptionParser {
  constructor() {}

  static getColorCommand(color: string): string {  
    const command = `c=${color}`;
    return command;
  }  

  static getSizeCommand(width: string, height: string): string {
    const command = `size=${width}x${height}`;
    return command
  }

  static getFrameRateCommand(framerate: string): string {
    const command = `r=${framerate}`;
    return command;
  }

  static getDurationCommand(duration: string): string {
    const command = `d=${duration}`;
    return command;
  }  
}
export { FFilterOptionParser };
export default FFilterOptionParser;