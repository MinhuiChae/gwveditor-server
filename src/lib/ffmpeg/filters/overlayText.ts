import {
  IRenderItemVideo,
  IRenderItemText,
  IFilterMakeData,
  VideoStream,
  AudioStream,
  IFilterInfo,
  ITextDrawDatas,
} from '../../../types/irender';

import Ffilters from "../ffilters";
import fs, {WriteFileOptions} from 'fs';
import common from '../../common';
import { EFadeFilterType } from '../../../types/enums';
import FadeVideoFfilterOption from './options/fadeVideo';
import DrawBoxFilterOption from './options/drawBox';

class OverlayTextFilter extends Ffilters {
  private data: IRenderItemText | null = null;
  private startFrame: number = 0;
  private endFrame: number = 0;
  private positionX: number = 0;
  private positionY: number = 0;
  private color: string = '';
  private text: string = '';
  private size: string = '';
  private fontfilePath: string = './fonts/tahoma.ttf'; // './fonts/GOTHIC.TTF';
  private defaultCreateFontFilePath: string = process.env.EXPORT_FONT_TEXT_PATH ?? '';
  private defaultFontColor: string = 'white';
  private fontFilePath: string[] = [''];
  private inputFrameRate: number = 0;
  private fontFamily: string = '';

  private filters: any[] = [];

  private fadeFilterData: any[] = [];
  private existFadeOption: boolean = false;  
  private drawDatas: ITextDrawDatas[] = [];
  private boxFilter: any = null;
  private borderFilter: any = null;
  private shadowFilter: any = null;

  private fontFamilyFilePathList = [
    {
      name: 'tahoma',
      path: './fonts/tahoma.ttf',
    },
    {
      name: 'gothic',
      path: './fonts/H2GTRM.TTF',
    },
    {
      name: 'Bazzi',
      path: './fonts/Bazzi.ttf',
    },
    {
      name: 'minhye',
      path: './fonts/Minhye.ttf',
    },
    {
      name: 'HSSummer',
      path: './fonts/HSSummer.ttf',
    },
    {
      name: 'NanumBarunGothic',
      path: './fonts/NanumBarunGothic.ttf',
    },
    {
      name: 'RIDIBatang',
      path: './fonts/RIDIBatang.otf',
    }
  ]

  constructor (data: IFilterMakeData) {
    super(data.assetData, data.assetIndex, data.filterNumber, data.inputStream);   
    this.data = data.data as IRenderItemText;      

    this.initData();
    this.createTextFile();
    this.arrangeStream();
    this.arrageCommand();   
    this.arrangeOutStream();
  }

  /*
    ffmpeg 명령어 특수문자로 command 자체가 에러나는 경우를 대비해서 
    사용  URIComponent X 
    파일 처리하는 방식으로 변경
    '" ! : ; ! @ # $ %
  */
  replaceSpecialCharInText(text: string): string {
    return text
          .replace(/%/g,'\\%');
          //.replace(/'/g,'\u2019')
          //.replace(/"/g,'%quot;')
          //.replace(/:/g,'\\:');
  }

  initData(): void {
    const itemData = this.data as IRenderItemText;
    this.inputFrameRate = this.getInputVideoStream().framerate;
    this.startFrame = itemData.frame.start;
    this.endFrame = itemData.frame.end;
    this.color = itemData.fontcolor.length > 0 ? itemData.fontcolor: this.defaultFontColor;
    this.text = this.replaceSpecialCharInText(itemData.text);
    this.fontFamily = itemData.fontFamily;
               
    this.size = itemData.fontsize.toString();
    this.positionX = itemData.position.x;
    this.positionY = itemData.position.y;

    this.filters = itemData?.filters ?? [];
    this.fadeFilterData = this.getFadeFilterData();
    this.existFadeOption = this.existFadeFilter();

    // itemData.border 

    this.drawDatas = itemData.drawDatas ?? [];

    const fontFamilyFilePath = this.fontFamilyFilePathList.find((fontFamilyFilePath) => fontFamilyFilePath.name.toLocaleLowerCase() === this.fontFamily.toLocaleLowerCase());

    if (fontFamilyFilePath) {
      this.fontfilePath = fontFamilyFilePath.path;
    }

    if (this.filters && this.filters.length >0) {
      this.filters.forEach((filter) => {
        if(filter.type === 'box') {
          this.boxFilter = filter;
        } else if(filter.type === 'border') {
          this.borderFilter = filter;
        } else if (filter.type === 'shadow') {
          this.shadowFilter = filter;
        }
      })
    }
  }

  arrangeStream(): void {
    
  }

  createTextFile(): void {
    try {   
      this.drawDatas.forEach((drawData) => {
        const covText = this.replaceSpecialCharInText(drawData.text);
        const filePath = `${this.defaultCreateFontFilePath}/${common.getRandomfileName('text','txt')}`      
        fs.writeFileSync(filePath, covText, {encoding: "utf8"}); 
        this.fontFilePath.push(filePath);     
        drawData.filePath = filePath;
      });      
    } catch (e) {
      console.error(`not found font path : ${this.fontFamily}`);
    }
  }

