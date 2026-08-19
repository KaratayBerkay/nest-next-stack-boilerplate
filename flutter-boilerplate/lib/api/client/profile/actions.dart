import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../server/profile/update.dart';
import '../../server/profile/upload_avatar.dart';
import '../../server/profile/username_available.dart';

final profileActionsProvider = Provider((ref) => ProfileActions(ref));

class ProfileActions {
  final Ref _ref;

  ProfileActions(this._ref);

  Future<void> update({
    String? name,
    String? bio,
    String? username,
    String? avatarUrl,
    String? locale,
    String? timezone,
    String? chatNickname,
    bool? useNickname,
    bool? hideAvatar,
  }) async {
    final server = _ref.read(profileUpdateServerProvider);
    await server.call(
      name: name,
      bio: bio,
      username: username,
      avatarUrl: avatarUrl,
      locale: locale,
      timezone: timezone,
      chatNickname: chatNickname,
      useNickname: useNickname,
      hideAvatar: hideAvatar,
    );
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
