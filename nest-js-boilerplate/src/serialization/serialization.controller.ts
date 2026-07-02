import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Query,
  SerializeOptions,
  UseInterceptors,
} from '@nestjs/common';
import { RoleEntity } from './role.entity';
import { SettingsEntity } from './settings.entity';
import { UserEntity } from './user.entity';

// docs.nestjs.com/techniques/serialization — every route here is wrapped by the
// ClassSerializerInterceptor (bound once at controller scope; it can also be applied app-wide via
// APP_INTERCEPTOR — see interceptors.module.ts). The interceptor runs `instanceToPlain` on each
// returned value, applying the class-transformer decorators declared on the returned entity.
@Controller('serialization')
@UseInterceptors(ClassSerializerInterceptor)
export class SerializationController {
  // @Exclude (password dropped) + @Expose (fullName added) + @Transform (role -> name).
  // We must return a real class instance for the decorators to apply.
  @Get('user')
  findOne(): UserEntity {
    return new UserEntity({
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      password: 'password',
      role: new RoleEntity({ id: 1, name: 'admin' }),
    });
  }

  // @SerializeOptions({ excludePrefixes }) — drop any property beginning with `_`.
  @Get('prefixed')
  @SerializeOptions({ excludePrefixes: ['_'] })
  prefixed(): SettingsEntity {
    return new SettingsEntity({ theme: 'dark', _internalId: 'secret' });
  }

  // @SerializeOptions({ type }) — return a *plain* object and let the interceptor coerce it into a
  // UserEntity instance first, so the decorators still apply (password excluded, role transformed,
  // fullName computed). Under strict TS we cast the literal to UserEntity: the type carries the
  // `fullName` getter and a `RoleEntity` `role`, which a bare object literal can't satisfy.
  @Get('plain')
  @SerializeOptions({ type: UserEntity })
  plain(@Query('id') id: string): UserEntity {
    if (id === '1') {
      return {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        password: 'password',
        role: { id: 1, name: 'admin' },
      } as unknown as UserEntity;
    }

    return {
      id: 2,
      firstName: 'Kamil',
      lastName: 'Mysliwiec',
      password: 'password2',
      role: { id: 2, name: 'user' },
    } as unknown as UserEntity;
  }
}
