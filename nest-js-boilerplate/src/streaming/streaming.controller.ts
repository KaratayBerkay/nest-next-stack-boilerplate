import { Controller, Get, Header, Res, StreamableFile } from '@nestjs/common';
import { createReadStream } from 'node:fs';
import { join } from 'node:path';
import type { Response } from 'express';

/**
 * Techniques › Streaming files (#37). Every documented way to return a
 * `StreamableFile` (from a Buffer and from a real fs stream) and to control its
 * headers (constructor options, `@Header`, and `@Res({ passthrough: true })`).
 */
@Controller('streaming')
export class StreamingController {
  // Buffer body: default content type is application/octet-stream; StreamableFile
  // auto-fills the Content-Length from the buffer's byte length.
  @Get('octet')
  octet(): StreamableFile {
    return new StreamableFile(Buffer.from('hello stream'));
  }

  // Constructor options set Content-Type, Content-Disposition and Content-Length.
  @Get('json-options')
  jsonOptions(): StreamableFile {
    const buffer = Buffer.from(JSON.stringify({ ok: true, n: 42 }));
    return new StreamableFile(buffer, {
      type: 'application/json',
      disposition: 'attachment; filename="data.json"',
      length: buffer.byteLength,
    });
  }

  // Streams a real file off disk — mirrors the docs' createReadStream(package.json).
  @Get('file')
  file(): StreamableFile {
    const stream = createReadStream(join(process.cwd(), 'package.json'));
    return new StreamableFile(stream, { type: 'application/json' });
  }

  // @Header overrides the StreamableFile default content type.
  @Get('header')
  @Header('Content-Type', 'application/json')
  @Header('Content-Disposition', 'attachment; filename="h.json"')
  header(): StreamableFile {
    return new StreamableFile(Buffer.from(JSON.stringify({ via: 'header' })));
  }

  // @Res({ passthrough: true }) lets the handler set headers and still return the file.
  @Get('passthrough')
  passthrough(@Res({ passthrough: true }) res: Response): StreamableFile {
    res.set({
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="p.json"',
    });
    return new StreamableFile(
      Buffer.from(JSON.stringify({ via: 'passthrough' })),
    );
  }
}
