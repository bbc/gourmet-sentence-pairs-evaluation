import { Request, Response, Application } from 'express';
import { getSentenceSets } from '../DynamoDB/dynamoDBApi';

const buildStartRoute = (app: Application) => {
  app.get('/start', (req: Request, res: Response) => {
    const setId = req.query.setId;
    getSentenceSets().then(sentenceSets => {
      const updatedSentenceSets = sentenceSets
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(set =>
          Object.assign({}, set, { isSelected: set.setId === setId })
        );

      // if setId is incorrect or not selected, default possibleEvaluatorIds to an empty set
      const selectedSet = updatedSentenceSets.find(set => set.isSelected) || {
        possibleEvaluatorIds: new Set(),
      };
      const possibleEvaluatorIds = Array.from(selectedSet.possibleEvaluatorIds);

      res.render('start', {
        sentenceSets: updatedSentenceSets,
        possibleEvaluatorIds: [...possibleEvaluatorIds, 'tester'],
      });
    });
  });
};

export { buildStartRoute };
