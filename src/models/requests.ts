import { Request } from 'express';
import { ArrayField, Field } from 'sparkson';

interface SentencePairEvaluationRequestBody {
  id: string;
  setId: string;
  q1Score: number;
  q2Score: number;
  evaluatorId: string;
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
  targetLanguage: string;
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

class DatasetFile {
  constructor(
    @ArrayField('sentences', DatasetSentence)
    public sentences: DatasetSentence[]
  ) {}
}

class DatasetSentence {
  constructor(
    @Field('original') public original: string,
    @Field('humanTranslation') public humanTranslation: string,
    @Field('machineTranslation') public machineTranslation: string,
    @Field('sentencePairType') public sentencePairType: string
  ) {}
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
