import { Request, Response, Router } from 'express';
import { getSentenceSets } from '../DynamoDB/dynamoDBApi';

const buildStartRoute = (router: Router) => {
  router.get('/start', (req: Request, res: Response) => {
    const setId = req.query.setId;
    getSentenceSets().then(sentenceSets => {
      const sentenceSetOptions = sentenceSets
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(set => ({ sentenceSet: set, isSelected: set.setId === setId }));

      // if setId is incorrect or not selected, default possibleEvaluatorIds to an empty set
      const selectedSet = sentenceSetOptions.find(set => set.isSelected) || {
        sentenceSet: {
          possibleEvaluatorIds: new Set(),
        },
      };

      const possibleEvaluatorIds = Array.from(
        selectedSet.sentenceSet.possibleEvaluatorIds
      );

      res.render('start', {
        sentenceSetOptions,
        possibleEvaluatorIds: [...possibleEvaluatorIds, 'tester'],
      });
    });
  });
};

export { buildStartRoute };
