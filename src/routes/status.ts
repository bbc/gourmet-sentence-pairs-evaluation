import { Request, Response, Application } from 'express';

const buildStatusRoute = (app: Application) => {
  app.get('/status', (req: Request, res: Response) => {
    res.status(200).send(`OK`);
  });
};

export { buildStatusRoute };
