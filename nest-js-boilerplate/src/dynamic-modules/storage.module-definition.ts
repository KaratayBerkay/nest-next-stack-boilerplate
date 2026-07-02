import { ConfigurableModuleBuilder } from '@nestjs/common';
import type { StorageModuleOptions } from './storage.interfaces';

// ConfigurableModuleBuilder auto-generates the dynamic-module boilerplate: the base class (with
// forRoot + forRootAsync, renamed from the default register/registerAsync via setClassMethodName)
// and the MODULE_OPTIONS_TOKEN the options are bound to.
export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<StorageModuleOptions>()
    .setClassMethodName('forRoot')
    .build();
