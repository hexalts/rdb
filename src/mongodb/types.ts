import { ChangeStream } from 'src/types/changeStream';

export interface PayloadProps extends ChangeStream {
  operation: OperationTypes | 'error';
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
