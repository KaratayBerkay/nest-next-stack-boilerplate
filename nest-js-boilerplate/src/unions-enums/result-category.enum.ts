import { registerEnumType } from '@nestjs/graphql';

// A TS enum surfaced to GraphQL. registerEnumType is what makes it a real schema enum;
// without it the type can't be referenced by @Field/@Args.
export enum ResultCategory {
  NEWS = 'NEWS',
  ENTERTAINMENT = 'ENTERTAINMENT',
  SPORTS = 'SPORTS',
}

registerEnumType(ResultCategory, {
  name: 'ResultCategory',
  description: 'The category a search result belongs to.',
  valuesMap: {
    NEWS: { description: 'Timely, factual reporting.' },
    SPORTS: { deprecationReason: 'Folded into ENTERTAINMENT.' },
  },
});
