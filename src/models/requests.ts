import { Request } from 'express';

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

interface DatasetRequest extends Request {
  body: DatasetBody;
}

interface DatasetBody {
  setName: string;
  englishText: string;
  humanTranslatedText: string;
  machineTranslatedText: string;
}

export {
  SentencePairEvaluationRequest,
  SentencePairEvaluationRequestBody,
  FeedbackRequest,
  DatasetRequest,
  DatasetBody,
};
