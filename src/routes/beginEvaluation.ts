import { Response, Application } from 'express';
import { getSentenceSet, putSentenceSet } from '../DynamoDB/dynamoDBApi';
import { StartRequest } from '../models/requests';
import { SentenceSet } from '../models/models';
import { logger } from '../utils/logger';

const buildBeginEvaluationRoute = (app: Application) => {
  app.post('/beginEvaluation', (req: StartRequest, res: Response) => {
    const setId = req.body.setId;
    const evaluatorId = req.body.evaluatorId;
    getSentenceSet(setId)
      .then(sentenceSet => {
        addEvaluatorIdToSentenceSet(evaluatorId, sentenceSet)
          .then(() => {
            const sentenceIdsList = Array.from(
              sentenceSet.sentenceIds || new Set()
            );
            res.redirect(
              `/evaluation?setId=${setId}&evaluatorId=${evaluatorId}&setSize=${sentenceIdsList.length}&currentSentenceNum=0`
            );
          })
          .catch(error => {
            logger.error(
              `Unable to add evaluatorId:${evaluatorId} to sentence set:${setId}. Error: ${error}`
            );
            res.redirect(500, '/error?errorCode=postStartFailEvaluatorId');
          });
      })
      .catch(error => {
        logger.error(
          `Unable to retrieve sentence set with id: ${setId}. Error: ${error}`
        );
        res.redirect(404, '/error?errorCode=postStartFailSentenceSet');
      });
  });

  const addEvaluatorIdToSentenceSet = (
    evaluatorId: string,
    sentenceSet: SentenceSet
  ): Promise<string> => {
    const evaluatorIds: Set<string> =
      sentenceSet.evaluatorIds === undefined
        ? (sentenceSet.evaluatorIds = new Set([evaluatorId]))
        : sentenceSet.evaluatorIds.add(evaluatorId);

    const updatedSentenceSet = new SentenceSet(
      sentenceSet.name,
      sentenceSet.sourceLanguage,
      sentenceSet.targetLanguage,
      sentenceSet.sentenceIds,
      sentenceSet.setId,
      evaluatorIds
    );
    return putSentenceSet(updatedSentenceSet);
  };
};

export { buildBeginEvaluationRoute };
