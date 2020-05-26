import { Request, Response, Router } from 'express';
import { putSentenceSetFeedback } from '../DynamoDB/dynamoDBApi';
import { FeedbackRequest } from '../models/requests';
import { logger } from '../utils/logger';

const buildFeedbackRoutes = (router: Router) => {
  router.post('/feedback', (req: FeedbackRequest, res: Response) => {
    const feedback: string = req.body.feedback;
    const setId: string = req.body.setId;
    const evaluatorId: string = req.body.evaluatorId;
    const language: string = req.body.targetLanguage;
    putSentenceSetFeedback(setId, feedback, evaluatorId, language)
      .then(() => res.redirect('/end'))
      .catch(error => {
        logger.error(
          `Could not save feedback: ${feedback} for sentence set id: ${setId}. Error:${error}`
        );
        res.redirect(404, '/error?errorCode=postFeedback');
      });
  });

  router.get('/feedback', (req: Request, res: Response) => {
    const setId = req.query.setId;
    const evaluatorId = req.query.evaluatorId;
    const targetLanguage = req.query.targetLanguage;
    res.render('feedback', { setId, evaluatorId, targetLanguage });
  });
};

export { buildFeedbackRoutes };
