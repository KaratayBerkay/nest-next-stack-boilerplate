import 'package:flutter/material.dart';

class ProviderIcon extends StatelessWidget {
  final String provider;
  final double size;

  const ProviderIcon({
    super.key,
    required this.provider,
    this.size = 24,
  });

  @override
  Widget build(BuildContext context) {
    switch (provider.toLowerCase()) {
      case 'google':
        return Icon(Icons.g_mobiledata, size: size);
      case 'github':
        return Icon(Icons.code, size: size);
      case 'twitter':
      case 'x':
        return Icon(Icons.alternate_email, size: size);
      default:
        return Icon(Icons.login, size: size);
    }
  }
}
