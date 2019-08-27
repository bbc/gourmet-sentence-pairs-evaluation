import * as express from 'express';
import { Request, Response, Application } from 'express';
import {
  getSentenceSet,
  getSentencePair,
  putSentencePairScore,
} from './DynamoDB/dynamoDBApi';
import { loadConfig } from './config';
import {
  SentencePairEvaluationRequest,
  SentencePairEvaluationRequestBody,
} from './models';
import { getErrorText } from './copyText';

loadConfig();

const app: Application = express();
const port = process.env.PORT || 8080;

// support parsing of application/json type post data
app.use(express.json());
// support parsing of application/x-www-form-urlencoded post data
app.use(express.urlencoded({ extended: true }));
// Serve static assets in the public folder
app.use(express.static('public'));
// Use handlebars to render templates
app.set('view engine', 'hbs');

app.get('/', (req: Request, res: Response) => res.render('index'));

app.post('/evaluation', (req: SentencePairEvaluationRequest, res: Response) => {
  const body: SentencePairEvaluationRequestBody = req.body;
  const id: string = body.id;
  const score: number = body.score;

  putSentencePairScore(id, score)
    .then(x => res.redirect(`/evaluation?idList=${body.idList}`))
    .catch(error => {
      console.error(
        `Unable to put score for id: ${id} and score: ${score}. Error${error}`
      );
      res.redirect('/error?errorCode=postEvaluation');
    });
});

app.get('/evaluation', (req: Request, res: Response) => {
  const idList = JSON.parse(req.query.idList || '[]');
  if (idList.length > 0) {
    const sentencePairId = idList[0];
    getSentencePair(sentencePairId)
      .then(sentencePair => {
        res.render('evaluation', {
          sentence1: sentencePair.humanTranslation,
          sentence2: sentencePair.machineTranslation,
          idList: JSON.stringify(idList.slice(1)),
          sentencePairId,
        });
      })
      .catch(error => {
        console.error(
          `Unable to get sentence pair with id ${sentencePairId}. Error${error}`
        );
        res.redirect('/error?errorCode=getEvaluation');
      });
  } else {
    res.render('end');
  }
});

app.post('/start', (req: Request, res: Response) => {
  const setId = '1232323';
  getSentenceSet(setId)
    .then(sentenceSet => {
      res.redirect(
        `/evaluation?idList=${JSON.stringify(sentenceSet.sentenceIds) || []}`
      );
    })
    .catch(error => {
      console.error(
        `Unable to retrieve sentence set with id: ${setId}. Error: ${error}`
      );
      res.redirect('/error?errorCode=postStart');
    });
});

app.get('/error', (req: Request, res: Response) => {
  const errorCode = req.query.errorCode || 'generalError';
  const errorMessage = getErrorText(errorCode);
  res.status(404).render('error', { errorMessage });
});

app.get('/status', (req: Request, res: Response) => {
  res.status(200).send(`OK`);
});

app.listen(port, () => {
  // tslint:disable-next-line:no-console
  console.log(`App running on port ${port}`);
});
