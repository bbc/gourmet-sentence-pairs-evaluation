import { Response, Application } from 'express';

const buildStatusRoute = (app: Application) => {
  app.get('/status', (res: Response) => {
    res.status(200).send(`OK`);
  });
};

export { buildStatusRoute };
