import { Query } from './query';

export interface ChangeStream {
  type: 'changeStream' | 'error';
  query: Query[];
  payload: Record<string, unknown> | [];
}
