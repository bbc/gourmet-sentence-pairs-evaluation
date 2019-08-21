import { Request } from 'express';

interface SentenceSetRequestBody {
  sentenceIds: string[];
  feedback: string[];
}

interface SentenceSetRequest extends Request {
  body: SentenceSetRequestBody;
}

interface SentencePairRequestBody {
  original: string;
  humanTranslation: string;
  machineTranslation: string;
}

interface SentencePairRequest extends Request {
  body: SentencePairRequestBody;
}

export {
  SentenceSetRequest,
  SentenceSetRequestBody,
  SentencePairRequest,
  SentencePairRequestBody,
};
