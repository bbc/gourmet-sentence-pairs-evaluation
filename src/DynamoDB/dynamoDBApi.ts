import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { SentenceSetRequestBody, SentencePair, SentenceSet } from '../models';
import * as uuidv1 from 'uuid/v1';

const client = new DocumentClient({ region: 'eu-west-1' });

const getSentenceSetsTableName = (): string => {
  return process.env.SENTENCE_SETS_TABLE_NAME || 'none';
};

const getSentencesTableName = (): string => {
  return process.env.SENTENCES_TABLE_NAME || 'none';
};

const getSentencePairScoresTableName = (): string => {
  return process.env.SENTENCE_SCORES_TABLE_NAME || 'none';
};

const getSentenceSet = (setId: string): Promise<SentenceSet> => {
  const input = {
    TableName: getSentenceSetsTableName(),
    KeyConditionExpression: `setId = :id`,
    ExpressionAttributeValues: {
      ':id': setId,
    },
  };

  return client
    .query(input)
    .promise()
    .then(output => {
      if (
        output.Count === undefined ||
        output.Count < 1 ||
        output.Items === undefined
      ) {
        throw new Error(`Item with id: ${setId} does not exist.`);
      } else {
        const sentenceSet: SentenceSet = (output
          .Items[0] as unknown) as SentenceSet;
        return sentenceSet;
      }
    });
};

const putSentenceSet = (
  setId: string,
  setData: SentenceSetRequestBody
): Promise<string> => {
  const input = {
    Item: {
      setId,
      feedback: client.createSet(setData.feedback),
      sentenceIds: client.createSet(setData.sentenceIds),
    },
    TableName: getSentenceSetsTableName(),
  };

  return client
    .put(input)
    .promise()
    .then(result => {
      return 'Successfully put sentence set.';
    });
};

const getSentencePair = (id: string): Promise<SentencePair> => {
  const input = {
    TableName: getSentencesTableName(),
    KeyConditionExpression: `sentenceId = :id`,
    ExpressionAttributeValues: {
      ':id': id,
    },
  };

  return client
    .query(input)
    .promise()
    .then(output => {
      if (
        output.Count === undefined ||
        output.Count < 1 ||
        output.Items === undefined
      ) {
        throw new Error(`Item with id: ${id} does not exist.`);
      } else {
        const sentencePair: SentencePair = (output
          .Items[0] as unknown) as SentencePair;
        return sentencePair;
      }
    });
};

const putSentencePair = (
  id: string,
  sentenceData: SentencePair
): Promise<string> => {
  const input = {
    Item: {
      sentenceId: id,
      original: sentenceData.original,
      humanTranslation: sentenceData.humanTranslation,
      machineTranslation: sentenceData.machineTranslation,
    },
    TableName: getSentencesTableName(),
  };

  return client
    .put(input)
    .promise()
    .then(result => {
      return 'ok';
    });
};

const putSentencePairScore = (sentencePairId: string, score: number) => {
  const scoreId = uuidv1();
  const input = {
    Item: {
      scoreId,
      sentencePairId,
      score,
    },
    TableName: getSentencePairScoresTableName(),
  };

  return client
    .put(input)
    .promise()
    .then(result => {
      return 'ok';
    });
};

export {
  getSentenceSet,
  putSentenceSet,
  getSentencePair,
  putSentencePair,
  putSentencePairScore,
};
