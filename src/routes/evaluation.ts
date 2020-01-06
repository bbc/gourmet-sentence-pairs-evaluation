import { Request, Response, Application } from 'express';
import {
  getSentenceSet,
  getSentencePair,
  putSentencePairScore,
} from '../DynamoDB/dynamoDBApi';
import {
  SentencePairEvaluationRequest,
  SentencePairEvaluationRequestBody,
} from '../models/requests';
import { logger } from '../utils/logger';
import { SentencePairScore } from '../models/models';

const buildEvaluationRoutes = (app: Application) => {
  app.post(
    '/evaluation',
    (req: SentencePairEvaluationRequest, res: Response) => {
      const body: SentencePairEvaluationRequestBody = req.body;
      const id: string = body.id;
      const setId: string = body.setId;
      const q1Score: number = body.q1Score;
      const q2Score: number = body.q2Score;
      const evaluatorId: string = body.evaluatorId;
      const setSize = body.setSize || 0;
      const sentenceNum = body.sentenceNum;
      const machineTranslation = body.machineTranslation;
      const humanTranslation = body.humanTranslation;
      const original = body.original;
      const targetLanguage = body.targetLanguage;
      const sentencePairType = body.sentencePairType;

      const sentencePairScore = new SentencePairScore(
        id,
        evaluatorId,
        q1Score,
        q2Score,
        targetLanguage,
        humanTranslation,
        machineTranslation,
        original,
        sentencePairType
      );

      putSentencePairScore(sentencePairScore)
        .then(() =>
          res.redirect(
            `/evaluation?setId=${setId}&evaluatorId=${evaluatorId}&setSize=${setSize}&sentenceNum=${sentenceNum}`
          )
        )
        .catch(error => {
          logger.error(
            `Unable to put score for id: ${id}, score: ${q1Score} and evaluatorId: ${evaluatorId}. Error${error}`
          );
          res.redirect(500, '/error?errorCode=postEvaluation');
        });
    }
  );

  app.get('/evaluation', (req: Request, res: Response) => {
    const setId: string = req.query.setId;
    const evaluatorId: string = req.query.evaluatorId;
    const setSize: number = Number(req.query.setSize || 0);
    const sentenceNum: number = Number(req.query.sentenceNum || 0);
    getSentenceSet(setId)
      .then(sentenceSet => {
        const idList: string[] = Array.from(
          sentenceSet.sentenceIds || new Set()
        );
        const sentencePairId: string = idList[sentenceNum];
        if (sentencePairId !== undefined) {
          getSentencePair(sentencePairId)
            .then(sentencePair => {
              res.render('evaluation', {
                sentence1: sentencePair.humanTranslation,
                sentence2: sentencePair.machineTranslation,
                original: sentencePair.original,
                targetLanguage: sentencePair.targetLanguage,
                setId,
                sentencePairType: sentencePair.sentencePairType,
                sentencePairId,
                evaluatorId,
                setSize,
                sentenceNum: sentenceNum + 1,
              });
            })
            .catch(error => {
              logger.error(
                `Unable to get sentence pair with id ${sentencePairId}. Error: ${error}`
              );
              res.redirect(404, '/error?errorCode=getEvaluation');
            });
        } else {
          res.redirect(`/feedback?setId=${setId}&evaluatorId=${evaluatorId}`);
        }
      })
      .catch(error => {
        logger.error(
          `Unable to get sentence set with id ${setId}. Error: ${error}`
        );
        res.redirect(404, '/error?errorCode=getEvaluation');
      });
  });
};

export { buildEvaluationRoutes };
