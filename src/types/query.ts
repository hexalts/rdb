import { Operator } from './operator';

export interface Query {
  field: string;
  operator: Operator;
  value: string | number | boolean;
}
