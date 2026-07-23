import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:flutter_boilerplate/components/ui/input_group/input_group.dart';
import '../../test_helpers.dart';

void main() {
  testWidgets('InputGroup renders children', (tester) async {
    await pumpTestApp(
      tester,
      const SizedBox(
        width: 500,
        child: InputGroup(children: [
          Text('Input field'),
          Text('Suffix text'),
        ]),
      ),
    );

    expect(find.text('Input field'), findsOneWidget);
    expect(find.text('Suffix text'), findsOneWidget);
  });

  testWidgets('InputGroup renders label', (tester) async {
    await pumpTestApp(
      tester,
      const SizedBox(
        width: 500,
        child: InputGroup(
          label: 'Email',
          children: [Text('Input field')],
        ),
      ),
    );

    expect(find.text('Email'), findsOneWidget);
  });

  testWidgets('InputGroup renders prefix', (tester) async {
    await pumpTestApp(
      tester,
      const SizedBox(
        width: 500,
        child: InputGroup(
          prefix: Icon(Icons.search),
          children: [Text('Input field')],
        ),
      ),
    );

    expect(find.byIcon(Icons.search), findsOneWidget);
  });

  testWidgets('InputGroup renders suffix', (tester) async {
    await pumpTestApp(
      tester,
      const SizedBox(
        width: 500,
        child: InputGroup(
          suffix: Icon(Icons.clear),
          children: [Text('Input field')],
        ),
      ),
    );

    expect(find.byIcon(Icons.clear), findsOneWidget);
  });

  testWidgets('InputGroup renders in vertical direction', (tester) async {
    await pumpTestApp(
      tester,
      const SizedBox(
        width: 500,
        child: InputGroup(
          direction: Axis.vertical,
          label: 'Bio',
          children: [Text('Input field'), Text('Optional')],
        ),
      ),
    );

    expect(find.text('Bio'), findsOneWidget);
  });
}
