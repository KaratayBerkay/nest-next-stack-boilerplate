import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/lib/riverpod_compat.dart';

enum DeviceType { phone, tablet, desktop }

final deviceTypeProvider = StateProvider<DeviceType>((ref) => DeviceType.phone);

DeviceType useDeviceType(BuildContext context) {
  final width = MediaQuery.of(context).size.width;
  if (width > 900) return DeviceType.desktop;
  if (width >= 600) return DeviceType.tablet;
  return DeviceType.phone;
}
