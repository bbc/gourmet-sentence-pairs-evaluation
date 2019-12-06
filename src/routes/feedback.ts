import { Request, Response, Application } from 'express';
import { putSentenceSetFeedback } from '../DynamoDB/dynamoDBApi';
import { FeedbackRequest } from '../models/requests';
import { logger } from '../utils/logger';

const buildFeedbackRoutes = (app: Application) => {
  app.post('/feedback', (req: FeedbackRequest, res: Response) => {
    const feedback: string = req.body.feedback;
    const setId: string = req.body.setId;
    const evaluatorId: string = req.body.evaluatorId;
    putSentenceSetFeedback(setId, feedback, evaluatorId)
      .then(() => res.redirect('/end'))
      .catch(error => {
        logger.error(
          `Could not save feedback: ${feedback} for sentence set id: ${setId}. Error:${error}`
        );
        res.redirect('/error?errorCode=postFeedback');
      });
  });

  app.get('/feedback', (req: Request, res: Response) => {
    const setId = req.query.setId;
    const evaluatorId = req.query.evaluatorId;
    res.render('feedback', { setId, evaluatorId });
  });
};

export { buildFeedbackRoutes };
