import { ObjectId } from 'mongodb';
import { Operator } from 'src/types/operator';
import { Query } from 'src/types/query';

export const operatorParser = (operator: Operator): string => {
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

export const filterParser = (query: Query[]) => {
  try {
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
  } catch (error) {
    throw new Error(
      'There is a problem when parsing your query. Is it a valid query with @hexalts/rdb standards?',
    );
  }
};
