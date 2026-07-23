import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/lib/cn.dart';
import 'package:flutter_test/flutter_test.dart';

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
      final shadows = [const BoxShadow()];
      expect(mergeShadows(shadows, null), shadows);
    });

    test('returns second when first is null', () {
      final shadows = [const BoxShadow()];
      expect(mergeShadows(null, shadows), shadows);
    });

    test('merges both lists', () {
      final a = <BoxShadow>[const BoxShadow(blurRadius: 1)];
      final b = <BoxShadow>[const BoxShadow(blurRadius: 2)];
      expect(mergeShadows(a, b).length, 2);
    });
  });

  group('mergePadding', () {
    test('returns zero for both null', () {
      expect(mergePadding(null, null), EdgeInsets.zero);
    });

    test('returns first when second is null', () {
      const padding = EdgeInsets.all(8);
      expect(mergePadding(padding, null), padding);
    });

    test('returns second when first is null', () {
      const padding = EdgeInsets.all(8);
      expect(mergePadding(null, padding), padding);
    });

    test('adds both paddings', () {
      const a = EdgeInsets.all(8);
      const b = EdgeInsets.all(4);
      final result = mergePadding(a, b) as EdgeInsets;
      expect(result.left, 12);
      expect(result.top, 12);
      expect(result.right, 12);
      expect(result.bottom, 12);
    });
  });
}
