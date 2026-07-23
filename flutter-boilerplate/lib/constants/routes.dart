class Routes {
  Routes._();

  static const home = '/';
  static const pricing = '/pricing';
  static const about = '/about';

  // Auth
  static const login = '/auth/login';
  static const register = '/auth/register';
  static const forgotPassword = '/auth/forgot-password';
  static const resetPassword = '/auth/reset-password';
  static const verifyEmail = '/auth/verify-email';

  // V1 (authenticated)
  static const v1 = '/v1';
  static const v1Home = '/v1/:lang';
  static const v1Feed = '/v1/:lang/feed';
  static const v1Messages = '/v1/:lang/messages';
  static const v1Notification = '/v1/:lang/notification';
  static const v1Posts = '/v1/:lang/posts';
  static const v1PostDetail = '/v1/:lang/posts/:uuid';
  static const v1FindFriends = '/v1/:lang/find-friends';
  static const v1FindFriendsRequests = '/v1/:lang/find-friends/requests';
  static const v1Plans = '/v1/:lang/plans';
  static const v1Premium = '/v1/:lang/premium';
  static const v1Checkout = '/v1/:lang/checkout/:tier';
  static const v1Share = '/v1/:lang/share';
  static const v1Settings = '/v1/:lang/settings';
  static const v1SettingsAccount = '/v1/:lang/settings/account';
  static const v1SettingsBilling = '/v1/:lang/settings/billing';
  static const v1SettingsGeneral = '/v1/:lang/settings/general';
  static const v1SettingsPrivacy = '/v1/:lang/settings/privacy';
  static const v1SettingsSessions = '/v1/:lang/settings/sessions';
  static const v1SettingsApiKeys = '/v1/:lang/settings/api-keys';
  static const v1Admin = '/v1/:lang/admin';
  static const v1AdminAuditLogs = '/v1/:lang/admin/audit-logs';
  static const v1Boom = '/v1/:lang/boom';
  static const v1UsersList = '/v1/:lang/users/list';
  static const v1UserDetail = '/v1/:lang/users/detail/:uuid';
  static const v1Ui = '/v1/:lang/ui';

  // Dashboard
  static const dashboard = '/dashboard';

  // Gallery
  static const gallery = '/gallery';

  // Demos
  static const demos = '/demos';

  // Routing demos
  static const routingSlug = '/routing/slug/:slug';
  static const routingItem = '/routing/item/:itemId';
  static const routingPost = '/routing/post/:postId';
}
