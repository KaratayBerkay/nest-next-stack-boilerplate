import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../server/profile/update.dart';
import '../../server/profile/upload_avatar.dart';
import '../../server/profile/username_available.dart';

final profileActionsProvider = Provider((ref) => ProfileActions(ref));

class ProfileActions {
  final Ref _ref;

  ProfileActions(this._ref);

  Future<void> update({String? name, String? bio}) async {
    final server = _ref.read(profileUpdateServerProvider);
    await server.call(name: name, bio: bio);
  }

  Future<String> uploadAvatar(String filePath) async {
    final server = _ref.read(profileUploadAvatarServerProvider);
    return server.call(filePath);
  }

  Future<bool> checkUsername(String username) async {
    final server = _ref.read(usernameAvailableServerProvider);
    return server.call(username);
  }
}
