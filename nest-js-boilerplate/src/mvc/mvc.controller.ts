import { Controller, Get, Param, Render, Res } from '@nestjs/common';
import type { Response } from 'express';

/**
 * Techniques › MVC (#40). Server-rendered HTML with the hbs engine.
 */
@Controller('mvc')
export class MvcController {
  // Static view name via @Render; the returned object is the template model.
  @Get()
  @Render('index')
  root(): { message: string } {
    return { message: 'Hello world!' };
  }

  // Dynamic rendering: pick the view/model at runtime via @Res().render().
  @Get('dynamic/:name')
  dynamic(@Param('name') name: string, @Res() res: Response): void {
    res.render('dynamic', { message: `Hello, ${name}!` });
  }
}
