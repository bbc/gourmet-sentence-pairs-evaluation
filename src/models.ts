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
  setId: string;
  idList: string[];
  score: number;
}

interface SentencePairEvaluationRequest extends Request {
  body: SentencePairEvaluationRequestBody;
}

interface FeedbackRequest extends Request {
  body: FeedbackRequestBody;
}

interface FeedbackRequestBody {
  setId: string;
  feedback: string;
}

interface SentenceSet {
  setId: string;
  name: string;
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
  FeedbackRequest,
};
