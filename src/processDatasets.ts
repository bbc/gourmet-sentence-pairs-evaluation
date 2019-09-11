import { Dataset, SentencePair, Language } from './models/models';
import { putSentenceSetAndPairs } from './DynamoDB/dynamoDBApi';
import { DatasetBody } from './models/requests';
import { Some, None, Option } from './models/generics';
/**
 * Turns body of request into a Dataset. Rejects body if sentence sets are not all of equal length.
 */
const cleanData = (dataset: DatasetBody): Option<Dataset> => {
  const regex = /[\n\r]+/;
  const englishSentences = dataset.englishText
    .split(regex)
    .filter(s => s !== '');
  const humanTranslatedSentences = dataset.humanTranslatedText
    .split(regex)
    .filter(s => s !== '');
  const machineTranslatedSentences = dataset.machineTranslatedText
    .split(regex)
    .filter(s => s !== '');
  const targetLanguage: Language = (Language as any)[dataset.language];
  if (
    englishSentences.length === machineTranslatedSentences.length &&
    englishSentences.length === humanTranslatedSentences.length &&
    targetLanguage !== undefined
  ) {
    return new Some(
      new Dataset(
        englishSentences,
        humanTranslatedSentences,
        machineTranslatedSentences,
        dataset.setName,
        Language.ENGLISH,
        targetLanguage
      )
    );
  } else {
    return new None();
  }
};

/**
 * Turns Dataset into a list of sentence pairs.
 * If lists of sentences are not of equal length
 * use "none" as opposed to rejecting the dataset.
 * Assumption is that the dataset will be created
 * using the  'cleanData' function
 */
const generateSentencePairs = (dataset: Dataset): SentencePair[] => {
  const englishSentences = dataset.englishSentences;
  const humanTranslatedSentences = dataset.humanTranslatedSentences;
  const machineTranslatedSentences = dataset.machineTranslatedSentences;

  const sentencePairs = englishSentences.map((sentence, i) => {
    return new SentencePair(
      sentence,
      humanTranslatedSentences[i] || 'none',
      machineTranslatedSentences[i] || 'none',
      dataset.sourceLanguage,
      dataset.targetLanguage
    );
  });
  return sentencePairs;
};

const submitDataset = (dataset: DatasetBody): Promise<string> => {
  const cleanedData = cleanData(dataset);
  if (cleanedData instanceof Some && cleanedData.value instanceof Dataset) {
    const setName = cleanedData.value.setName;
    const sentencePairs = generateSentencePairs(cleanedData.value);
    return putSentenceSetAndPairs(
      sentencePairs,
      setName,
      cleanedData.value.sourceLanguage,
      cleanedData.value.targetLanguage
    );
  } else {
    const errorMessage = `Could not clean data. Dataset:${JSON.stringify(
      dataset
    )}`;
    console.error(errorMessage);
    return Promise.reject(errorMessage);
  }
};

export { cleanData, submitDataset };
