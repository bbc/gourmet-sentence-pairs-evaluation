import { Request } from 'express';

interface SentencePairEvaluationRequestBody {
  id: string;
  setId: string;
  score: number;
  evaluatorId: string;
  numOfPracticeSentences: number;
  setSize: number;
  sentenceNum: number;
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
  evaluatorId: string;
}

interface DatasetRequest extends Request {
  body: DatasetBody;
}

interface DatasetBody {
  setName: string;
  sourceLanguage: string;
  targetLanguage: string;
}

interface DatasetFile {
  sourceText: string;
  humanTranslatedText: string;
  machineTranslatedText: string;
}

interface StartRequest extends Request {
  body: StartBody;
}

interface StartBody {
  setId: string;
  evaluatorId: string;
}

export {
  SentencePairEvaluationRequest,
  SentencePairEvaluationRequestBody,
  FeedbackRequest,
  DatasetRequest,
  DatasetBody,
  DatasetFile,
  StartRequest,
};
