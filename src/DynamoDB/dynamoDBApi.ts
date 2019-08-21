import { DocumentClient, QueryOutput } from 'aws-sdk/clients/dynamodb';
import { AWSError } from 'aws-sdk/lib/error';

const client = new DocumentClient({ region: 'eu-west-1' });

const getSentenceSetsTableName = (): string => {
  return process.env.SENTENCE_SETS_TABLE_NAME || 'none';
};

const getSentenceSet = (
  setId: string,
  callback: (err: AWSError, output: QueryOutput) => void
) => {
  const input = {
    TableName: getSentenceSetsTableName(),
    KeyConditionExpression: `setId = :id`,
    ExpressionAttributeValues: {
      ':id': setId,
    },
  };

  return client.query(input, callback);
};

export { getSentenceSet };
