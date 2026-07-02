import { Module } from '@nestjs/common';
import { join } from 'node:path';
import { MvcController } from './mvc.controller';

/**
 * Techniques › MVC (#40). Standalone — view-engine setup (`setBaseViewsDir`,
 * `setViewEngine('hbs')`, `useStaticAssets`) happens on the NestExpressApplication
 * in main.ts (or the e2e bootstrap), so this module just owns the controller and
 * exports the asset directories. The docs resolve dirs relative to `__dirname`;
 * the .hbs/.css live next to this source file, so under ts-jest `__dirname` points
 * straight at them. (For a compiled build, copy them via nest-cli `assets`.)
 */
export const MVC_VIEWS_DIR = join(__dirname, 'views');
export const MVC_PUBLIC_DIR = join(__dirname, 'public');

@Module({ controllers: [MvcController] })
export class MvcModule {}
