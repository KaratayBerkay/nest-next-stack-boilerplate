export class CreateUserDto {
  firstName: string;
  lastName: string;
  /** Photo URLs persisted as related `Photo` rows via the cascade relation. */
  photos?: string[];
}
