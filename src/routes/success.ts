import { Request, Response, Application } from 'express';

const buildSuccessRoute = (app: Application) => {
  app.get('/end', (req: Request, res: Response) => {
    res.render('infoButtonGeneric', {
      title: 'Successfully Submitted Dataset',
      subtitle: '',
      url: '/dataset',
      buttonText: 'Submit another data set',
    });
  });
};
export { buildSuccessRoute };
