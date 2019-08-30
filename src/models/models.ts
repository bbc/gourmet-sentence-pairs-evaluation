import * as uuidv1 from 'uuid/v1';

class Dataset {
  constructor(
    public englishSentences: string[],
    public humanTranslatedSentences: string[],
    public machineTranslatedSentences: string[],
    public setName: string
  ) {}
}

class SentenceSet {
  public setId: string;

  constructor(
    public name: string,
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
    sentenceId?: string
  ) {
    this.sentenceId = sentenceId === undefined ? uuidv1() : sentenceId;
  }
}

export { SentenceSet, SentencePair, Dataset };
