import { Request, Response, Application } from 'express';
import { getSentenceSets } from '../DynamoDB/dynamoDBApi';

const buildStartRoute = (app: Application) => {
  app.get('/start', (req: Request, res: Response) => {
    const setId = req.query.setId;
    getSentenceSets().then(sentenceSets => {
      const sentenceSetOptions = sentenceSets
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(set => ({ sentenceSet: set, isSelected: set.setId === setId }));

      // if setId is incorrect or not selected, default possibleEvaluatorIds to an empty set
      const selectedSet = sentenceSetOptions.find(set => set.isSelected) || {
        sentenceSet: {
          possibleEvaluatorIds: new Set(),
          evaluatorIds: new Set(),
        },
      };

      const possibleEvaluatorIds = Array.from(
        selectedSet.sentenceSet.possibleEvaluatorIds
      );
      const usedEvaluatorIds = Array.from(
        selectedSet.sentenceSet.evaluatorIds || new Set()
      );
      const unusedEvaluatorIds = possibleEvaluatorIds.filter(
        item => !usedEvaluatorIds.includes(item)
      );

      res.render('start', {
        sentenceSetOptions,
        possibleEvaluatorIds: [...unusedEvaluatorIds, 'tester'],
      });
    });
  });
};

export { buildStartRoute };
