import { Request } from 'express';

interface SentenceSetRequestBody {
  sentenceIds: string[];
  feedback: string[];
}

interface SentenceSetRequest extends Request {
  body: SentenceSetRequestBody;
}

interface SentencePairEvaluationRequestBody {
  id: string;
  idList: string[];
  score: number;
}

interface SentencePairEvaluationRequest extends Request {
  body: SentencePairEvaluationRequestBody;
}

interface SentenceSet {
  setId: string;
  sentenceIds?: string[];
  feedback?: string[];
}

interface SentencePair {
  sentenceId: string;
  original: string;
  humanTranslation: string;
  machineTranslation: string;
}

export {
  SentenceSetRequest,
  SentenceSetRequestBody,
  SentencePairEvaluationRequest,
  SentencePairEvaluationRequestBody,
  SentenceSet,
  SentencePair,
};
