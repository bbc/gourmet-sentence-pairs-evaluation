import { cleanData } from '../processDatasets';
import { Dataset } from '../models/models';
import { DatasetBody } from '../models/requests';
import { Some, None } from '../models/generics';

describe('cleanData', () => {
  test('should return a Some of type Dataset if dataset body is valid', () => {
    const input: DatasetBody = {
      englishText: 'Sentence 1.\nSentence 2.',
      machineTranslatedText: 'Sentence 1.\nSentence 2.',
      humanTranslatedText: 'Sentence 1.\nSentence 2.',
      setName: '',
    };
    const expectedDataset: Dataset = {
      englishSentences: ['Sentence 1.', 'Sentence 2.'],
      humanTranslatedSentences: ['Sentence 1.', 'Sentence 2.'],
      machineTranslatedSentences: ['Sentence 1.', 'Sentence 2.'],
      setName: '',
    };
    const expectedOutput = new Some(expectedDataset);
    expect(cleanData(input)).toEqual(expectedOutput);
  });

  test('should return a Some of type Dataset when carriage returns are used to split data', () => {
    const input = {
      setName: 'test',
      englishText: 'Sentence 1.\r\nSentence 2.\r\n',
      humanTranslatedText: 'Sentence 1.\r\nSentence 2.\r\n',
      machineTranslatedText: 'Sentence 1.\r\nSentence 2.\r\n',
    };
    const expectedOutput = {
      setName: 'test',
      englishSentences: ['Sentence 1.', 'Sentence 2.'],
      humanTranslatedSentences: ['Sentence 1.', 'Sentence 2.'],
      machineTranslatedSentences: ['Sentence 1.', 'Sentence 2.'],
    };
    const r = cleanData(input);
    console.log(r);
    expect(r).toEqual(expectedOutput);
  });

  test('should return a None if machine translated text does not have enough sentences', () => {
    const input: DatasetBody = {
      englishText: 'Sentence 1.\nSentence 2.',
      machineTranslatedText: '',
      humanTranslatedText: 'Sentence 1.\nSentence 2.',
      setName: '',
    };
    const expectedOutput = new None();
    expect(cleanData(input)).toEqual(expectedOutput);
  });

  test('should return a None if machine translated text has too many sentences', () => {
    const input: DatasetBody = {
      englishText: 'Sentence 1.\nSentence 2.',
      machineTranslatedText: 'Sentence 1.\nSentence 2.\nSentence 3.',
      humanTranslatedText: 'Sentence 1.\nSentence 2.',
      setName: '',
    };
    const expectedOutput = new None();
    expect(cleanData(input)).toEqual(expectedOutput);
  });

  test('should return a None if human translated text does not have enough sentences', () => {
    const input: DatasetBody = {
      englishText: 'Sentence 1.\nSentence 2.',
      machineTranslatedText: 'Sentence 1.\nSentence 2.',
      humanTranslatedText: '',
      setName: '',
    };
    const expectedOutput = new None();
    expect(cleanData(input)).toEqual(expectedOutput);
  });

  test('should return a None if human translated text has too many sentences', () => {
    const input: DatasetBody = {
      englishText: 'Sentence 1.\nSentence 2.',
      machineTranslatedText: 'Sentence 1.\nSentence 2.',
      humanTranslatedText: 'Sentence 1.\nSentence 2.\nSentence 3.',
      setName: '',
    };
    const expectedOutput = new None();
    expect(cleanData(input)).toEqual(expectedOutput);
  });
});
