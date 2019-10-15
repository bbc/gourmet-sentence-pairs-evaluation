import { Response, Application } from 'express';

const buildIndexRoute = (app: Application) => {
  app.get('/', (res: Response) => {
    res.render('index', { datasetSubmissionUrl: '/dataset' });
  });
};

export { buildIndexRoute };
