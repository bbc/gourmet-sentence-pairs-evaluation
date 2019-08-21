import * as express from 'express';
import { Request, Response, Application } from 'express';
import { resolve } from 'path';
import { getSentenceSet } from './DynamoDB/dynamoDBApi';
import { loadConfig } from './config';
import { getSentenceSetCallback } from './DynamoDB/dynamoDBCallbacks';

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

app.get('/status', (req: Request, res: Response) => {
  res.status(200).send(`OK`);
});

app.get('/sentenceSet/:setId', (req: Request, res: Response) => {
  const setId: string = req.params.setId;
  const callback = getSentenceSetCallback(setId, res);
  getSentenceSet(setId, callback);
});

app.listen(port, () => {
  // tslint:disable-next-line:no-console
  console.log(`App running on port ${port}`);
});
