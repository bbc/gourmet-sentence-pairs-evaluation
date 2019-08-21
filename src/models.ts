import { Request } from 'express';

interface SentenceSetRequestBody {
  sentenceIds: string[];
  feedback: string[];
}

interface SentenceSetRequest extends Request {
  body: SentenceSetRequestBody;
}

export { SentenceSetRequest, SentenceSetRequestBody };
