import express, {
  Request,
  Response,
  NextFunction,
  Router,
} from 'express';
const router = express.Router();

router
  .get("/*", (req: Request, res: Response, next: NextFunction) => {
    console.log('start get')
  })
  .post("/", (req: Request, res: Response, next: NextFunction) => {
    console.log('start post')
  });

export default router;