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

dotenv.config();
const router = express.Router();

const getProgress = (strs: string[], totFrames: string): string => {
  const findStr = strs.find((str) => str.match(/^frame=/g));
  let percent = '0';
  console.log('findStr > ', findStr)

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
    const exportFrames = workService.getExportFrames();
    const exportFileName = workService.getExportFileName();
    const progressFileName = getExportTxtFile(exportFileName);

    try {
      runCommand(ffmpegPath, spawnCmds, (data:string) => {
        const strArr = data.toString().split('\n');
        const percent = getProgress(strArr, exportFrames);  
        res.send(percent)
        console.log('command start 5000')
      },(args: any) => {
        console.log('args > ', args)
        if (args === 1){
          res.status(204).send('Gernerate Failed');
        } 
      },(err: any) => {
        console.log("error> ", err);
        res.status(404).send({
          status: false,
          msg: 'FFMPEG Command Error Gernerate Failed',
          err: err});
      });
    } catch(err) {
      console.log(err)
    }



    
  });

export default router;