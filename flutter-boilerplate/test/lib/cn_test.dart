import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:flutter_boilerplate/lib/cn.dart';

void main() {
  group('cn', () {
    test('returns empty string for both null', () {
      expect(cn(null, null), '');
    });

    test('returns first when second is null', () {
      expect(cn('a', null), 'a');
    });

    test('returns second when first is null', () {
      expect(cn(null, 'b'), 'b');
    });

    test('combines with space when both non-null', () {
      expect(cn('a', 'b'), 'a b');
    });

    test('combines multiple class names', () {
      expect(cn('btn', 'btn-primary'), 'btn btn-primary');
    });
  });

  group('mergeShadows', () {
    test('returns empty list for both null', () {
      expect(mergeShadows(null, null), <BoxShadow>[]);
    });

    test('returns first when second is null', () {
      final shadows = [BoxShadow()];
      expect(mergeShadows(shadows, null), shadows);
    });

    test('returns second when first is null', () {
      final shadows = [BoxShadow()];
      expect(mergeShadows(null, shadows), shadows);
    });

    test('merges both lists', () {
      final a = <BoxShadow>[BoxShadow(blurRadius: 1)];
      final b = <BoxShadow>[BoxShadow(blurRadius: 2)];
      expect(mergeShadows(a, b).length, 2);
    });
  });

  group('mergePadding', () {
    test('returns zero for both null', () {
      expect(mergePadding(null, null), EdgeInsets.zero);
    });

    test('returns first when second is null', () {
      final padding = const EdgeInsets.all(8);
      expect(mergePadding(padding, null), padding);
    });

    test('returns second when first is null', () {
      final padding = const EdgeInsets.all(8);
      expect(mergePadding(null, padding), padding);
    });

    test('adds both paddings', () {
      final a = const EdgeInsets.all(8);
      final b = const EdgeInsets.all(4);
      final result = mergePadding(a, b) as EdgeInsets;
      expect(result.left, 12);
      expect(result.top, 12);
      expect(result.right, 12);
      expect(result.bottom, 12);
    });
  });
}
