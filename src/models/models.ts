import * as uuidv1 from 'uuid/v1';
import { DatasetSentence } from './requests';

class Dataset {
  constructor(
    public sentences: DatasetSentence[],
    public setName: string,
    public sourceLanguage: string,
    public targetLanguage: string,
    public possibleEvaluatorIds: string[]
  ) {}
}

class SentenceSet {
  public setId: string;

  constructor(
    public name: string,
    public sourceLanguage: string,
    public targetLanguage: string,
    public possibleEvaluatorIds: Set<string>,
    public sentenceIds?: Set<string>,
    setId?: string,
    public evaluatorIds?: Set<string>
  ) {
    this.setId = setId === undefined ? uuidv1() : setId;
  }
}

class SentencePair {
  public sentenceId: string;

  constructor(
    public original: string,
    public humanTranslation: string,
    public machineTranslation: string,
    public sourceLanguage: string,
    public targetLanguage: string,
    public sentencePairType: string,
    sentenceId?: string
  ) {
    this.sentenceId = sentenceId === undefined ? uuidv1() : sentenceId;
  }
}

class SentencePairScore {
  public timestamp: number;
  constructor(
    public sentencePairId: string,
    public evaluatorId: string,
    public q1Score: number,
    public q2Score: number,
    public targetLanguage: string,
    public humanTranslation: string,
    public machineTranslation: string,
    public original: string,
    public sentencePairType: string,
    public scoreId?: string,
    timestamp?: number
  ) {
    this.scoreId = scoreId === undefined ? uuidv1() : scoreId;
    this.timestamp = timestamp === undefined ? -1 : timestamp;
  }
}

class SentenceSetFeedback {
  constructor(
    public feedbackId: string,
    public evaluatorId: string,
    public feedback: string,
    public setId: string,
    public targetLanguage: string
  ) {}
}

interface EvaluatorSet {
  setName: string;
  evaluators: string;
  targetLanguage: string;
}

export {
  SentenceSet,
  SentencePair,
  SentencePairScore,
  Dataset,
  SentenceSetFeedback,
  EvaluatorSet,
};
