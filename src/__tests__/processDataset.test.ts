import { cleanData, submitDataset } from '../processDataset';
import { Dataset, Language } from '../models/models';
import { DatasetBody, DatasetFile, DatasetSentence } from '../models/requests';
import { Some, None } from '../models/generics';

jest.mock('../DynamoDB/dynamoDBApi');
const dynamoDBApi = require('../DynamoDB/dynamoDBApi');

describe('cleanData', () => {
  test('should return a Some of type Dataset if dataset body is valid', () => {
    const input: DatasetBody = {
      setName: '',
      sourceLanguage: 'ENGLISH',
      targetLanguage: 'BULGARIAN',
    };

    const sentence: DatasetSentence = {
      original: 'Sentence1',
      humanTranslation: 'human',
      machineTranslation: 'machine',
      sentencePairType: 'A',
    };

    const file: DatasetFile = {
      sentences: [sentence],
    };
    const expectedDataset: Dataset = new Dataset(
      [sentence],
      '',
      Language.ENGLISH,
      Language.BULGARIAN
    );
    const expectedOutput = new Some(expectedDataset);
    expect(cleanData(input, file)).toEqual(expectedOutput);
  });

  test("should return None if the source language is not defined in the 'Language' enum", () => {
    const input: DatasetBody = {
      setName: '',
      sourceLanguage: 'GREEK',
      targetLanguage: 'BULGARIAN',
    };
    const sentence: DatasetSentence = {
      original: 'Sentence1',
      humanTranslation: 'human',
      machineTranslation: 'machine',
      sentencePairType: 'A',
    };

    const file: DatasetFile = {
      sentences: [sentence],
    };
    const expectedOutput = new None();
    expect(cleanData(input, file)).toEqual(expectedOutput);
  });

  test("should return None if the target language is not defined in the 'Language' enum", () => {
    const input: DatasetBody = {
      setName: '',
      sourceLanguage: 'ENGLISH',
      targetLanguage: 'GREEK',
    };
    const sentence: DatasetSentence = {
      original: 'Sentence1',
      humanTranslation: 'human',
      machineTranslation: 'machine',
      sentencePairType: 'A',
    };

    const file: DatasetFile = {
      sentences: [sentence],
    };
    const expectedOutput = new None();
    expect(cleanData(input, file)).toEqual(expectedOutput);
  });

  test('should not fail if the source language is lower case', () => {
    const input: DatasetBody = {
      setName: '',
      sourceLanguage: 'english',
      targetLanguage: 'BULGARIAN',
    };
    const sentence: DatasetSentence = {
      original: 'Sentence1',
      humanTranslation: 'human',
      machineTranslation: 'machine',
      sentencePairType: 'A',
    };

    const file: DatasetFile = {
      sentences: [sentence],
    };
    const expectedDataset: Dataset = new Dataset(
      [sentence],
      '',
      Language.ENGLISH,
      Language.BULGARIAN
    );
    const expectedOutput = new Some(expectedDataset);
    expect(cleanData(input, file)).toEqual(expectedOutput);
  });

  test('should not fail if the target language is lower case', () => {
    const input: DatasetBody = {
      setName: '',
      sourceLanguage: 'ENGLISH',
      targetLanguage: 'bulgarian',
    };
    const sentence: DatasetSentence = {
      original: 'Sentence1',
      humanTranslation: 'human',
      machineTranslation: 'machine',
      sentencePairType: 'A',
    };

    const file: DatasetFile = {
      sentences: [sentence],
    };
    const expectedDataset: Dataset = new Dataset(
      [sentence],
      '',
      Language.ENGLISH,
      Language.BULGARIAN
    );
    const expectedOutput = new Some(expectedDataset);
    expect(cleanData(input, file)).toEqual(expectedOutput);
  });
});

describe('submitDataset', () => {
  test('should return a promise of a string where the string is the sentence set ID generated when the data is submitted to the DB if data can be cleaned', () => {
    const datasetIDInDB = '1234';

    dynamoDBApi.putSentenceSetAndPairs.mockImplementation(() => {
      return Promise.resolve(datasetIDInDB);
    });

    const input: DatasetBody = {
      setName: '',
      sourceLanguage: 'ENGLISH',
      targetLanguage: 'BULGARIAN',
    };
    const sentence: DatasetSentence = {
      original: 'Sentence1',
      humanTranslation: 'human',
      machineTranslation: 'machine',
      sentencePairType: 'A',
    };

    const file: DatasetFile = {
      sentences: [sentence],
    };

    const mockCleaningFunction = (body: DatasetBody, file: DatasetFile) =>
      new Some(
        new Dataset([sentence], '', Language.BULGARIAN, Language.BULGARIAN)
      );

    return submitDataset(input, file, mockCleaningFunction).then(id => {
      expect(id).toEqual(datasetIDInDB);
    });
  });

  test('should return a promise that will reject if the cleaned data is an instance of None', () => {
    const datasetIDInDB = '1234';

    dynamoDBApi.putSentenceSetAndPairs.mockImplementation(() => {
      return Promise.resolve(datasetIDInDB);
    });

    // Cleaned data will be 'None'. as source language is invalid
    const input: DatasetBody = {
      setName: '',
      sourceLanguage: 'GREEK',
      targetLanguage: 'BULGARIAN',
    };
    const sentence: DatasetSentence = {
      original: 'Sentence1',
      humanTranslation: 'human',
      machineTranslation: 'machine',
      sentencePairType: 'A',
    };

    const file: DatasetFile = {
      sentences: [sentence],
    };

    const mockCleaningFunction = (body: DatasetBody, file: DatasetFile) =>
      new None();

    return expect(
      submitDataset(input, file, mockCleaningFunction)
    ).rejects.toMatch(
      'Could not clean data. Dataset:{"setName":"","sourceLanguage":"GREEK","targetLanguage":"BULGARIAN"}'
    );
  });

  test('should return a promise that will reject if the cleaned data Option does not contain a value that is of type DataSet', () => {
    const datasetIDInDB = '1234';

    dynamoDBApi.putSentenceSetAndPairs.mockImplementation(() => {
      return Promise.resolve(datasetIDInDB);
    });

    jest.mock('../processDataset');
    const dataset = require('../processDataset');
    dataset.cleanData.mockImplementation(() => {
      return new Some('123');
    });

    // Cleaned data will be 'None'. as source language is invalid
    const input: DatasetBody = {
      setName: '',
      sourceLanguage: 'GREEK',
      targetLanguage: 'BULGARIAN',
    };
    const sentence: DatasetSentence = {
      original: 'Sentence1',
      humanTranslation: 'human',
      machineTranslation: 'machine',
      sentencePairType: 'A',
    };

    const file: DatasetFile = {
      sentences: [sentence],
    };

    const mockCleaningFunction = (body: DatasetBody, file: DatasetFile) =>
      new Some('');

    return expect(
      submitDataset(input, file, mockCleaningFunction)
    ).rejects.toMatch(
      'Could not clean data. Dataset:{"setName":"","sourceLanguage":"GREEK","targetLanguage":"BULGARIAN"}'
    );
  });
});
