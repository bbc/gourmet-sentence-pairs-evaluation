import * as express from 'express';
import { Request, Response, Application } from 'express';
import {
  getSentenceSet,
  getSentencePair,
  putSentencePairScore,
  putSentenceSetFeedback,
  getSentenceSets,
} from './DynamoDB/dynamoDBApi';
import { loadConfig } from './config';
import {
  SentencePairEvaluationRequest,
  SentencePairEvaluationRequestBody,
  FeedbackRequest,
  DatasetRequest,
  DatasetBody,
} from './models/requests';
import { getErrorText } from './uiText';
import { submitDataset } from './processDatasets';

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

app.get('/', (req: Request, res: Response) => {
  getSentenceSets().then(sentenceSets => {
    res.render('index', { sentenceSets });
  });
});

app.post('/start', (req: Request, res: Response) => {
  const setId = req.body.setId;
  getSentenceSet(setId)
    .then(sentenceSet => {
      res.redirect(
        `/evaluation?idList=${JSON.stringify(sentenceSet.sentenceIds) ||
          []}&setId=${setId}`
      );
    })
    .catch(error => {
      console.error(
        `Unable to retrieve sentence set with id: ${setId}. Error: ${error}`
      );
      res.redirect('/error?errorCode=postStart');
    });
});

app.post('/evaluation', (req: SentencePairEvaluationRequest, res: Response) => {
  const body: SentencePairEvaluationRequestBody = req.body;
  const id: string = body.id;
  const setId: string = body.setId;
  const score: number = body.score;

  putSentencePairScore(id, score)
    .then(x => res.redirect(`/evaluation?idList=${body.idList}&setId=${setId}`))
    .catch(error => {
      console.error(
        `Unable to put score for id: ${id} and score: ${score}. Error${error}`
      );
      res.redirect('/error?errorCode=postEvaluation');
    });
});

app.get('/evaluation', (req: Request, res: Response) => {
  const idList = JSON.parse(req.query.idList || '[]');
  const setId = req.query.setId;
  if (idList.length > 0) {
    const sentencePairId = idList[0];
    getSentencePair(sentencePairId)
      .then(sentencePair => {
        res.render('evaluation', {
          sentence1: sentencePair.humanTranslation,
          sentence2: sentencePair.machineTranslation,
          idList: JSON.stringify(idList.slice(1)),
          setId,
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
    res.redirect(`/feedback?setId=${setId}`);
  }
});

app.post('/feedback', (req: FeedbackRequest, res: Response) => {
  const feedback: string = req.body.feedback;
  const setId: string = req.body.setId;
  if (feedback !== undefined && feedback.length > 0) {
    putSentenceSetFeedback(setId, feedback)
      .then(result => res.redirect('/end'))
      .catch(error => {
        console.error(
          `Could not save feedback: ${feedback} for sentence set id: ${setId}. Error:${error}`
        );
        res.redirect('/error?errorCode=postFeedback');
      });
  } else {
    res.redirect('/end');
  }
});

app.get('/feedback', (req: Request, res: Response) => {
  const setId = req.query.setId;
  res.render('feedback', { setId });
});

app.get('/end', (req: Request, res: Response) => {
  res.render('infoGeneric', {
    title: 'Evaluation Complete',
    subtitle: 'Thank you for taking part.',
  });
});

app.post('/dataset', (req: DatasetRequest, res: Response) => {
  const dataset: DatasetBody = req.body;
  submitDataset(dataset)
    .then(x => {
      res.redirect('/success');
    })
    .catch(error => {
      console.error(
        `Could not submit dataset:${JSON.stringify(dataset)}. Error: ${error}`
      );
      res.redirect('/error?errorCode=postDataset');
    });
});

app.get('/dataset', (req: Request, res: Response) => {
  res.render('dataset');
});

app.get('/success', (req: Request, res: Response) => {
  res.render('infoButtonGeneric', {
    title: 'Successfully Submitted Dataset',
    subtitle: '',
    url: '/dataset',
    buttonText: 'Submit another data set',
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
