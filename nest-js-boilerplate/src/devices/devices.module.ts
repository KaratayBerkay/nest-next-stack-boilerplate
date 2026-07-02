import { Module } from '@nestjs/common';
import { DeviceIpMiddleware } from './device-ip-middleware';
import { DeviceService } from './device.service';

@Module({
  providers: [DeviceService, DeviceIpMiddleware],
  exports: [DeviceService, DeviceIpMiddleware],
})
export class DevicesModule {}
