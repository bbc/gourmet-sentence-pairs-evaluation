import { Request, Response, Application } from 'express';

const buildSuccessRoute = (app: Application) => {
  app.get('/success', (req: Request, res: Response) => {
    res.render('infoButtonGeneric', {
      title: 'Successfully Submitted Dataset',
      subtitle: '',
      url: '/auth/dataset',
      buttonText: 'Submit another data set',
    });
  });
};
export { buildSuccessRoute };
