export interface QueryProps {
  field: string;
  operator: '==' | '<=' | '>=' | '<' | '>' | '!=';
  value: string | number | boolean;
}

export interface PayloadProps {
  type: 'start' | 'reply' | 'end' | 'changeStream' | 'error';
  operation: OperationTypes | 'error';
  query: QueryProps[];
  payload: Record<string, unknown> | [];
}

export type OperationTypes =
  | 'drop'
  | 'rename'
  | 'dropDatabase'
  | 'invalidate'
  | 'createIndexes'
  | 'create'
  | 'modify'
  | 'dropIndexes'
  | 'shardCollection'
  | 'reshardCollection'
  | 'refineCollectionShardKey'
  | 'insert'
  | 'update'
  | 'replace'
  | 'delete';

export type NameSpace = {
  db?: string;
  coll?: string;
};
