import { Controller, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { DeviceService } from './device.service';

@Controller('devices')
export class DeviceController {
  constructor(private readonly devices: DeviceService) {}

  /**
   * Public handshake endpoint called on every page load (pre-auth).
   * Sets the device_token cookie if not present, or slides its expiry.
   */
  @Post('handshake')
  handshake(@Req() req: Request): { deviceToken: string } {
    return this.devices.handshake({ req });
  }
}
