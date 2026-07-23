import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/lib/riverpod_compat.dart';

class Breakpoint {
  final double width;
  Breakpoint._(this.width);

  bool get isXs => width < 640;
  bool get isSm => width >= 640 && width < 768;
  bool get isMd => width >= 768 && width < 1024;
  bool get isLg => width >= 1024 && width < 1280;
  bool get isXl => width >= 1280;

  bool get isMobile => width < 768;
  bool get isDesktop => width >= 768;
}

final breakpointProvider = Provider<Breakpoint>((ref) {
  throw UnimplementedError('Use BreakpointBuilder or MediaQuery directly in widgets');
});

Breakpoint useBreakpoint(BuildContext context) {
  return Breakpoint._(MediaQuery.of(context).size.width);
}
