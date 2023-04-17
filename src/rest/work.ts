import express, {
  Request,
  Response,
  NextFunction,
  Router,
} from 'express';

import {  
  IWorkJsonSet,
} from '../types/iwork';

import * as dotenv from 'dotenv';
import WorkService from '../service/workService';
import runCommand from '../lib/runCommand';
import fs from 'fs';

dotenv.config();
const router = express.Router();

const getProgress = (strs: string[], totFrames: string): string => {
  const findStr = strs.find((str) => str.match(/^frame=/g));
  let percent = '0';
  if(findStr) {
    const progressFrame = findStr.split('=');
    const tFrames = Number(totFrames);
    const nFrames = Number(progressFrame[1]);
    percent = (nFrames/tFrames * 100).toFixed(3);
  }

  return percent;
}

const getExportTxtFile = (filename: string): string => {
  return `./export/progress-${filename}.txt`
}

const ffmpegPath = process.env.FFMPEG_COMMAND_PATH ?? 'ffmpeg';


router
  .get("/*", (req: Request, res: Response, next: NextFunction) => {
    // console.log('req> ', JSON.stringify(req.body));
  })
  .post("/", (req: Request, res: Response, next: NextFunction) => {
    //console.log('req> ', JSON.stringify(req.body));

    const body: IWorkJsonSet = req.body;
    const workService = new WorkService(body);
    let commandString = workService.runFfmpegCommand().getCommand();
    let resSend = false;

    const spawnCmds = workService.getCommandForSpawn();
    const spawnCmdsTest = ['-i', 'video/video1.mov','-c:v','libx264', 'file.mov']
    const exportFrames = workService.getExportFrames();
    const exportFileName = workService.getExportFileName();
    const progressFileName = getExportTxtFile(exportFileName);
    try { 
      runCommand(ffmpegPath, spawnCmds, (data: string) => {
        const strArr = data.toString().split('\n');
        const percent = getProgress(strArr, exportFrames);
        //percent 가 100이 넘음
        if(percent) {
          const dateTime = new Date();
          const writeStr = `{"date":"${dateTime}", "percent":"${percent}"}`;

          fs.writeFileSync(progressFileName, writeStr);
          
        }
  
        if(resSend === false) {
          res.send('success');
          resSend = true;
        }
      }, (args: any) => {
        if (args === 1) {
          res.status(204).send('Gernerate Failed');
        } 
      }, (err: any) => {
        res.status(404).send({
          status: false, 
          msg: 'FFMPEG Command Error Gernerate Failed',
          err: err}); 
      })
    } catch(err) {
      console.log('err')
      res.status(404).send('Gernerate Failed');
    }
  });

export default router;