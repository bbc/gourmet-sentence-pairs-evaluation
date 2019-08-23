import * as express from 'express';
import { Request, Response, Application } from 'express';
import { resolve } from 'path';
import {
  getSentenceSet,
  putSentenceSet,
  getSentencePair,
  putSentencePair as dynamoPutSentencePair,
} from './DynamoDB/dynamoDBApi';
import { loadConfig } from './config';
import {
  generateGetSentenceSetCallback,
  generatePutSentenceSetCallback,
  generateGetSentencePairCallback,
  generatePutSentencePairCallback,
} from './DynamoDB/dynamoDBCallbacks';
import {
  SentenceSetRequest,
  SentenceSetRequestBody,
  SentencePairRequest,
  SentencePairRequestBody,
} from './models';

import * as uuidv1 from 'uuid/v1';

loadConfig();

const app: Application = express();
const publicAssetsPath = resolve(__dirname, '../public');

const port = process.env.PORT || 8080;

// support parsing of application/json type post data
app.use(express.json());
// support parsing of application/x-www-form-urlencoded post data
app.use(express.urlencoded({ extended: true }));
// Serve static assets in the public folder
app.use(express.static('public'));

app.get('/', (req: Request, res: Response) =>
  res.sendFile(publicAssetsPath + '/index.html')
);

app.get('/evaluation', (req: Request, res: Response) =>
  res.sendFile(publicAssetsPath + '/evaluation.html')
);

app.post('/evaluation', (req: Request, res: Response) => {
  res.redirect('/evaluation');
});

app.get('/status', (req: Request, res: Response) => {
  res.status(200).send(`OK`);
});

app.get('/sentenceSet/:setId', (req: Request, res: Response) => {
  const setId: string = req.params.setId;
  const callback = generateGetSentenceSetCallback(setId, res);
  getSentenceSet(setId, callback);
});

app.put('/sentenceSet/:setId', (req: SentenceSetRequest, res: Response) => {
  if (req.is('application/json')) {
    const setId: string = req.params.setId;
    const body: SentenceSetRequestBody = req.body;
    putSentenceSet(setId, body, generatePutSentenceSetCallback(res));
  } else {
    res
      .status(400)
      .send({ error: 'Content-Type header must be application/json' });
  }
});

app.get('/sentencePair/:id', (req: Request, res: Response) => {
  const id: string = req.params.id;
  const callback = generateGetSentencePairCallback(id, res);
  getSentencePair(id, callback);
});

app.put('/sentencePair/:id', (req: SentencePairRequest, res: Response) => {
  putSentencePair(req, res);
});

app.post('/sentencePair', (req: SentencePairRequest, res: Response) => {
  putSentencePair(req, res);
});

const putSentencePair = (req: SentencePairRequest, res: Response) => {
  if (req.is('application/json')) {
    const id: string = req.params.id || uuidv1();
    const body: SentencePairRequestBody = req.body;
    dynamoPutSentencePair(id, body, generatePutSentencePairCallback(res));
  } else {
    res
      .status(400)
      .send({ error: 'Content-Type header must be application/json' });
  }
};

app.listen(port, () => {
  // tslint:disable-next-line:no-console
  console.log(`App running on port ${port}`);
});
