-- Add ip column to Device table for device-IP binding middleware
ALTER TABLE "Device" ADD COLUMN "ip" INET;
