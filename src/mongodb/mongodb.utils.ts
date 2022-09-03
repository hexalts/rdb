import { ObjectId } from 'mongodb';
import { QueryProps } from './types';

export const operatorParser = (
  operator: '==' | '<=' | '>=' | '<' | '>' | '!=',
): string => {
  switch (operator) {
    case '!=':
      return '$ne';
    case '<':
      return '$lt';
    case '<=':
      return '$lte';
    case '==':
      return '$eq';
    case '>':
      return '$gt';
    case '>=':
      return '$gte';
    default:
      return '$eq';
  }
};

export const filterParser = (query: QueryProps[]) => {
  if (query.length === 0) return {};
  return {
    $and: query.map((Query) => {
      return {
        [Query.field]: {
          [operatorParser(Query.operator)]:
            Query.field === '_id' && typeof Query.value === 'string'
              ? new ObjectId(Query.value)
              : Query.value,
        },
      };
    }),
  };
};
