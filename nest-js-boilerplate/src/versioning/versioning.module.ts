import { Module } from '@nestjs/common';
import { BirdsController } from './birds.controller';
import { CatsV1Controller } from './cats-v1.controller';
import { CatsV2Controller } from './cats-v2.controller';
import { DogsController } from './dogs.controller';
import { StatusController } from './status.controller';

// docs.nestjs.com/techniques/versioning — versioning is an HTTP-only, *application-level* feature:
// it is switched on with `app.enableVersioning({ type, ... })` at bootstrap, not per-module. The
// version TYPE (URI / Header / Media-Type / Custom) is chosen there; the version VALUE lives on the
// controllers/routes below via `@Controller({ version })` / `@Version()` / `VERSION_NEUTRAL`.
//
// This module is intentionally STANDALONE (not imported into AppModule): the main app never calls
// `enableVersioning`, and without it the version metadata is ignored — so CatsV1/CatsV2 (both path
// `cats`) and the two @Version handlers on `dogs` would collapse into duplicate, shadowing route
// mappings. (Enabling it globally instead would force every other un-versioned controller in the
// boilerplate to declare a version or 404.) The e2e spec proves the feature by spinning up isolated
// apps, one per versioning type, each calling `enableVersioning`.
@Module({
  controllers: [
    CatsV1Controller,
    CatsV2Controller,
    DogsController,
    BirdsController,
    StatusController,
  ],
})
export class VersioningModule {}
