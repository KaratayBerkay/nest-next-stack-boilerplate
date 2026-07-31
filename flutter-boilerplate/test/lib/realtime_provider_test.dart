import 'package:flutter_boilerplate/api/client/friends/query.dart';
import 'package:flutter_boilerplate/lib/realtime/realtime_provider.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

final _refProvider = Provider<Ref>((ref) => ref);

void main() {
  group('handleRenewFrame Friends', () {
    test('invalidates the accepted-friends list on Friends renew frames',
        () async {
      var fetches = 0;
      final container = ProviderContainer(
        overrides: [
          friendsListProvider.overrideWith((ref) async {
            fetches++;
            return [];
          }),
        ],
      );
      addTearDown(container.dispose);

      await container.read(friendsListProvider.future);
      expect(fetches, 1);

      handleRenewFrame(container.read(_refProvider), 'Friends', {
        'type': 'PendingList',
      });

      await container.read(friendsListProvider.future);
      expect(fetches, 2);
    });
  });
}
