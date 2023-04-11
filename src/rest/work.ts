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

dotenv.config();
const router = express.Router();

router
  .get("/*", (req: Request, res: Response, next: NextFunction) => {
    // console.log('req> ', JSON.stringify(req.body));
  })
  .post("/", (req: Request, res: Response, next: NextFunction) => {
    //console.log('req> ', JSON.stringify(req.body));

    const body: IWorkJsonSet = req.body;
    const workService = new WorkService(body);
    console.log(workService)

    res.send('sucs')
  });

export default router;