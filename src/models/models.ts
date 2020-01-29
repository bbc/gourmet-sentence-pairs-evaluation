import * as uuidv1 from 'uuid/v1';
import { DatasetSentence } from './requests';

class Dataset {
  constructor(
    public sentences: DatasetSentence[],
    public setName: string,
    public sourceLanguage: Language,
    public targetLanguage: Language
  ) {}
}

class SentenceSet {
  public setId: string;

  constructor(
    public name: string,
    public sourceLanguage: Language,
    public targetLanguage: Language,
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
    public sourceLanguage: Language,
    public targetLanguage: Language,
    public sentencePairType: string,
    sentenceId?: string
  ) {
    this.sentenceId = sentenceId === undefined ? uuidv1() : sentenceId;
  }
}

class SentencePairScore {
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
    public scoreId?: string
  ) {
    this.scoreId = scoreId === undefined ? uuidv1() : scoreId;
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

enum Language {
  BULGARIAN = 'bg',
  GUJARATI = 'gu',
  SWAHILI = 'sw',
  TURKISH = 'tr',
  ENGLISH = 'en',
}

export {
  SentenceSet,
  SentencePair,
  SentencePairScore,
  Dataset,
  Language,
  SentenceSetFeedback,
};