  getInputVideoStreamName(): string {
    return `[${this.inputVideoStreams[0].name}]`;
  }

  getFadeFilterData() {
    return this.filters.filter((filter) => (filter as IFilterInfo).type === 'fade');
  }

  existFadeFilter(): boolean {    
    return this.fadeFilterData.length > 0;
  }

  existBoxFilter(): boolean {    
    return this.boxFilter ? true : false;
  }

  existBorderFilter(): boolean {
    return this.borderFilter ? true : false;
  }

  existShadowFilter(): boolean {
    return this.shadowFilter ? true : false;
  }

  getDrawTextCommand(): string {
    //const commands: string[] = [];
    const drawTextCommands: string[] = [];
    const textCommands: string[] = [];    

    if (this.existBoxFilter()) {
      textCommands.push(this.getBoxFilterCommand());
    }

    this.drawDatas.forEach((drawData, i) => {
      const textCommand: string[] = [];
      textCommand.push(
        `drawtext=fontfile='${this.fontfilePath}'`,
        `textfile='${drawData.filePath}'`,
        `fontcolor=${this.color}`,
        `fontsize=${this.size.toString()}`,
        `x=${drawData.x}`,
        `y=${drawData.y}`,
        `enable='between(n,${this.startFrame},${this.endFrame})'`
      );      

      if (this.existBorderFilter()) {
        textCommand.push(...this.getBorderFilterCommand());
      }

      if (this.existShadowFilter()) {
        textCommand.push(...this.getShadowFilterCommand());
      }
      
      if (this.existFadeFilter()) {
        textCommand.push(this.getFadeFilterCommand());
        // commands.push(this.getFadeFilterCommand());
      }

      textCommands.push(textCommand.join(":"));
    });

    return `${this.getInputVideoStreamName()}${textCommands.join(',')}${this.outVideoStreamName}`;
  }

  getBoxFilterCommand(): string {
    return new DrawBoxFilterOption(this.boxFilter, this.startFrame, this.endFrame).toString();
  }

  getBorderFilterCommand(): string[] {
    return [`borderw=${this.borderFilter.width}`, `bordercolor=${this.borderFilter.color}`];
  }

  getShadowFilterCommand(): string[] {
    return [
      `shadowcolor=${this.shadowFilter.color}`,
      `shadowx=${this.shadowFilter.position.x}`,
      `shadowy=${this.shadowFilter.position.y}`
    ];
  }  

  getFadeFilterCommand(): string {
    const alphaStr = this.getAlphaStr(0);
    return `alpha='${alphaStr}'`;
  }

  getAlphaStr(idx: number): string {
    const fadeDatas = this.fadeFilterData;
    const nowData = fadeDatas[idx]?.options;
    const nextData = fadeDatas[idx+1]?.options;
    const prevData = fadeDatas[idx-1]?.options;
    
    const nowDataStartTime = (nowData.start + this.startFrame) / this.inputFrameRate;
    const nowDataDurationTime = nowData.duration / this.inputFrameRate;
    const prevDataDurationTime = prevData?.duration / this.inputFrameRate;
    const prevDataStartTime = (prevData?.start + this.startFrame) / this.inputFrameRate;
  
    let str = '';
    let startTime = nowDataStartTime;
    let faultValue = nowData.type === 'fadeIn' ? '0' : '1';
  
    const nextTrueValue = nextData ? this.getAlphaStr(idx + 1) : nowData.type === 'fadeIn' ? `((t - ${nowDataStartTime}) / ${nowDataDurationTime})` :
    `((${nowDataDurationTime} - (t - ${nowDataStartTime})) / ${nowDataDurationTime})`;

    const trueValue = prevData ? `if( lt(t, ${startTime}), ${faultValue}, ${nextTrueValue})`: nextTrueValue;
  
    if (prevData) {
      startTime = (prevDataStartTime + prevDataDurationTime); // 중간값
      faultValue = prevData.type === 'fadeIn' ? `((t -${prevDataStartTime}) / ${prevDataDurationTime}) ` : `((${prevDataDurationTime} - (t - ${prevDataStartTime})) / ${prevDataDurationTime})`;
    }
  
    str = `if( lt(t, ${startTime}), ${faultValue}, ${trueValue})`;
    
    return str;
  }

  arrageCommand(): void {
    const textCommand = this.getDrawTextCommand();
    this.commands.push(textCommand);    
  }

  addCommand(): void {

  }

  arrangeOutStream(): void {
    this.inputVideoStreams[0].name = this.outVideoStreamName.replace('[','').replace(']','');
    this.setOutVideoStream(this.inputVideoStreams[0]);
  }

  getCommandString(): string {
    return this.commands.join(';');
  }

  toString(): string {
    return this.getCommandString();
  }
}

export default OverlayTextFilter;