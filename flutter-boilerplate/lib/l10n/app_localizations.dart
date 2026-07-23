import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_en.dart';
import 'app_localizations_tr.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
      : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations? of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations);
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
    delegate,
    GlobalMaterialLocalizations.delegate,
    GlobalCupertinoLocalizations.delegate,
    GlobalWidgetsLocalizations.delegate,
  ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('en'),
    Locale('tr')
  ];

  /// No description provided for @appName.
  ///
  /// In en, this message translates to:
  /// **'Flutter Boilerplate'**
  String get appName;

  /// No description provided for @loading.
  ///
  /// In en, this message translates to:
  /// **'Loading...'**
  String get loading;

  /// No description provided for @error.
  ///
  /// In en, this message translates to:
  /// **'Error'**
  String get error;

  /// No description provided for @retry.
  ///
  /// In en, this message translates to:
  /// **'Retry'**
  String get retry;

  /// No description provided for @cancel.
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get cancel;

  /// No description provided for @save.
  ///
  /// In en, this message translates to:
  /// **'Save'**
  String get save;

  /// No description provided for @delete.
  ///
  /// In en, this message translates to:
  /// **'Delete'**
  String get delete;

  /// No description provided for @confirm.
  ///
  /// In en, this message translates to:
  /// **'Confirm'**
  String get confirm;

  /// No description provided for @search.
  ///
  /// In en, this message translates to:
  /// **'Search'**
  String get search;

  /// No description provided for @submit.
  ///
  /// In en, this message translates to:
  /// **'Submit'**
  String get submit;

  /// No description provided for @back.
  ///
  /// In en, this message translates to:
  /// **'Back'**
  String get back;

  /// No description provided for @next.
  ///
  /// In en, this message translates to:
  /// **'Next'**
  String get next;

  /// No description provided for @done.
  ///
  /// In en, this message translates to:
  /// **'Done'**
  String get done;

  /// No description provided for @close.
  ///
  /// In en, this message translates to:
  /// **'Close'**
  String get close;

  /// No description provided for @goHome.
  ///
  /// In en, this message translates to:
  /// **'Go Home'**
  String get goHome;

  /// No description provided for @pageNotFound.
  ///
  /// In en, this message translates to:
  /// **'Page not found'**
  String get pageNotFound;

  /// No description provided for @resourceNotFound.
  ///
  /// In en, this message translates to:
  /// **'This resource could not be found.'**
  String get resourceNotFound;

  /// No description provided for @noResults.
  ///
  /// In en, this message translates to:
  /// **'No results found.'**
  String get noResults;

  /// No description provided for @upgradeToAccess.
  ///
  /// In en, this message translates to:
  /// **'Upgrade to access this feature'**
  String get upgradeToAccess;

  /// No description provided for @authLogin.
  ///
  /// In en, this message translates to:
  /// **'Log In'**
  String get authLogin;

  /// No description provided for @authRegister.
  ///
  /// In en, this message translates to:
  /// **'Sign Up'**
  String get authRegister;

  /// No description provided for @authLogout.
  ///
  /// In en, this message translates to:
  /// **'Sign Out'**
  String get authLogout;

  /// No description provided for @authEmail.
  ///
  /// In en, this message translates to:
  /// **'Email'**
  String get authEmail;

  /// No description provided for @authPassword.
  ///
  /// In en, this message translates to:
  /// **'Password'**
  String get authPassword;

  /// No description provided for @authName.
  ///
  /// In en, this message translates to:
  /// **'Name'**
  String get authName;

  /// No description provided for @authForgotPassword.
  ///
  /// In en, this message translates to:
  /// **'Forgot Password?'**
  String get authForgotPassword;

  /// No description provided for @authResetPassword.
  ///
  /// In en, this message translates to:
  /// **'Reset Password'**
  String get authResetPassword;

  /// No description provided for @authVerifyEmail.
  ///
  /// In en, this message translates to:
  /// **'Verify Email'**
  String get authVerifyEmail;

  /// No description provided for @authMfa.
  ///
  /// In en, this message translates to:
  /// **'Two-Factor Authentication'**
  String get authMfa;

  /// No description provided for @authMfaCode.
  ///
  /// In en, this message translates to:
  /// **'Authentication Code'**
  String get authMfaCode;

  /// No description provided for @navHome.
  ///
  /// In en, this message translates to:
  /// **'Home'**
  String get navHome;

  /// No description provided for @navFeed.
  ///
  /// In en, this message translates to:
  /// **'Feed'**
  String get navFeed;

  /// No description provided for @navMessages.
  ///
  /// In en, this message translates to:
  /// **'Messages'**
  String get navMessages;

  /// No description provided for @navNotifications.
  ///
  /// In en, this message translates to:
  /// **'Notifications'**
  String get navNotifications;

  /// No description provided for @navSettings.
  ///
  /// In en, this message translates to:
  /// **'Settings'**
  String get navSettings;

  /// No description provided for @navAdmin.
  ///
  /// In en, this message translates to:
  /// **'Admin'**
  String get navAdmin;

  /// No description provided for @navPlans.
  ///
  /// In en, this message translates to:
  /// **'Plans'**
  String get navPlans;

  /// No description provided for @navPremium.
  ///
  /// In en, this message translates to:
  /// **'Premium'**
  String get navPremium;

  /// No description provided for @navFindFriends.
  ///
  /// In en, this message translates to:
  /// **'Find Friends'**
  String get navFindFriends;

  /// No description provided for @navShare.
  ///
  /// In en, this message translates to:
  /// **'Share'**
  String get navShare;

  /// No description provided for @navUsers.
  ///
  /// In en, this message translates to:
  /// **'Users'**
  String get navUsers;

  /// No description provided for @navForms.
  ///
  /// In en, this message translates to:
  /// **'Forms'**
  String get navForms;

  /// No description provided for @navAbout.
  ///
  /// In en, this message translates to:
  /// **'About'**
  String get navAbout;

  /// No description provided for @navPricing.
  ///
  /// In en, this message translates to:
  /// **'Pricing'**
  String get navPricing;

  /// No description provided for @feedTitle.
  ///
  /// In en, this message translates to:
  /// **'Feed'**
  String get feedTitle;

  /// No description provided for @feedNoPosts.
  ///
  /// In en, this message translates to:
  /// **'No posts yet'**
  String get feedNoPosts;

  /// No description provided for @feedShare.
  ///
  /// In en, this message translates to:
  /// **'Share'**
  String get feedShare;

  /// No description provided for @feedSearchPlaceholder.
  ///
  /// In en, this message translates to:
  /// **'Search posts...'**
  String get feedSearchPlaceholder;

  /// No description provided for @feedNewPosts.
  ///
  /// In en, this message translates to:
  /// **'New posts available — tap to load'**
  String get feedNewPosts;

  /// No description provided for @feedAllCaughtUp.
  ///
  /// In en, this message translates to:
  /// **'All caught up'**
  String get feedAllCaughtUp;

  /// No description provided for @messagesTitle.
  ///
  /// In en, this message translates to:
  /// **'Messages'**
  String get messagesTitle;

  /// No description provided for @messagesNoConversations.
  ///
  /// In en, this message translates to:
  /// **'No conversations'**
  String get messagesNoConversations;

  /// No description provided for @messagesSearchPlaceholder.
  ///
  /// In en, this message translates to:
  /// **'Search conversations...'**
  String get messagesSearchPlaceholder;

  /// No description provided for @messagesTypePlaceholder.
  ///
  /// In en, this message translates to:
  /// **'Type a message...'**
  String get messagesTypePlaceholder;

  /// No description provided for @messagesChat.
  ///
  /// In en, this message translates to:
  /// **'Chat Room'**
  String get messagesChat;

  /// No description provided for @messagesUpgradeToChat.
  ///
  /// In en, this message translates to:
  /// **'Upgrade to use chat'**
  String get messagesUpgradeToChat;

  /// No description provided for @settingsTitle.
  ///
  /// In en, this message translates to:
  /// **'Settings'**
  String get settingsTitle;

  /// No description provided for @settingsAccount.
  ///
  /// In en, this message translates to:
  /// **'Account'**
  String get settingsAccount;

  /// No description provided for @settingsBilling.
  ///
  /// In en, this message translates to:
  /// **'Billing'**
  String get settingsBilling;

  /// No description provided for @settingsGeneral.
  ///
  /// In en, this message translates to:
  /// **'General'**
  String get settingsGeneral;

  /// No description provided for @settingsPrivacy.
  ///
  /// In en, this message translates to:
  /// **'Privacy'**
  String get settingsPrivacy;

  /// No description provided for @settingsSessions.
  ///
  /// In en, this message translates to:
  /// **'Sessions'**
  String get settingsSessions;

  /// No description provided for @settingsApiKeys.
  ///
  /// In en, this message translates to:
  /// **'API Keys'**
  String get settingsApiKeys;

  /// No description provided for @adminTitle.
  ///
  /// In en, this message translates to:
  /// **'Admin'**
  String get adminTitle;

  /// No description provided for @adminSearchPlaceholder.
  ///
  /// In en, this message translates to:
  /// **'Search users by name or email...'**
  String get adminSearchPlaceholder;

  /// No description provided for @adminSearching.
  ///
  /// In en, this message translates to:
  /// **'Searching...'**
  String get adminSearching;

  /// No description provided for @adminAuditLogs.
  ///
  /// In en, this message translates to:
  /// **'Audit Logs'**
  String get adminAuditLogs;

  /// No description provided for @premiumTitle.
  ///
  /// In en, this message translates to:
  /// **'Premium'**
  String get premiumTitle;

  /// No description provided for @premiumUpgrade.
  ///
  /// In en, this message translates to:
  /// **'Upgrade to Premium to access analytics'**
  String get premiumUpgrade;

  /// No description provided for @premiumStats.
  ///
  /// In en, this message translates to:
  /// **'Statistics'**
  String get premiumStats;

  /// No description provided for @premiumGrowth.
  ///
  /// In en, this message translates to:
  /// **'Growth'**
  String get premiumGrowth;

  /// No description provided for @premiumExport.
  ///
  /// In en, this message translates to:
  /// **'Export CSV'**
  String get premiumExport;

  /// No description provided for @formsTitle.
  ///
  /// In en, this message translates to:
  /// **'Forms'**
  String get formsTitle;

  /// No description provided for @formsAdvanced.
  ///
  /// In en, this message translates to:
  /// **'Advanced'**
  String get formsAdvanced;

  /// No description provided for @formsApiKey.
  ///
  /// In en, this message translates to:
  /// **'API Key'**
  String get formsApiKey;

  /// No description provided for @formsBilling.
  ///
  /// In en, this message translates to:
  /// **'Billing'**
  String get formsBilling;

  /// No description provided for @formsCheckout.
  ///
  /// In en, this message translates to:
  /// **'Checkout'**
  String get formsCheckout;

  /// No description provided for @formsContentEditor.
  ///
  /// In en, this message translates to:
  /// **'Content Editor'**
  String get formsContentEditor;

  /// No description provided for @formsEditableTable.
  ///
  /// In en, this message translates to:
  /// **'Editable Table'**
  String get formsEditableTable;

  /// No description provided for @formsElements.
  ///
  /// In en, this message translates to:
  /// **'Elements'**
  String get formsElements;

  /// No description provided for @formsErrorLab.
  ///
  /// In en, this message translates to:
  /// **'Error Lab'**
  String get formsErrorLab;

  /// No description provided for @formsFieldStates.
  ///
  /// In en, this message translates to:
  /// **'Field States'**
  String get formsFieldStates;

  /// No description provided for @formsFilters.
  ///
  /// In en, this message translates to:
  /// **'Filters'**
  String get formsFilters;

  /// No description provided for @formsFormBuilder.
  ///
  /// In en, this message translates to:
  /// **'Form Builder'**
  String get formsFormBuilder;

  /// No description provided for @formsLayouts.
  ///
  /// In en, this message translates to:
  /// **'Layouts'**
  String get formsLayouts;

  /// No description provided for @formsProfile.
  ///
  /// In en, this message translates to:
  /// **'Profile'**
  String get formsProfile;

  /// No description provided for @formsTeamInvite.
  ///
  /// In en, this message translates to:
  /// **'Team Invite'**
  String get formsTeamInvite;

  /// No description provided for @formsUploads.
  ///
  /// In en, this message translates to:
  /// **'Uploads'**
  String get formsUploads;

  /// No description provided for @notificationsTitle.
  ///
  /// In en, this message translates to:
  /// **'Notifications'**
  String get notificationsTitle;

  /// No description provided for @notificationsEmpty.
  ///
  /// In en, this message translates to:
  /// **'No notifications'**
  String get notificationsEmpty;

  /// No description provided for @notificationsMarkAllRead.
  ///
  /// In en, this message translates to:
  /// **'Mark all as read'**
  String get notificationsMarkAllRead;

  /// No description provided for @usersFindFriends.
  ///
  /// In en, this message translates to:
  /// **'Find Friends'**
  String get usersFindFriends;

  /// No description provided for @usersMutualFriends.
  ///
  /// In en, this message translates to:
  /// **'{count} mutual friends'**
  String usersMutualFriends(Object count);

  /// No description provided for @usersAddFriend.
  ///
  /// In en, this message translates to:
  /// **'Add Friend'**
  String get usersAddFriend;

  /// No description provided for @usersPendingRequests.
  ///
  /// In en, this message translates to:
  /// **'Pending Requests'**
  String get usersPendingRequests;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['en', 'tr'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'en':
      return AppLocalizationsEn();
    case 'tr':
      return AppLocalizationsTr();
  }

  throw FlutterError(
      'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
      'an issue with the localizations generation tool. Please file an issue '
      'on GitHub with a reproducible sample app and the gen-l10n configuration '
      'that was used.');
}
