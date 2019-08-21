import { DocumentClient, QueryOutput } from 'aws-sdk/clients/dynamodb';
import { AWSError } from 'aws-sdk/lib/error';
import { SentenceSetRequestBody } from '../models';

const client = new DocumentClient({ region: 'eu-west-1' });

const getSentenceSetsTableName = (): string => {
  return process.env.SENTENCE_SETS_TABLE_NAME || 'none';
};

const getSentencesTableName = (): string => {
  return process.env.SENTENCES_TABLE_NAME || 'none';
};

const getSentenceSet = (
  setId: string,
  callback: (err: AWSError, output: QueryOutput) => void
): void => {
  const input = {
    TableName: getSentenceSetsTableName(),
    KeyConditionExpression: `setId = :id`,
    ExpressionAttributeValues: {
      ':id': setId,
    },
  };

  client.query(input, callback);
};

const putSentenceSet = (
  setId: string,
  setData: SentenceSetRequestBody,
  callback: (err: AWSError, output: QueryOutput) => void
): void => {
  const input = {
    Item: {
      setId,
      feedback: client.createSet(setData.feedback),
      sentenceIds: client.createSet(setData.sentenceIds),
    },
    TableName: getSentenceSetsTableName(),
  };

  client.put(input, callback);
};

const getSentencePair = (
  id: string,
  callback: (err: AWSError, output: QueryOutput) => void
) => {
  const input = {
    TableName: getSentencesTableName(),
    KeyConditionExpression: `sentenceId = :id`,
    ExpressionAttributeValues: {
      ':id': id,
    },
  };

  client.query(input, callback);
};

export { getSentenceSet, putSentenceSet, getSentencePair };
