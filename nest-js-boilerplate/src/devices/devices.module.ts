import { Module } from '@nestjs/common';
import { DeviceController } from './device.controller';
import { DeviceIpMiddleware } from './device-ip-middleware';
import { DeviceService } from './device.service';

@Module({
  controllers: [DeviceController],
  providers: [DeviceService, DeviceIpMiddleware],
  exports: [DeviceService, DeviceIpMiddleware],
})
export class DevicesModule {}
