import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../types/auth/oauth_types.dart';
import '../../server/auth/oauth.dart';

final oauthActionsProvider = Provider((ref) => OAuthActions(ref));

class OAuthActions {
  final Ref _ref;

  OAuthActions(this._ref);

  Future<OAuthProfile> getProfile(String provider, String state) {
    return _ref.read(oauthProfileServerProvider).call(provider, state);
  }

  Future<OAuthLoginResponse> loginWithOAuth(OAuthProfile profile) {
    return _ref.read(oauthLoginServerProvider).call(profile);
  }
}
