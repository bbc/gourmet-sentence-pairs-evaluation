import { Dataset, SentencePair } from './models/models';
import { putSentenceSetAndPairs } from './DynamoDB/dynamoDBApi';
import { DatasetBody, DatasetFile } from './models/requests';
import { Some, None, Option } from './models/generics';
import { logger } from './utils/logger';
/**
 * Turns body of request into a Dataset. Rejects body if sentence sets are not all of equal length.
 */
const cleanData = (
  dataset: DatasetBody,
  datasetFile: DatasetFile
): Option<Dataset> => {
  if (
    datasetFile.targetLanguage !== undefined &&
    datasetFile.sourceLanguage !== undefined
  ) {
    return new Some(
      new Dataset(
        datasetFile.sentences,
        dataset.setName,
        datasetFile.sourceLanguage,
        datasetFile.targetLanguage,
        datasetFile.possibleEvaluatorIds
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
  const sentencePairs = dataset.sentences.map(sentence => {
    return new SentencePair(
      sentence.original,
      sentence.humanTranslation,
      sentence.machineTranslation,
      dataset.sourceLanguage,
      dataset.targetLanguage,
      sentence.sentencePairType
    );
  });
  return sentencePairs;
};

const submitDataset = (
  dataset: DatasetBody,
  datasetFile: DatasetFile,
  dataCleaningFunction: (
    body: DatasetBody,
    file: DatasetFile
  ) => Option<Dataset> = cleanData
): Promise<string> => {
  const cleanedData = dataCleaningFunction(dataset, datasetFile);
  if (cleanedData instanceof Some && cleanedData.value instanceof Dataset) {
    const setName = cleanedData.value.setName;
    const sentencePairs = generateSentencePairs(cleanedData.value);
    return putSentenceSetAndPairs(
      sentencePairs,
      setName,
      cleanedData.value.sourceLanguage,
      cleanedData.value.targetLanguage,
      cleanedData.value.possibleEvaluatorIds
    );
  } else {
    const errorMessage = `Could not clean data. Dataset:${JSON.stringify(
      dataset
    )}`;
    logger.error(errorMessage);
    return Promise.reject(errorMessage);
  }
};

export { cleanData, submitDataset };
