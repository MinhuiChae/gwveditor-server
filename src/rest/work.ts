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

const getExportTxtFile = (filename: string): string => {
  return `./export/progress-${filename}.txt`
}

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
      runCommand("ffmpeg", spawnCmds, (data:string) => {
        console.log('data > ', data)
        
      }, (args: any) => {
        console.log('args > ', args)
        res.send('success')
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