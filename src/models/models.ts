import * as uuidv1 from 'uuid/v1';

class Dataset {
  constructor(
    public sourceSentences: string[],
    public humanTranslatedSentences: string[],
    public machineTranslatedSentences: string[],
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
    public targetLanguage: string,
    public humanTranslation: string,
    public machineTranslation: string,
    public original: string,
    public scoreId?: string
  ) {
    this.scoreId = scoreId === undefined ? uuidv1() : scoreId;
  }

  public convertToCSV(): string {
    return `${this.scoreId}, ${this.sentencePairId}, ${this.targetLanguage}, ${this.humanTranslation}, ${this.machineTranslation}, ${this.original}, ${this.evaluatorId}, ${this.q1Score}`;
  }
}

enum Language {
  BULGARIAN = 'bg',
  GUJARATI = 'gu',
  SWAHILI = 'sw',
  ENGLISH = 'en',
}

export { SentenceSet, SentencePair, SentencePairScore, Dataset, Language };
