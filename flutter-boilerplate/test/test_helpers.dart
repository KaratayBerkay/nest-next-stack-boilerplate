import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/constants/theme.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

Widget createTestApp(Widget child) {
  return ProviderScope(
    child: MaterialApp(
      theme: buildThemeData(AppThemeMode.light),
      home: Scaffold(body: child),
    ),
  );
}

Future<void> pumpTestApp(WidgetTester tester, Widget child) async {
  await tester.pumpWidget(createTestApp(child));
  await tester.pump();
}
