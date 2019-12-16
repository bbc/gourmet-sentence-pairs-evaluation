import { cleanData } from '../processDataset';
import { Dataset, Language } from '../models/models';
import { DatasetBody, DatasetFile } from '../models/requests';
import { Some, None } from '../models/generics';

describe('cleanData', () => {
  test('should return a Some of type Dataset if dataset body is valid', () => {
    const input: DatasetBody = {
      setName: '',
      sourceLanguage: 'ENGLISH',
      targetLanguage: 'BULGARIAN',
    };
    const file: DatasetFile = {
      sourceText: 'Sentence 1.\nSentence 2.',
      machineTranslatedText: 'Sentence 1.\nSentence 2.',
      humanTranslatedText: 'Sentence 1.\nSentence 2.',
    };
    const expectedDataset: Dataset = new Dataset(
      ['Sentence 1.', 'Sentence 2.'],
      ['Sentence 1.', 'Sentence 2.'],
      ['Sentence 1.', 'Sentence 2.'],
      '',
      Language.ENGLISH,
      Language.BULGARIAN
    );
    const expectedOutput = new Some(expectedDataset);
    expect(cleanData(input, file)).toEqual(expectedOutput);
  });

  test('should return a Some of type Dataset when carriage returns are used to split data', () => {
    const input: DatasetBody = {
      setName: 'test',
      sourceLanguage: 'ENGLISH',
      targetLanguage: 'BULGARIAN',
    };
    const file: DatasetFile = {
      sourceText: 'Sentence 1.\r\nSentence 2.\r\n',
      humanTranslatedText: 'Sentence 1.\r\nSentence 2.\r\n',
      machineTranslatedText: 'Sentence 1.\r\nSentence 2.\r\n',
    };
    const expectedOutput = new Some(
      new Dataset(
        ['Sentence 1.', 'Sentence 2.'],
        ['Sentence 1.', 'Sentence 2.'],
        ['Sentence 1.', 'Sentence 2.'],
        'test',
        Language.ENGLISH,
        Language.BULGARIAN
      )
    );
    expect(cleanData(input, file)).toEqual(expectedOutput);
  });

  test('should not create sentences that are empty strings when multiple carriage returns are used to split data', () => {
    const input: DatasetBody = {
      setName: 'test',
      sourceLanguage: 'ENGLISH',
      targetLanguage: 'BULGARIAN',
    };
    const file: DatasetFile = {
      sourceText: 'Sentence 1.\r\r\r\nSentence 2.\r\n',
      humanTranslatedText: 'Sentence 1.\r\nSentence 2.\r\n',
      machineTranslatedText: 'Sentence 1.\r\nSentence 2.\r\n',
    };
    const expectedOutput = new Some(
      new Dataset(
        ['Sentence 1.', 'Sentence 2.'],
        ['Sentence 1.', 'Sentence 2.'],
        ['Sentence 1.', 'Sentence 2.'],
        'test',
        Language.ENGLISH,
        Language.BULGARIAN
      )
    );
    expect(cleanData(input, file)).toEqual(expectedOutput);
  });

  test('should not create sentences that are empty strings when multiple new lines are used to split data', () => {
    const input: DatasetBody = {
      setName: 'test',
      sourceLanguage: 'ENGLISH',
      targetLanguage: 'BULGARIAN',
    };
    const file: DatasetFile = {
      sourceText: 'Sentence 1.\n\n\n\nSentence 2.\r\n',
      humanTranslatedText: 'Sentence 1.\r\nSentence 2.\r\n',
      machineTranslatedText: 'Sentence 1.\r\nSentence 2.\r\n',
    };
    const expectedOutput = new Some(
      new Dataset(
        ['Sentence 1.', 'Sentence 2.'],
        ['Sentence 1.', 'Sentence 2.'],
        ['Sentence 1.', 'Sentence 2.'],
        'test',
        Language.ENGLISH,
        Language.BULGARIAN
      )
    );
    expect(cleanData(input, file)).toEqual(expectedOutput);
  });

  test('should return a None if machine translated text does not have enough sentences', () => {
    const input: DatasetBody = {
      setName: '',
      sourceLanguage: 'ENGLISH',
      targetLanguage: 'BULGARIAN',
    };
    const file: DatasetFile = {
      sourceText: 'Sentence 1.\nSentence 2.',
      machineTranslatedText: '',
      humanTranslatedText: 'Sentence 1.\nSentence 2.',
    };
    const expectedOutput = new None();
    expect(cleanData(input, file)).toEqual(expectedOutput);
  });

  test('should return a None if machine translated text has too many sentences', () => {
    const input: DatasetBody = {
      setName: '',
      sourceLanguage: 'ENGLISH',
      targetLanguage: 'BULGARIAN',
    };
    const file: DatasetFile = {
      sourceText: 'Sentence 1.\nSentence 2.',
      machineTranslatedText: 'Sentence 1.\nSentence 2.\nSentence 3.',
      humanTranslatedText: 'Sentence 1.\nSentence 2.',
    };
    const expectedOutput = new None();
    expect(cleanData(input, file)).toEqual(expectedOutput);
  });

  test('should return a None if human translated text does not have enough sentences', () => {
    const input: DatasetBody = {
      setName: '',
      sourceLanguage: 'ENGLISH',
      targetLanguage: 'BULGARIAN',
    };
    const file: DatasetFile = {
      sourceText: 'Sentence 1.\nSentence 2.',
      machineTranslatedText: 'Sentence 1.\nSentence 2.',
      humanTranslatedText: '',
    };
    const expectedOutput = new None();
    expect(cleanData(input, file)).toEqual(expectedOutput);
  });

  test('should return a None if human translated text has too many sentences', () => {
    const input: DatasetBody = {
      setName: '',
      sourceLanguage: 'ENGLISH',
      targetLanguage: 'BULGARIAN',
    };
    const file: DatasetFile = {
      sourceText: 'Sentence 1.\nSentence 2.',
      machineTranslatedText: 'Sentence 1.\nSentence 2.',
      humanTranslatedText: 'Sentence 1.\nSentence 2.\nSentence 3.',
    };
    const expectedOutput = new None();
    expect(cleanData(input, file)).toEqual(expectedOutput);
  });

  test("should return None if the source language is not defined in the 'Language' enum", () => {
    const input: DatasetBody = {
      setName: '',
      sourceLanguage: 'GREEK',
      targetLanguage: 'BULGARIAN',
    };
    const file: DatasetFile = {
      sourceText: 'Sentence 1.\nSentence 2.',
      machineTranslatedText: 'Sentence 1.\nSentence 2.',
      humanTranslatedText: 'Sentence 1.\nSentence 2.',
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
    const file: DatasetFile = {
      sourceText: 'Sentence 1.\nSentence 2.',
      machineTranslatedText: 'Sentence 1.\nSentence 2.',
      humanTranslatedText: 'Sentence 1.\nSentence 2.',
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
    const file: DatasetFile = {
      sourceText: 'Sentence 1.\nSentence 2.',
      machineTranslatedText: 'Sentence 1.\nSentence 2.',
      humanTranslatedText: 'Sentence 1.\nSentence 2.',
    };
    const expectedDataset: Dataset = new Dataset(
      ['Sentence 1.', 'Sentence 2.'],
      ['Sentence 1.', 'Sentence 2.'],
      ['Sentence 1.', 'Sentence 2.'],
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
    const file: DatasetFile = {
      sourceText: 'Sentence 1.\nSentence 2.',
      machineTranslatedText: 'Sentence 1.\nSentence 2.',
      humanTranslatedText: 'Sentence 1.\nSentence 2.',
    };
    const expectedDataset: Dataset = new Dataset(
      ['Sentence 1.', 'Sentence 2.'],
      ['Sentence 1.', 'Sentence 2.'],
      ['Sentence 1.', 'Sentence 2.'],
      '',
      Language.ENGLISH,
      Language.BULGARIAN
    );
    const expectedOutput = new Some(expectedDataset);
    expect(cleanData(input, file)).toEqual(expectedOutput);
  });
});
