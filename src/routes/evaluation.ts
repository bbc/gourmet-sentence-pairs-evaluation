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

const buildEvaluationRoutes = (app: Application) => {
  app.post(
    '/evaluation',
    (req: SentencePairEvaluationRequest, res: Response) => {
      const body: SentencePairEvaluationRequestBody = req.body;
      const id: string = body.id;
      const setId: string = body.setId;
      const score: number = body.score;
      const evaluatorId: string = body.evaluatorId;
      const numOfPracticeSentences = body.numOfPracticeSentences || 0;
      const setSize = body.setSize || 0;
      const sentenceNum = body.sentenceNum;

      if (numOfPracticeSentences > 0) {
        res.redirect(
          `/evaluation?setId=${setId}&evaluatorId=${evaluatorId}&numOfPracticeSentences=${numOfPracticeSentences -
            1}&setSize=${setSize}&sentenceNum=${sentenceNum}`
        );
      } else {
        putSentencePairScore(id, score, evaluatorId)
          .then(() =>
            res.redirect(
              `/evaluation?setId=${setId}&evaluatorId=${evaluatorId}&setSize=${setSize}&sentenceNum=${sentenceNum}`
            )
          )
          .catch(error => {
            console.error(
              `Unable to put score for id: ${id}, score: ${score} and evaluatorId: ${evaluatorId}. Error${error}`
            );
            res.redirect('/error?errorCode=postEvaluation');
          });
      }
    }
  );

  app.get('/evaluation', (req: Request, res: Response) => {
    const setId: string = req.query.setId;
    const evaluatorId: string = req.query.evaluatorId;
    const numOfPracticeSentences: number = Number(
      req.query.numOfPracticeSentences || 0
    );
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
                setId,
                sentencePairId,
                evaluatorId,
                numOfPracticeSentences,
                setSize,
                sentenceNum: sentenceNum + 1,
              });
            })
            .catch(error => {
              console.error(
                `Unable to get sentence pair with id ${sentencePairId}. Error: ${error}`
              );
              res.redirect('/error?errorCode=getEvaluation');
            });
        } else {
          res.redirect(`/feedback?setId=${setId}&evaluatorId=${evaluatorId}`);
        }
      })
      .catch(error => {
        console.error(
          `Unable to get sentence set with id ${setId}. Error: ${error}`
        );
        res.redirect('/error?errorCode=getEvaluation');
      });
  });
};

export { buildEvaluationRoutes };
