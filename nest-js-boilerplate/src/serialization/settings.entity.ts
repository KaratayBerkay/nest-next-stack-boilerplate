// docs.nestjs.com/techniques/serialization — used to demonstrate the `excludePrefixes` option of
// @SerializeOptions(): any property whose name starts with `_` is dropped from the response
// without needing an explicit @Exclude() on it.
export class SettingsEntity {
  theme!: string;
  _internalId!: string;

  constructor(partial: Partial<SettingsEntity>) {
    Object.assign(this, partial);
  }
}
