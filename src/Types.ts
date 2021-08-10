export interface QueryProps {
  field: string;
  operator: '==' | '<=' | '>=' | '<' | '>' | '!=';
  value: string | number | boolean;
}

export interface PayloadProps {
  type: 'start' | 'reply' | 'end' | 'changeStream' | 'error';
  operation: 'create' | 'get' | 'update' | 'replace' | 'delete' | 'error';
  query: QueryProps[];
  payload: any[];
}
