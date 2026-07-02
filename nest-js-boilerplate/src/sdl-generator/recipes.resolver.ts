import { Args, ID, Query, Resolver } from '@nestjs/graphql';
import { Recipe } from './models/recipe.model';

@Resolver(() => Recipe)
export class RecipesResolver {
  @Query(() => Recipe, { name: 'recipe' })
  recipe(@Args('id', { type: () => ID }) id: string): Recipe {
    return {
      id,
      description: 'A tasty dish',
      preparationTimeMinutes: 30,
      ingredients: ['salt', 'pepper'],
    };
  }

  @Query(() => [Recipe], { name: 'recipes' })
  recipes(): Recipe[] {
    return [];
  }
}
