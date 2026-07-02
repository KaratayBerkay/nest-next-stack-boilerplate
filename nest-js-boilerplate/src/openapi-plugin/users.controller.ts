import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from './create-user.dto';

/**
 * The plugin also enriches controllers (docs.nestjs.com/openapi/cli-plugin#comments-introspection):
 * with `introspectComments`, the method's JSDoc summary becomes an `@ApiOperation({ summary })`, and
 * the plugin auto-adds a response decorator whose `type` is the method's return type.
 */
@Controller('users')
export class UsersPluginController {
  /**
   * Create a new user
   */
  @Post()
  create(@Body() dto: CreateUserDto): CreateUserDto {
    return dto;
  }
}
