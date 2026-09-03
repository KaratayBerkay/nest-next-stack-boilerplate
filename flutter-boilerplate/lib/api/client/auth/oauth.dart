import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../types/auth/oauth_types.dart';
import '../../server/auth/oauth.dart';

final oauthActionsProvider = Provider((ref) => OAuthActions(ref));

class OAuthActions {
  final Ref _ref;

  OAuthActions(this._ref);

  Future<OAuthLoginResponse> loginWithOAuth(
    String state, {
    required String claim,
    String? codeVerifier,
  }) {
    return _ref.read(oauthLoginServerProvider).call(
          state,
          claim: claim,
          codeVerifier: codeVerifier,
        );
  }
}
