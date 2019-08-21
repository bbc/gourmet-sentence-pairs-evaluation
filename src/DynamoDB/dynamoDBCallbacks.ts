import { Response } from 'express';
import { AWSError } from 'aws-sdk/lib/error';
import { QueryOutput } from 'aws-sdk/clients/dynamodb';

const generateGetSentenceSetCallback = (
  setId: string,
  response: Response
): ((error: AWSError, output: QueryOutput) => void) => {
  return (error: AWSError, output: QueryOutput) => {
    if (error) {
      response
        .status(500)
        .send({ error: `Unable to fulfill the request. Error: ${error}` });
    } else {
      if (
        output.Count === undefined ||
        output.Count < 1 ||
        output.Items === undefined
      ) {
        response
          .status(404)
          .send({ error: `Sentence set with the ID ${setId} does not exist` });
      } else {
        response.status(200).send(output.Items[0]);
      }
    }
  };
};

const generatePutSentenceSetCallback = (
  response: Response
): ((error: AWSError, output: QueryOutput) => void) => {
  return (error: AWSError, output: QueryOutput) => {
    if (error) {
      response
        .status(500)
        .send({ error: `Unable to fulfill the request. Error: ${error}` });
    } else {
      response.status(204).send();
    }
  };
};

const generateGetSentencePairCallback = (
  id: string,
  response: Response
): ((error: AWSError, output: QueryOutput) => void) => {
  return (error: AWSError, output: QueryOutput) => {
    if (error) {
      response
        .status(500)
        .send({ error: `Unable to fulfill the request. Error: ${error}` });
    } else {
      if (
        output.Count === undefined ||
        output.Count < 1 ||
        output.Items === undefined
      ) {
        response
          .status(404)
          .send({ error: `Sentence pair with the ID ${id} does not exist` });
      } else {
        response.status(200).send(output.Items[0]);
      }
    }
  };
};

const generatePutSentencePairCallback = (
  response: Response
): ((error: AWSError, output: QueryOutput) => void) => {
  return (error: AWSError, output: QueryOutput) => {
    if (error) {
      response
        .status(500)
        .send({ error: `Unable to fulfill the request. Error: ${error}` });
    } else {
      response.status(204).send();
    }
  };
};

export {
  generateGetSentenceSetCallback,
  generatePutSentenceSetCallback,
  generateGetSentencePairCallback,
  generatePutSentencePairCallback,
};
