import * as express from 'express';
import { Request, Response, Application } from 'express';
import {
  getSentenceSet,
  getSentencePair,
  putSentencePairScore,
  putSentenceSetFeedback,
  getSentenceSets,
  putSentenceSet,
} from './DynamoDB/dynamoDBApi';
import { loadConfig } from './config';
import {
  SentencePairEvaluationRequest,
  SentencePairEvaluationRequestBody,
  FeedbackRequest,
  DatasetRequest,
  DatasetBody,
  StartRequest,
} from './models/requests';
import { getErrorText } from './uiText';
import { submitDataset } from './processDatasets';
import { Language, SentenceSet } from './models/models';

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
  res.render('index', { datasetSubmissionUrl: '/dataset' });
});

app.get('/start', (req: Request, res: Response) => {
  getSentenceSets().then(sentenceSets => {
    res.render('start', { sentenceSets });
  });
});

app.post('/beginEvaluation', (req: StartRequest, res: Response) => {
  const setId = req.body.setId;
  const evaluatorId = req.body.evaluatorId;
  getSentenceSet(setId)
    .then(sentenceSet => {
      addEvaluatorIdToSentenceSet(evaluatorId, sentenceSet)
        .then(x => {
          res.redirect(
            `/evaluation?idList=${JSON.stringify(sentenceSet.sentenceIds) ||
              []}&setId=${setId}&numOfPracticeSentences=5&evaluatorId=${evaluatorId}`
          );
        })
        .catch(error => {
          console.error(
            `Unable to add evaluatorId:${evaluatorId} to sentence set:${setId}. Error: ${error}`
          );
          res.redirect('/error?errorCode=postStartFailEvaluatorId');
        });
    })
    .catch(error => {
      console.error(
        `Unable to retrieve sentence set with id: ${setId}. Error: ${error}`
      );
      res.redirect('/error?errorCode=postStartFailSentenceSet');
    });
});

const addEvaluatorIdToSentenceSet = (
  evaluatorId: string,
  sentenceSet: SentenceSet
): Promise<string> => {
  const evaluatorIds: string[] =
    sentenceSet.evaluatorIds === undefined
      ? (sentenceSet.evaluatorIds = [evaluatorId])
      : sentenceSet.evaluatorIds.concat(evaluatorId);

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

app.post('/evaluation', (req: SentencePairEvaluationRequest, res: Response) => {
  const body: SentencePairEvaluationRequestBody = req.body;
  const id: string = body.id;
  const setId: string = body.setId;
  const score: number = body.score;
  const evaluatorId: string = body.evaluatorId;
  const numOfPracticeSentences = body.numOfPracticeSentences || 0;

  if (numOfPracticeSentences > 0) {
    res.redirect(
      `/evaluation?idList=${
        body.idList
      }&setId=${setId}&evaluatorId=${evaluatorId}&numOfPracticeSentences=${numOfPracticeSentences -
        1}`
    );
  } else {
    putSentencePairScore(id, score, evaluatorId)
      .then(x =>
        res.redirect(
          `/evaluation?idList=${body.idList}&setId=${setId}&evaluatorId=${evaluatorId}`
        )
      )
      .catch(error => {
        console.error(
          `Unable to put score for id: ${id}, score: ${score} and evaluatorId: ${evaluatorId}. Error${error}`
        );
        res.redirect('/error?errorCode=postEvaluation');
      });
  }
});

app.get('/evaluation', (req: Request, res: Response) => {
  const idList = JSON.parse(req.query.idList || '[]');
  const setId = req.query.setId;
  const evaluatorId = req.query.evaluatorId;
  const numOfPracticeSentences = req.query.numOfPracticeSentences || 0;
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
          evaluatorId,
          numOfPracticeSentences,
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
  putSentenceSetFeedback(setId, feedback)
    .then(result => res.redirect('/end'))
    .catch(error => {
      console.error(
        `Could not save feedback: ${feedback} for sentence set id: ${setId}. Error:${error}`
      );
      res.redirect('/error?errorCode=postFeedback');
    });
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
  const languages = Object.keys(Language);
  const languageOptions = languages.map((languageName, i) => {
    return {
      displayName:
        languageName.charAt(0).toUpperCase() +
        languageName.slice(1).toLowerCase(),
      language: languages[i],
    };
  });
  res.render('dataset', { languageOptions });
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
