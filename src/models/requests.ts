import { Request } from 'express';

interface SentencePairEvaluationRequestBody {
  id: string;
  setId: string;
  q1Score: number;
  q2Score: number;
  evaluatorId: string;
  numOfPracticeSentences: number;
  setSize: number;
  sentenceNum: number;
  humanTranslation: string;
  machineTranslation: string;
  original: string;
  targetLanguage: string;
  sentencePairType: string;
}

interface SentencePairEvaluationRequest extends Request {
  body: SentencePairEvaluationRequestBody;
}

interface ExportRequest extends Request {
  body: ExportRequestBody;
}

interface ExportRequestBody {
  language: string;
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
  sentences: DatasetSentence[];
}

interface DatasetSentence {
  original: string;
  humanTranslation: string;
  machineTranslation: string;
  sentencePairType: string;
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
  DatasetSentence,
  StartRequest,
  ExportRequest,
};
