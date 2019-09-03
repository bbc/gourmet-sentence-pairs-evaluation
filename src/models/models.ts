import * as uuidv1 from 'uuid/v1';

class Dataset {
  constructor(
    public englishSentences: string[],
    public humanTranslatedSentences: string[],
    public machineTranslatedSentences: string[],
    public setName: string,
    public sourceLanguage: string,
    public targetLanguage: string
  ) {}
}

class SentenceSet {
  public setId: string;

  constructor(
    public name: string,
    public sourceLanguage: string,
    public targetLanguage: string,
    public sentenceIds?: string[],
    setId?: string
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
    sentenceId?: string
  ) {
    this.sentenceId = sentenceId === undefined ? uuidv1() : sentenceId;
  }
}

enum Language {
  BULGARIAN = 'bg',
  GUJARATI = 'gu',
  SWAHILI = 'sw',
}

export { SentenceSet, SentencePair, Dataset, Language };
