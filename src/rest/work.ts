import express, {
  Request,
  Response,
  NextFunction,
  Router,
} from 'express';

import * as dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

router
  .get("/*", (req: Request, res: Response, next: NextFunction) => {
    // console.log('req> ', JSON.stringify(req.body));
  })
  .post("/", (req: Request, res: Response, next: NextFunction) => {
    console.log('req> ', JSON.stringify(req.body));
    res.send('sucs')
  });

export default router;