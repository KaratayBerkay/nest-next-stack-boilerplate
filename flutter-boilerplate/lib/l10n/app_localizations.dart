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

  /// No description provided for @accordionTitle.
  ///
  /// In en, this message translates to:
  /// **'Accordion'**
  String get accordionTitle;

  /// No description provided for @accordionIntro.
  ///
  /// In en, this message translates to:
  /// **'A vertically stacked set of interactive headings with expandable content.'**
  String get accordionIntro;

  /// No description provided for @accordionSingleState.
  ///
  /// In en, this message translates to:
  /// **'Single State Accordion'**
  String get accordionSingleState;

  /// No description provided for @accordionSingleStateDesc.
  ///
  /// In en, this message translates to:
  /// **'When a new accordion opens, the other open one closes.'**
  String get accordionSingleStateDesc;

  /// No description provided for @accordionMultiState.
  ///
  /// In en, this message translates to:
  /// **'Multi State Accordion'**
  String get accordionMultiState;

  /// No description provided for @accordionMultiStateDesc.
  ///
  /// In en, this message translates to:
  /// **'When a new accordion opens, the other open ones don\'t close.'**
  String get accordionMultiStateDesc;

  /// No description provided for @accordionRichItems.
  ///
  /// In en, this message translates to:
  /// **'Rich Items'**
  String get accordionRichItems;

  /// No description provided for @accordionRichItemsDesc.
  ///
  /// In en, this message translates to:
  /// **'AccordionItemComplex with flexible slots for avatars, badges, and rich content.'**
  String get accordionRichItemsDesc;

  /// No description provided for @accordionDefault.
  ///
  /// In en, this message translates to:
  /// **'Default'**
  String get accordionDefault;

  /// No description provided for @accordionMultipleOpen.
  ///
  /// In en, this message translates to:
  /// **'Multiple Open'**
  String get accordionMultipleOpen;

  /// No description provided for @accordionFaqWithIcons.
  ///
  /// In en, this message translates to:
  /// **'FAQ with Icons'**
  String get accordionFaqWithIcons;

  /// No description provided for @accordionUserProfiles.
  ///
  /// In en, this message translates to:
  /// **'User Profiles'**
  String get accordionUserProfiles;

  /// No description provided for @accordionAccessibleQ.
  ///
  /// In en, this message translates to:
  /// **'Is it accessible?'**
  String get accordionAccessibleQ;

  /// No description provided for @accordionAccessibleA.
  ///
  /// In en, this message translates to:
  /// **'Yes. It adheres to WAI-ARIA standards and is fully keyboard navigable.'**
  String get accordionAccessibleA;

  /// No description provided for @accordionStyledQ.
  ///
  /// In en, this message translates to:
  /// **'Is it styled?'**
  String get accordionStyledQ;

  /// No description provided for @accordionStyledA.
  ///
  /// In en, this message translates to:
  /// **'Yes. It comes with default styles that integrate seamlessly with your design system.'**
  String get accordionStyledA;

  /// No description provided for @accordionAnimatedQ.
  ///
  /// In en, this message translates to:
  /// **'Is it animated?'**
  String get accordionAnimatedQ;

  /// No description provided for @accordionAnimatedA.
  ///
  /// In en, this message translates to:
  /// **'Yes. It features smooth expand/collapse animations with cubic-bezier easing.'**
  String get accordionAnimatedA;

  /// No description provided for @accordionFaq1Title.
  ///
  /// In en, this message translates to:
  /// **'What is this component?'**
  String get accordionFaq1Title;

  /// No description provided for @accordionFaq1Desc.
  ///
  /// In en, this message translates to:
  /// **'Learn about our accordion system'**
  String get accordionFaq1Desc;

  /// No description provided for @accordionFaq1Content1.
  ///
  /// In en, this message translates to:
  /// **'An accordion component that organizes content into expandable sections.'**
  String get accordionFaq1Content1;

  /// No description provided for @accordionFaq1Content2.
  ///
  /// In en, this message translates to:
  /// **'Click on any trigger to reveal the associated content panel.'**
  String get accordionFaq1Content2;

  /// No description provided for @accordionFaq2Title.
  ///
  /// In en, this message translates to:
  /// **'How do I customize it?'**
  String get accordionFaq2Title;

  /// No description provided for @accordionFaq2Desc.
  ///
  /// In en, this message translates to:
  /// **'Theme and variant options'**
  String get accordionFaq2Desc;

  /// No description provided for @accordionFaq2Content1.
  ///
  /// In en, this message translates to:
  /// **'Use the global theme switcher in the navbar to change the accordion variant.'**
  String get accordionFaq2Content1;

  /// No description provided for @accordionFaq2Content2.
  ///
  /// In en, this message translates to:
  /// **'All accordion components will update automatically to match the selected theme.'**
  String get accordionFaq2Content2;

  /// No description provided for @accordionFaq3Title.
  ///
  /// In en, this message translates to:
  /// **'Can I use it with multiple sections open?'**
  String get accordionFaq3Title;

  /// No description provided for @accordionFaq3Desc.
  ///
  /// In en, this message translates to:
  /// **'Single vs multiple expand modes'**
  String get accordionFaq3Desc;

  /// No description provided for @accordionFaq3Content1.
  ///
  /// In en, this message translates to:
  /// **'Yes, set the type prop to \"multiple\" on the Accordion to allow multiple items open simultaneously.'**
  String get accordionFaq3Content1;

  /// No description provided for @accordionFaq3Content2.
  ///
  /// In en, this message translates to:
  /// **'For single-expand behavior, use type=\"single\" with the collapsible prop.'**
  String get accordionFaq3Content2;

  /// No description provided for @accordionCategoryGeneral.
  ///
  /// In en, this message translates to:
  /// **'General'**
  String get accordionCategoryGeneral;

  /// No description provided for @accordionCategoryCustomization.
  ///
  /// In en, this message translates to:
  /// **'Customization'**
  String get accordionCategoryCustomization;

  /// No description provided for @accordionCategoryBehavior.
  ///
  /// In en, this message translates to:
  /// **'Behavior'**
  String get accordionCategoryBehavior;

  /// No description provided for @accordionSarahName.
  ///
  /// In en, this message translates to:
  /// **'Sarah Johnson'**
  String get accordionSarahName;

  /// No description provided for @accordionSarahRole.
  ///
  /// In en, this message translates to:
  /// **'Product Designer'**
  String get accordionSarahRole;

  /// No description provided for @accordionSarahBio.
  ///
  /// In en, this message translates to:
  /// **'Sarah is a product designer with 5+ years of experience in creating user-centered digital experiences.'**
  String get accordionSarahBio;

  /// No description provided for @accordionMikeName.
  ///
  /// In en, this message translates to:
  /// **'Mike Chen'**
  String get accordionMikeName;

  /// No description provided for @accordionMikeRole.
  ///
  /// In en, this message translates to:
  /// **'Senior Engineer'**
  String get accordionMikeRole;

  /// No description provided for @accordionMikeBio.
  ///
  /// In en, this message translates to:
  /// **'Mike is a full-stack engineer specializing in React, Node.js, and cloud infrastructure.'**
  String get accordionMikeBio;

  /// No description provided for @accordionStatusActive.
  ///
  /// In en, this message translates to:
  /// **'Active'**
  String get accordionStatusActive;

  /// No description provided for @accordionSkillFigma.
  ///
  /// In en, this message translates to:
  /// **'Figma'**
  String get accordionSkillFigma;

  /// No description provided for @accordionSkillPrototyping.
  ///
  /// In en, this message translates to:
  /// **'Prototyping'**
  String get accordionSkillPrototyping;

  /// No description provided for @accordionSkillUserResearch.
  ///
  /// In en, this message translates to:
  /// **'User Research'**
  String get accordionSkillUserResearch;

  /// No description provided for @accordionSkillReact.
  ///
  /// In en, this message translates to:
  /// **'React'**
  String get accordionSkillReact;

  /// No description provided for @accordionSkillTypeScript.
  ///
  /// In en, this message translates to:
  /// **'TypeScript'**
  String get accordionSkillTypeScript;

  /// No description provided for @accordionSkillAWS.
  ///
  /// In en, this message translates to:
  /// **'AWS'**
  String get accordionSkillAWS;

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

  /// No description provided for @adminNoUsersFound.
  ///
  /// In en, this message translates to:
  /// **'No users found'**
  String get adminNoUsersFound;

  /// No description provided for @adminAuditLogTitle.
  ///
  /// In en, this message translates to:
  /// **'Audit Log'**
  String get adminAuditLogTitle;

  /// No description provided for @adminAllActions.
  ///
  /// In en, this message translates to:
  /// **'All actions'**
  String get adminAllActions;

  /// No description provided for @adminAllLevels.
  ///
  /// In en, this message translates to:
  /// **'All levels'**
  String get adminAllLevels;

  /// No description provided for @adminEntityType.
  ///
  /// In en, this message translates to:
  /// **'Entity type...'**
  String get adminEntityType;

  /// No description provided for @adminLoading.
  ///
  /// In en, this message translates to:
  /// **'Loading...'**
  String get adminLoading;

  /// No description provided for @adminNoEntriesFound.
  ///
  /// In en, this message translates to:
  /// **'No audit log entries found.'**
  String get adminNoEntriesFound;

  /// No description provided for @adminTime.
  ///
  /// In en, this message translates to:
  /// **'Time'**
  String get adminTime;

  /// No description provided for @adminAction.
  ///
  /// In en, this message translates to:
  /// **'Action'**
  String get adminAction;

  /// No description provided for @adminLevel.
  ///
  /// In en, this message translates to:
  /// **'Level'**
  String get adminLevel;

  /// No description provided for @adminActor.
  ///
  /// In en, this message translates to:
  /// **'Actor'**
  String get adminActor;

  /// No description provided for @adminEntity.
  ///
  /// In en, this message translates to:
  /// **'Entity'**
  String get adminEntity;

  /// No description provided for @adminSummary.
  ///
  /// In en, this message translates to:
  /// **'Summary'**
  String get adminSummary;

  /// No description provided for @adminIp.
  ///
  /// In en, this message translates to:
  /// **'IP'**
  String get adminIp;

  /// No description provided for @adminHide.
  ///
  /// In en, this message translates to:
  /// **'Hide'**
  String get adminHide;

  /// No description provided for @adminDiff.
  ///
  /// In en, this message translates to:
  /// **'Diff'**
  String get adminDiff;

  /// No description provided for @adminTotalEntries.
  ///
  /// In en, this message translates to:
  /// **'{total} total entries'**
  String adminTotalEntries(Object total);

  /// No description provided for @adminPrev.
  ///
  /// In en, this message translates to:
  /// **'Prev'**
  String get adminPrev;

  /// No description provided for @adminPageOf.
  ///
  /// In en, this message translates to:
  /// **'Page {page} of {totalPages}'**
  String adminPageOf(Object page, Object totalPages);

  /// No description provided for @adminNext.
  ///
  /// In en, this message translates to:
  /// **'Next'**
  String get adminNext;

  /// No description provided for @adminChangeDetails.
  ///
  /// In en, this message translates to:
  /// **'Change Details'**
  String get adminChangeDetails;

  /// No description provided for @adminBefore.
  ///
  /// In en, this message translates to:
  /// **'Before'**
  String get adminBefore;

  /// No description provided for @adminAfter.
  ///
  /// In en, this message translates to:
  /// **'After'**
  String get adminAfter;

  /// No description provided for @adminSystem.
  ///
  /// In en, this message translates to:
  /// **'system'**
  String get adminSystem;

  /// No description provided for @adminAccessDenied.
  ///
  /// In en, this message translates to:
  /// **'You do not have admin access.'**
  String get adminAccessDenied;

  /// No description provided for @apiKeysErrorsNameExists.
  ///
  /// In en, this message translates to:
  /// **'An API key with this name already exists'**
  String get apiKeysErrorsNameExists;

  /// No description provided for @authFormLoginTitle.
  ///
  /// In en, this message translates to:
  /// **'Sign In'**
  String get authFormLoginTitle;

  /// No description provided for @authFormLoginHeading.
  ///
  /// In en, this message translates to:
  /// **'Sign in to your account'**
  String get authFormLoginHeading;

  /// No description provided for @authFormLoginEmailLabel.
  ///
  /// In en, this message translates to:
  /// **'Email address'**
  String get authFormLoginEmailLabel;

  /// No description provided for @authFormLoginEmailPlaceholder.
  ///
  /// In en, this message translates to:
  /// **'you@example.com'**
  String get authFormLoginEmailPlaceholder;

  /// No description provided for @authFormLoginPasswordLabel.
  ///
  /// In en, this message translates to:
  /// **'Password'**
  String get authFormLoginPasswordLabel;

  /// No description provided for @authFormLoginPasswordPlaceholder.
  ///
  /// In en, this message translates to:
  /// **'Enter your password'**
  String get authFormLoginPasswordPlaceholder;

  /// No description provided for @authFormLoginRememberMe.
  ///
  /// In en, this message translates to:
  /// **'Remember me'**
  String get authFormLoginRememberMe;

  /// No description provided for @authFormLoginForgotPassword.
  ///
  /// In en, this message translates to:
  /// **'Forgot password?'**
  String get authFormLoginForgotPassword;

  /// No description provided for @authFormLoginSubmit.
  ///
  /// In en, this message translates to:
  /// **'Sign In'**
  String get authFormLoginSubmit;

  /// No description provided for @authFormLoginSubmitting.
  ///
  /// In en, this message translates to:
  /// **'Signing in...'**
  String get authFormLoginSubmitting;

  /// No description provided for @authFormLoginNoAccount.
  ///
  /// In en, this message translates to:
  /// **'Don\'t have an account?'**
  String get authFormLoginNoAccount;

  /// No description provided for @authFormLoginRegisterLink.
  ///
  /// In en, this message translates to:
  /// **'Sign up'**
  String get authFormLoginRegisterLink;

  /// No description provided for @authFormLoginMfaTitle.
  ///
  /// In en, this message translates to:
  /// **'Two-Factor Authentication'**
  String get authFormLoginMfaTitle;

  /// No description provided for @authFormLoginMfaCodeLabel.
  ///
  /// In en, this message translates to:
  /// **'Authentication code'**
  String get authFormLoginMfaCodeLabel;

  /// No description provided for @authFormLoginMfaVerify.
  ///
  /// In en, this message translates to:
  /// **'Verify'**
  String get authFormLoginMfaVerify;

  /// No description provided for @authFormLoginMfaVerifying.
  ///
  /// In en, this message translates to:
  /// **'Verifying...'**
  String get authFormLoginMfaVerifying;

  /// No description provided for @authFormRegisterTitle.
  ///
  /// In en, this message translates to:
  /// **'Create your account'**
  String get authFormRegisterTitle;

  /// No description provided for @authFormRegisterHeading.
  ///
  /// In en, this message translates to:
  /// **'Create your account'**
  String get authFormRegisterHeading;

  /// No description provided for @authFormRegisterSubheading.
  ///
  /// In en, this message translates to:
  /// **'Fill in your details to get started.'**
  String get authFormRegisterSubheading;

  /// No description provided for @authFormRegisterNameLabel.
  ///
  /// In en, this message translates to:
  /// **'Name'**
  String get authFormRegisterNameLabel;

  /// No description provided for @authFormRegisterNamePlaceholder.
  ///
  /// In en, this message translates to:
  /// **'John Doe'**
  String get authFormRegisterNamePlaceholder;

  /// No description provided for @authFormRegisterFirstNameLabel.
  ///
  /// In en, this message translates to:
  /// **'First name'**
  String get authFormRegisterFirstNameLabel;

  /// No description provided for @authFormRegisterFirstNamePlaceholder.
  ///
  /// In en, this message translates to:
  /// **'John'**
  String get authFormRegisterFirstNamePlaceholder;

  /// No description provided for @authFormRegisterLastNameLabel.
  ///
  /// In en, this message translates to:
  /// **'Last name'**
  String get authFormRegisterLastNameLabel;

  /// No description provided for @authFormRegisterLastNamePlaceholder.
  ///
  /// In en, this message translates to:
  /// **'Doe'**
  String get authFormRegisterLastNamePlaceholder;

  /// No description provided for @authFormRegisterEmailLabel.
  ///
  /// In en, this message translates to:
  /// **'Email address'**
  String get authFormRegisterEmailLabel;

  /// No description provided for @authFormRegisterEmailPlaceholder.
  ///
  /// In en, this message translates to:
  /// **'you@example.com'**
  String get authFormRegisterEmailPlaceholder;

  /// No description provided for @authFormRegisterPasswordLabel.
  ///
  /// In en, this message translates to:
  /// **'Password'**
  String get authFormRegisterPasswordLabel;

  /// No description provided for @authFormRegisterPasswordPlaceholder.
  ///
  /// In en, this message translates to:
  /// **'At least 8 characters'**
  String get authFormRegisterPasswordPlaceholder;

  /// No description provided for @authFormRegisterConfirmPasswordLabel.
  ///
  /// In en, this message translates to:
  /// **'Confirm password'**
  String get authFormRegisterConfirmPasswordLabel;

  /// No description provided for @authFormRegisterConfirmPasswordPlaceholder.
  ///
  /// In en, this message translates to:
  /// **'Re-enter your password'**
  String get authFormRegisterConfirmPasswordPlaceholder;

  /// No description provided for @authFormRegisterSubmit.
  ///
  /// In en, this message translates to:
  /// **'Create account'**
  String get authFormRegisterSubmit;

  /// No description provided for @authFormRegisterSubmitting.
  ///
  /// In en, this message translates to:
  /// **'Creating account...'**
  String get authFormRegisterSubmitting;

  /// No description provided for @authFormRegisterHasAccount.
  ///
  /// In en, this message translates to:
  /// **'Already have an account?'**
  String get authFormRegisterHasAccount;

  /// No description provided for @authFormRegisterLoginLink.
  ///
  /// In en, this message translates to:
  /// **'Sign in'**
  String get authFormRegisterLoginLink;

  /// No description provided for @authFormResetPasswordTitle.
  ///
  /// In en, this message translates to:
  /// **'Set New Password'**
  String get authFormResetPasswordTitle;

  /// No description provided for @authFormResetPasswordPasswordLabel.
  ///
  /// In en, this message translates to:
  /// **'New Password'**
  String get authFormResetPasswordPasswordLabel;

  /// No description provided for @authFormResetPasswordConfirmPasswordLabel.
  ///
  /// In en, this message translates to:
  /// **'Confirm Password'**
  String get authFormResetPasswordConfirmPasswordLabel;

  /// No description provided for @authFormResetPasswordSubmit.
  ///
  /// In en, this message translates to:
  /// **'Set Password'**
  String get authFormResetPasswordSubmit;

  /// No description provided for @authFormResetPasswordSubmitting.
  ///
  /// In en, this message translates to:
  /// **'Setting password...'**
  String get authFormResetPasswordSubmitting;

  /// No description provided for @authFormResetPasswordSuccess.
  ///
  /// In en, this message translates to:
  /// **'Your password has been set. You can now sign in.'**
  String get authFormResetPasswordSuccess;

  /// No description provided for @authFormResetPasswordLoginLink.
  ///
  /// In en, this message translates to:
  /// **'Sign In'**
  String get authFormResetPasswordLoginLink;

  /// No description provided for @authFormForgotPasswordTitle.
  ///
  /// In en, this message translates to:
  /// **'Forgot Password'**
  String get authFormForgotPasswordTitle;

  /// No description provided for @authFormForgotPasswordEmailLabel.
  ///
  /// In en, this message translates to:
  /// **'Email address'**
  String get authFormForgotPasswordEmailLabel;

  /// No description provided for @authFormForgotPasswordEmailPlaceholder.
  ///
  /// In en, this message translates to:
  /// **'you@example.com'**
  String get authFormForgotPasswordEmailPlaceholder;

  /// No description provided for @authFormForgotPasswordSubmit.
  ///
  /// In en, this message translates to:
  /// **'Send Reset Link'**
  String get authFormForgotPasswordSubmit;

  /// No description provided for @authFormForgotPasswordSubmitting.
  ///
  /// In en, this message translates to:
  /// **'Sending...'**
  String get authFormForgotPasswordSubmitting;

  /// No description provided for @authFormForgotPasswordSuccess.
  ///
  /// In en, this message translates to:
  /// **'If an account exists with this email, you will receive a password reset link.'**
  String get authFormForgotPasswordSuccess;

  /// No description provided for @authFormForgotPasswordLoginLink.
  ///
  /// In en, this message translates to:
  /// **'Back to Sign In'**
  String get authFormForgotPasswordLoginLink;

  /// No description provided for @authFormVerifyEmailTitle.
  ///
  /// In en, this message translates to:
  /// **'Verify Email'**
  String get authFormVerifyEmailTitle;

  /// No description provided for @authFormVerifyEmailVerifying.
  ///
  /// In en, this message translates to:
  /// **'Verifying your email...'**
  String get authFormVerifyEmailVerifying;

  /// No description provided for @authFormVerifyEmailSuccess.
  ///
  /// In en, this message translates to:
  /// **'Your email has been verified. You can now sign in.'**
  String get authFormVerifyEmailSuccess;

  /// No description provided for @authFormVerifyEmailLoginLink.
  ///
  /// In en, this message translates to:
  /// **'Sign In'**
  String get authFormVerifyEmailLoginLink;

  /// No description provided for @authSocialContinueWith.
  ///
  /// In en, this message translates to:
  /// **'Or continue with'**
  String get authSocialContinueWith;

  /// No description provided for @authLoading.
  ///
  /// In en, this message translates to:
  /// **'Loading...'**
  String get authLoading;

  /// No description provided for @authSignedInAs.
  ///
  /// In en, this message translates to:
  /// **'Signed in as {email}'**
  String authSignedInAs(Object email);

  /// No description provided for @authRole.
  ///
  /// In en, this message translates to:
  /// **'Role:'**
  String get authRole;

  /// No description provided for @authStatus.
  ///
  /// In en, this message translates to:
  /// **'Status:'**
  String get authStatus;

  /// No description provided for @authErrorsEmailRequired.
  ///
  /// In en, this message translates to:
  /// **'Email is required'**
  String get authErrorsEmailRequired;

  /// No description provided for @authErrorsEmailInvalid.
  ///
  /// In en, this message translates to:
  /// **'Invalid email address'**
  String get authErrorsEmailInvalid;

  /// No description provided for @authErrorsPasswordRequired.
  ///
  /// In en, this message translates to:
  /// **'Password is required'**
  String get authErrorsPasswordRequired;

  /// No description provided for @authErrorsPasswordMin.
  ///
  /// In en, this message translates to:
  /// **'Password must be at least 8 characters'**
  String get authErrorsPasswordMin;

  /// No description provided for @authErrorsPasswordMax.
  ///
  /// In en, this message translates to:
  /// **'Password must be at most 128 characters'**
  String get authErrorsPasswordMax;

  /// No description provided for @authErrorsPasswordMin6.
  ///
  /// In en, this message translates to:
  /// **'Password must be at least 6 characters'**
  String get authErrorsPasswordMin6;

  /// No description provided for @authErrorsFirstNameRequired.
  ///
  /// In en, this message translates to:
  /// **'First name is required'**
  String get authErrorsFirstNameRequired;

  /// No description provided for @authErrorsLastNameRequired.
  ///
  /// In en, this message translates to:
  /// **'Last name is required'**
  String get authErrorsLastNameRequired;

  /// No description provided for @authErrorsConfirmPasswordRequired.
  ///
  /// In en, this message translates to:
  /// **'Please confirm your password'**
  String get authErrorsConfirmPasswordRequired;

  /// No description provided for @authErrorsPasswordsMustMatch.
  ///
  /// In en, this message translates to:
  /// **'Passwords do not match'**
  String get authErrorsPasswordsMustMatch;

  /// No description provided for @authErrorsLoginFailed.
  ///
  /// In en, this message translates to:
  /// **'Invalid credentials. Please try again.'**
  String get authErrorsLoginFailed;

  /// No description provided for @authErrorsRegisterFailed.
  ///
  /// In en, this message translates to:
  /// **'Registration failed. Please try again.'**
  String get authErrorsRegisterFailed;

  /// No description provided for @authErrorsEmailTaken.
  ///
  /// In en, this message translates to:
  /// **'This email is already registered'**
  String get authErrorsEmailTaken;

  /// No description provided for @authErrorsResetPasswordTokenMissing.
  ///
  /// In en, this message translates to:
  /// **'Reset password token is missing'**
  String get authErrorsResetPasswordTokenMissing;

  /// No description provided for @authErrorsResetPasswordFailed.
  ///
  /// In en, this message translates to:
  /// **'Password reset failed'**
  String get authErrorsResetPasswordFailed;

  /// No description provided for @authErrorsVerifyEmailTokenMissing.
  ///
  /// In en, this message translates to:
  /// **'Verification token is missing'**
  String get authErrorsVerifyEmailTokenMissing;

  /// No description provided for @authErrorsVerifyEmailFailed.
  ///
  /// In en, this message translates to:
  /// **'Email verification failed'**
  String get authErrorsVerifyEmailFailed;

  /// No description provided for @chatRoomTitle.
  ///
  /// In en, this message translates to:
  /// **'Chat Rooms'**
  String get chatRoomTitle;

  /// No description provided for @chatRoomConnected.
  ///
  /// In en, this message translates to:
  /// **'Connected'**
  String get chatRoomConnected;

  /// No description provided for @chatRoomConnecting.
  ///
  /// In en, this message translates to:
  /// **'Connecting...'**
  String get chatRoomConnecting;

  /// No description provided for @chatRoomDisconnected.
  ///
  /// In en, this message translates to:
  /// **'Disconnected'**
  String get chatRoomDisconnected;

  /// No description provided for @chatRoomRooms.
  ///
  /// In en, this message translates to:
  /// **'Rooms'**
  String get chatRoomRooms;

  /// No description provided for @chatRoomOnline.
  ///
  /// In en, this message translates to:
  /// **'Online ({count})'**
  String chatRoomOnline(Object count);

  /// No description provided for @chatRoomNoOneHere.
  ///
  /// In en, this message translates to:
  /// **'No one here yet'**
  String get chatRoomNoOneHere;

  /// No description provided for @chatRoomNoMessages.
  ///
  /// In en, this message translates to:
  /// **'No messages yet. Start the conversation!'**
  String get chatRoomNoMessages;

  /// No description provided for @chatRoomSend.
  ///
  /// In en, this message translates to:
  /// **'Send'**
  String get chatRoomSend;

  /// No description provided for @chatRoomMessagePlaceholder.
  ///
  /// In en, this message translates to:
  /// **'Message #{room}'**
  String chatRoomMessagePlaceholder(Object room);

  /// No description provided for @chatRoomOpenRooms.
  ///
  /// In en, this message translates to:
  /// **'Open rooms'**
  String get chatRoomOpenRooms;

  /// No description provided for @chatRoomCountOnline.
  ///
  /// In en, this message translates to:
  /// **'{count} online'**
  String chatRoomCountOnline(Object count);

  /// No description provided for @chatRoomSignInRequired.
  ///
  /// In en, this message translates to:
  /// **'Sign in to join chat rooms'**
  String get chatRoomSignInRequired;

  /// No description provided for @chatRoomRoomMembers.
  ///
  /// In en, this message translates to:
  /// **'Members'**
  String get chatRoomRoomMembers;

  /// No description provided for @chatRoomLoadEarlier.
  ///
  /// In en, this message translates to:
  /// **'Load earlier messages'**
  String get chatRoomLoadEarlier;

  /// No description provided for @checkoutSignInToUpgrade.
  ///
  /// In en, this message translates to:
  /// **'Sign in to upgrade your plan'**
  String get checkoutSignInToUpgrade;

  /// No description provided for @checkoutUpgrade.
  ///
  /// In en, this message translates to:
  /// **'Upgrade'**
  String get checkoutUpgrade;

  /// No description provided for @checkoutChangePlan.
  ///
  /// In en, this message translates to:
  /// **'Change plan'**
  String get checkoutChangePlan;

  /// No description provided for @checkoutCheckout.
  ///
  /// In en, this message translates to:
  /// **'Checkout'**
  String get checkoutCheckout;

  /// No description provided for @checkoutEnterCardDetails.
  ///
  /// In en, this message translates to:
  /// **'Enter your card details to upgrade.'**
  String get checkoutEnterCardDetails;

  /// No description provided for @checkoutChangedImmediately.
  ///
  /// In en, this message translates to:
  /// **'Your plan will be changed immediately.'**
  String get checkoutChangedImmediately;

  /// No description provided for @checkoutAlreadyOnPlan.
  ///
  /// In en, this message translates to:
  /// **'You are already on this plan.'**
  String get checkoutAlreadyOnPlan;

  /// No description provided for @checkoutUpgradeSuccess.
  ///
  /// In en, this message translates to:
  /// **'Upgrade successful!'**
  String get checkoutUpgradeSuccess;

  /// No description provided for @checkoutPlanChanged.
  ///
  /// In en, this message translates to:
  /// **'Plan changed!'**
  String get checkoutPlanChanged;

  /// No description provided for @checkoutRedirecting.
  ///
  /// In en, this message translates to:
  /// **'Redirecting to pricing...'**
  String get checkoutRedirecting;

  /// No description provided for @checkoutConfirmDowngrade.
  ///
  /// In en, this message translates to:
  /// **'Confirm downgrade to {tier}'**
  String checkoutConfirmDowngrade(Object tier);

  /// No description provided for @checkoutViewPlans.
  ///
  /// In en, this message translates to:
  /// **'View plans'**
  String get checkoutViewPlans;

  /// No description provided for @checkoutUpgradeToView.
  ///
  /// In en, this message translates to:
  /// **'Upgrade to view premium features and stats.'**
  String get checkoutUpgradeToView;

  /// No description provided for @checkoutCardNumberRequired.
  ///
  /// In en, this message translates to:
  /// **'Card number is required'**
  String get checkoutCardNumberRequired;

  /// No description provided for @checkoutInvalidCardNumber.
  ///
  /// In en, this message translates to:
  /// **'Invalid card number'**
  String get checkoutInvalidCardNumber;

  /// No description provided for @checkoutExpiryRequired.
  ///
  /// In en, this message translates to:
  /// **'Expiry is required'**
  String get checkoutExpiryRequired;

  /// No description provided for @checkoutInvalidExpiry.
  ///
  /// In en, this message translates to:
  /// **'Invalid expiry'**
  String get checkoutInvalidExpiry;

  /// No description provided for @checkoutCardExpired.
  ///
  /// In en, this message translates to:
  /// **'Card has expired'**
  String get checkoutCardExpired;

  /// No description provided for @checkoutCvcRequired.
  ///
  /// In en, this message translates to:
  /// **'CVC is required'**
  String get checkoutCvcRequired;

  /// No description provided for @checkoutInvalidCvc.
  ///
  /// In en, this message translates to:
  /// **'Invalid CVC'**
  String get checkoutInvalidCvc;

  /// No description provided for @checkoutNameRequired.
  ///
  /// In en, this message translates to:
  /// **'Cardholder name is required'**
  String get checkoutNameRequired;

  /// No description provided for @checkoutProcessing.
  ///
  /// In en, this message translates to:
  /// **'Processing...'**
  String get checkoutProcessing;

  /// No description provided for @checkoutSubscribeTo.
  ///
  /// In en, this message translates to:
  /// **'Subscribe to {tier}'**
  String checkoutSubscribeTo(Object tier);

  /// No description provided for @checkoutCardNumber.
  ///
  /// In en, this message translates to:
  /// **'Card number'**
  String get checkoutCardNumber;

  /// No description provided for @checkoutMm.
  ///
  /// In en, this message translates to:
  /// **'MM'**
  String get checkoutMm;

  /// No description provided for @checkoutYy.
  ///
  /// In en, this message translates to:
  /// **'YY'**
  String get checkoutYy;

  /// No description provided for @checkoutCvc.
  ///
  /// In en, this message translates to:
  /// **'CVC'**
  String get checkoutCvc;

  /// No description provided for @checkoutCardholderName.
  ///
  /// In en, this message translates to:
  /// **'Cardholder name'**
  String get checkoutCardholderName;

  /// No description provided for @checkoutTestCards.
  ///
  /// In en, this message translates to:
  /// **'Test cards:'**
  String get checkoutTestCards;

  /// No description provided for @checkoutMonth.
  ///
  /// In en, this message translates to:
  /// **'Month'**
  String get checkoutMonth;

  /// No description provided for @checkoutYear.
  ///
  /// In en, this message translates to:
  /// **'Year'**
  String get checkoutYear;

  /// No description provided for @checkoutPaymentFailedGeneric.
  ///
  /// In en, this message translates to:
  /// **'Payment failed. Please try again.'**
  String get checkoutPaymentFailedGeneric;

  /// No description provided for @errorNotFound.
  ///
  /// In en, this message translates to:
  /// **'Not found'**
  String get errorNotFound;

  /// No description provided for @errorPageNotFound.
  ///
  /// In en, this message translates to:
  /// **'This page could not be found.'**
  String get errorPageNotFound;

  /// No description provided for @errorV1NotFound.
  ///
  /// In en, this message translates to:
  /// **'This v1 resource does not exist.'**
  String get errorV1NotFound;

  /// No description provided for @errorRoutingNotFound.
  ///
  /// In en, this message translates to:
  /// **'This routing resource does not exist.'**
  String get errorRoutingNotFound;

  /// No description provided for @errorBackHome.
  ///
  /// In en, this message translates to:
  /// **'Go home'**
  String get errorBackHome;

  /// No description provided for @errorBackToV1.
  ///
  /// In en, this message translates to:
  /// **'Back to v1 home'**
  String get errorBackToV1;

  /// No description provided for @errorSomethingWentWrong.
  ///
  /// In en, this message translates to:
  /// **'Something went wrong'**
  String get errorSomethingWentWrong;

  /// No description provided for @errorSomethingWentWrongV1.
  ///
  /// In en, this message translates to:
  /// **'Something went wrong in v1'**
  String get errorSomethingWentWrongV1;

  /// No description provided for @errorReference.
  ///
  /// In en, this message translates to:
  /// **'Reference:'**
  String get errorReference;

  /// No description provided for @errorTryAgain.
  ///
  /// In en, this message translates to:
  /// **'Try again'**
  String get errorTryAgain;

  /// No description provided for @errorFailedToLoad.
  ///
  /// In en, this message translates to:
  /// **'Failed to load messages'**
  String get errorFailedToLoad;

  /// No description provided for @errorLoadingMessages.
  ///
  /// In en, this message translates to:
  /// **'Loading messages...'**
  String get errorLoadingMessages;

  /// No description provided for @errorAccessDenied.
  ///
  /// In en, this message translates to:
  /// **'Access denied. Admins only.'**
  String get errorAccessDenied;

  /// No description provided for @errorLoadingTheSlowRoute.
  ///
  /// In en, this message translates to:
  /// **'Loading the slow route…'**
  String get errorLoadingTheSlowRoute;

  /// No description provided for @errorConnectionLost.
  ///
  /// In en, this message translates to:
  /// **'Connection lost'**
  String get errorConnectionLost;

  /// No description provided for @errorTryingToReconnect.
  ///
  /// In en, this message translates to:
  /// **'Trying to reconnect. Some features may be unavailable.'**
  String get errorTryingToReconnect;

  /// No description provided for @errorTabLocked.
  ///
  /// In en, this message translates to:
  /// **'Already connected in another tab'**
  String get errorTabLocked;

  /// No description provided for @errorTabLockedDescription.
  ///
  /// In en, this message translates to:
  /// **'This browser already has an active connection. Close the other tab or this one to continue.'**
  String get errorTabLockedDescription;

  /// No description provided for @feedFeed.
  ///
  /// In en, this message translates to:
  /// **'Feed'**
  String get feedFeed;

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

  /// No description provided for @feedNoPostsYet.
  ///
  /// In en, this message translates to:
  /// **'No posts yet.'**
  String get feedNoPostsYet;

  /// No description provided for @feedBeFirstToShare.
  ///
  /// In en, this message translates to:
  /// **'Be the first to share'**
  String get feedBeFirstToShare;

  /// No description provided for @feedNewPostsAvailable.
  ///
  /// In en, this message translates to:
  /// **'New posts available — tap to load'**
  String get feedNewPostsAvailable;

  /// No description provided for @feedLoadingMore.
  ///
  /// In en, this message translates to:
  /// **'Loading more...'**
  String get feedLoadingMore;

  /// No description provided for @feedAllCaughtUp.
  ///
  /// In en, this message translates to:
  /// **'All caught up'**
  String get feedAllCaughtUp;

  /// No description provided for @feedYourPostStats.
  ///
  /// In en, this message translates to:
  /// **'Your Post Stats'**
  String get feedYourPostStats;

  /// No description provided for @feedLoadStats.
  ///
  /// In en, this message translates to:
  /// **'Load stats'**
  String get feedLoadStats;

  /// No description provided for @feedLoading.
  ///
  /// In en, this message translates to:
  /// **'Loading...'**
  String get feedLoading;

  /// No description provided for @feedPosts.
  ///
  /// In en, this message translates to:
  /// **'Posts'**
  String get feedPosts;

  /// No description provided for @feedReactions.
  ///
  /// In en, this message translates to:
  /// **'Reactions'**
  String get feedReactions;

  /// No description provided for @feedAvgPerPost.
  ///
  /// In en, this message translates to:
  /// **'Avg/Post'**
  String get feedAvgPerPost;

  /// No description provided for @feedFailedToLoadStats.
  ///
  /// In en, this message translates to:
  /// **'Failed to load stats'**
  String get feedFailedToLoadStats;

  /// No description provided for @feedFailedToLoadPosts.
  ///
  /// In en, this message translates to:
  /// **'Failed to load posts'**
  String get feedFailedToLoadPosts;

  /// No description provided for @feedNetworkError.
  ///
  /// In en, this message translates to:
  /// **'Network error'**
  String get feedNetworkError;

  /// No description provided for @findFriendsTitle.
  ///
  /// In en, this message translates to:
  /// **'Find Friends'**
  String get findFriendsTitle;

  /// No description provided for @findFriendsAddFriends.
  ///
  /// In en, this message translates to:
  /// **'Add Friends'**
  String get findFriendsAddFriends;

  /// No description provided for @findFriendsPendingRequests.
  ///
  /// In en, this message translates to:
  /// **'Pending Requests'**
  String get findFriendsPendingRequests;

  /// No description provided for @findFriendsSearchHint.
  ///
  /// In en, this message translates to:
  /// **'Type at least 3 characters to search...'**
  String get findFriendsSearchHint;

  /// No description provided for @findFriendsSearching.
  ///
  /// In en, this message translates to:
  /// **'Searching...'**
  String get findFriendsSearching;

  /// No description provided for @findFriendsNoUsersFound.
  ///
  /// In en, this message translates to:
  /// **'No users found.'**
  String get findFriendsNoUsersFound;

  /// No description provided for @findFriendsPending.
  ///
  /// In en, this message translates to:
  /// **'Pending'**
  String get findFriendsPending;

  /// No description provided for @findFriendsAddFriend.
  ///
  /// In en, this message translates to:
  /// **'Add Friend'**
  String get findFriendsAddFriend;

  /// No description provided for @findFriendsPrev.
  ///
  /// In en, this message translates to:
  /// **'Prev'**
  String get findFriendsPrev;

  /// No description provided for @findFriendsNext.
  ///
  /// In en, this message translates to:
  /// **'Next'**
  String get findFriendsNext;

  /// No description provided for @findFriendsNoRequests.
  ///
  /// In en, this message translates to:
  /// **'No pending friend requests.'**
  String get findFriendsNoRequests;

  /// No description provided for @findFriendsAccept.
  ///
  /// In en, this message translates to:
  /// **'Accept'**
  String get findFriendsAccept;

  /// No description provided for @findFriendsDecline.
  ///
  /// In en, this message translates to:
  /// **'Decline'**
  String get findFriendsDecline;

  /// No description provided for @findFriendsAwaiting.
  ///
  /// In en, this message translates to:
  /// **'Awaiting response'**
  String get findFriendsAwaiting;

  /// No description provided for @findFriendsSentByYou.
  ///
  /// In en, this message translates to:
  /// **'(sent by you)'**
  String get findFriendsSentByYou;

  /// No description provided for @findFriendsUsersFound.
  ///
  /// In en, this message translates to:
  /// **'{count} users found'**
  String findFriendsUsersFound(Object count);

  /// No description provided for @findFriendsSuggestedFriends.
  ///
  /// In en, this message translates to:
  /// **'Suggested Friends'**
  String get findFriendsSuggestedFriends;

  /// No description provided for @findFriendsSuggestedFriendsDesc.
  ///
  /// In en, this message translates to:
  /// **'People you may know'**
  String get findFriendsSuggestedFriendsDesc;

  /// No description provided for @findFriendsLoadSuggestions.
  ///
  /// In en, this message translates to:
  /// **'Load suggestions'**
  String get findFriendsLoadSuggestions;

  /// No description provided for @findFriendsLoadingSuggestions.
  ///
  /// In en, this message translates to:
  /// **'Loading...'**
  String get findFriendsLoadingSuggestions;

  /// No description provided for @findFriendsNoSuggestions.
  ///
  /// In en, this message translates to:
  /// **'No suggestions yet'**
  String get findFriendsNoSuggestions;

  /// No description provided for @findFriendsMutualFriends.
  ///
  /// In en, this message translates to:
  /// **'{count} mutual friends'**
  String findFriendsMutualFriends(Object count);

  /// No description provided for @findFriendsFailedToLoadSuggestions.
  ///
  /// In en, this message translates to:
  /// **'Failed to load suggestions'**
  String get findFriendsFailedToLoadSuggestions;

  /// No description provided for @findFriendsSignInRequired.
  ///
  /// In en, this message translates to:
  /// **'Sign in to find friends'**
  String get findFriendsSignInRequired;

  /// No description provided for @formsGalleryPageTitle.
  ///
  /// In en, this message translates to:
  /// **'Forms Demo'**
  String get formsGalleryPageTitle;

  /// No description provided for @formsGalleryPageDescription.
  ///
  /// In en, this message translates to:
  /// **'Real-world form patterns built with TanStack Form'**
  String get formsGalleryPageDescription;

  /// No description provided for @formsGalleryBack.
  ///
  /// In en, this message translates to:
  /// **'Back'**
  String get formsGalleryBack;

  /// No description provided for @formsGalleryBreadcrumbLabel.
  ///
  /// In en, this message translates to:
  /// **'Forms'**
  String get formsGalleryBreadcrumbLabel;

  /// No description provided for @formsGalleryTitle.
  ///
  /// In en, this message translates to:
  /// **'Forms Demo'**
  String get formsGalleryTitle;

  /// No description provided for @formsGalleryDescription.
  ///
  /// In en, this message translates to:
  /// **'Real-world form patterns built with TanStack Form'**
  String get formsGalleryDescription;

  /// No description provided for @formsBadgeReal.
  ///
  /// In en, this message translates to:
  /// **'Real'**
  String get formsBadgeReal;

  /// No description provided for @formsBadgeSimulated.
  ///
  /// In en, this message translates to:
  /// **'Simulated'**
  String get formsBadgeSimulated;

  /// No description provided for @formsBadgeMixed.
  ///
  /// In en, this message translates to:
  /// **'Mixed'**
  String get formsBadgeMixed;

  /// No description provided for @formsBadgeNone.
  ///
  /// In en, this message translates to:
  /// **'Demo'**
  String get formsBadgeNone;

  /// No description provided for @formsExamplesProfileTitle.
  ///
  /// In en, this message translates to:
  /// **'User Profile'**
  String get formsExamplesProfileTitle;

  /// No description provided for @formsExamplesProfileDescription.
  ///
  /// In en, this message translates to:
  /// **'Every input type + real field-level server error'**
  String get formsExamplesProfileDescription;

  /// No description provided for @formsExamplesTeamInviteTitle.
  ///
  /// In en, this message translates to:
  /// **'Team Invite'**
  String get formsExamplesTeamInviteTitle;

  /// No description provided for @formsExamplesTeamInviteDescription.
  ///
  /// In en, this message translates to:
  /// **'Multi-step wizard with server actions'**
  String get formsExamplesTeamInviteDescription;

  /// No description provided for @formsExamplesApiKeyTitle.
  ///
  /// In en, this message translates to:
  /// **'API Key Manager'**
  String get formsExamplesApiKeyTitle;

  /// No description provided for @formsExamplesApiKeyDescription.
  ///
  /// In en, this message translates to:
  /// **'Real mutations, optimistic list, reveal-once secret'**
  String get formsExamplesApiKeyDescription;

  /// No description provided for @formsExamplesBillingTitle.
  ///
  /// In en, this message translates to:
  /// **'Billing'**
  String get formsExamplesBillingTitle;

  /// No description provided for @formsExamplesBillingDescription.
  ///
  /// In en, this message translates to:
  /// **'Dependent fields with auto-save and coupon validation'**
  String get formsExamplesBillingDescription;

  /// No description provided for @formsExamplesFiltersTitle.
  ///
  /// In en, this message translates to:
  /// **'Filters'**
  String get formsExamplesFiltersTitle;

  /// No description provided for @formsExamplesFiltersDescription.
  ///
  /// In en, this message translates to:
  /// **'URL-synced filter panel with debounced search'**
  String get formsExamplesFiltersDescription;

  /// No description provided for @formsExamplesFieldStatesTitle.
  ///
  /// In en, this message translates to:
  /// **'Field States & Validation'**
  String get formsExamplesFieldStatesTitle;

  /// No description provided for @formsExamplesFieldStatesDescription.
  ///
  /// In en, this message translates to:
  /// **'All field states and validation modes reference'**
  String get formsExamplesFieldStatesDescription;

  /// No description provided for @formsExamplesUploadsTitle.
  ///
  /// In en, this message translates to:
  /// **'File Uploads'**
  String get formsExamplesUploadsTitle;

  /// No description provided for @formsExamplesUploadsDescription.
  ///
  /// In en, this message translates to:
  /// **'Real avatar/gallery uploads with progress bars'**
  String get formsExamplesUploadsDescription;

  /// No description provided for @formsExamplesErrorLabTitle.
  ///
  /// In en, this message translates to:
  /// **'Error Lab'**
  String get formsExamplesErrorLabTitle;

  /// No description provided for @formsExamplesErrorLabDescription.
  ///
  /// In en, this message translates to:
  /// **'Test every error surface and locale combination'**
  String get formsExamplesErrorLabDescription;

  /// No description provided for @formsExamplesCheckoutTitle.
  ///
  /// In en, this message translates to:
  /// **'Checkout & Addresses'**
  String get formsExamplesCheckoutTitle;

  /// No description provided for @formsExamplesCheckoutDescription.
  ///
  /// In en, this message translates to:
  /// **'Reusable address field groups with linked fields'**
  String get formsExamplesCheckoutDescription;

  /// No description provided for @formsExamplesContentEditorTitle.
  ///
  /// In en, this message translates to:
  /// **'Content Editor'**
  String get formsExamplesContentEditorTitle;

  /// No description provided for @formsExamplesContentEditorDescription.
  ///
  /// In en, this message translates to:
  /// **'Submit intents, drafts, and unsaved-changes guard'**
  String get formsExamplesContentEditorDescription;

  /// No description provided for @formsExamplesFormBuilderTitle.
  ///
  /// In en, this message translates to:
  /// **'Form Builder'**
  String get formsExamplesFormBuilderTitle;

  /// No description provided for @formsExamplesFormBuilderDescription.
  ///
  /// In en, this message translates to:
  /// **'Schema-driven dynamic form generation'**
  String get formsExamplesFormBuilderDescription;

  /// No description provided for @formsExamplesEditableTableTitle.
  ///
  /// In en, this message translates to:
  /// **'Editable Table'**
  String get formsExamplesEditableTableTitle;

  /// No description provided for @formsExamplesEditableTableDescription.
  ///
  /// In en, this message translates to:
  /// **'Inline row editing with per-row persistence'**
  String get formsExamplesEditableTableDescription;

  /// No description provided for @formsExamplesAdvancedTitle.
  ///
  /// In en, this message translates to:
  /// **'Advanced Patterns'**
  String get formsExamplesAdvancedTitle;

  /// No description provided for @formsExamplesAdvancedDescription.
  ///
  /// In en, this message translates to:
  /// **'Conditional fields, server error mapping, array sub-forms'**
  String get formsExamplesAdvancedDescription;

  /// No description provided for @formsExamplesElementsTitle.
  ///
  /// In en, this message translates to:
  /// **'Form Elements'**
  String get formsExamplesElementsTitle;

  /// No description provided for @formsExamplesElementsDescription.
  ///
  /// In en, this message translates to:
  /// **'Input groups, selects, textareas, checkboxes, radios, toggles, and validation states'**
  String get formsExamplesElementsDescription;

  /// No description provided for @formsExamplesLayoutsTitle.
  ///
  /// In en, this message translates to:
  /// **'Form Layouts'**
  String get formsExamplesLayoutsTitle;

  /// No description provided for @formsExamplesLayoutsDescription.
  ///
  /// In en, this message translates to:
  /// **'Basic stacked, grid, icon-prefixed, and sectioned card form patterns'**
  String get formsExamplesLayoutsDescription;

  /// No description provided for @formsProfileHeading.
  ///
  /// In en, this message translates to:
  /// **'User Profile'**
  String get formsProfileHeading;

  /// No description provided for @formsProfileFirstName.
  ///
  /// In en, this message translates to:
  /// **'First Name'**
  String get formsProfileFirstName;

  /// No description provided for @formsProfileLastName.
  ///
  /// In en, this message translates to:
  /// **'Last Name'**
  String get formsProfileLastName;

  /// No description provided for @formsProfileUsername.
  ///
  /// In en, this message translates to:
  /// **'Username'**
  String get formsProfileUsername;

  /// No description provided for @formsProfileEmail.
  ///
  /// In en, this message translates to:
  /// **'Email'**
  String get formsProfileEmail;

  /// No description provided for @formsProfileBio.
  ///
  /// In en, this message translates to:
  /// **'Bio'**
  String get formsProfileBio;

  /// No description provided for @formsProfileCountry.
  ///
  /// In en, this message translates to:
  /// **'Country'**
  String get formsProfileCountry;

  /// No description provided for @formsProfileLanguage.
  ///
  /// In en, this message translates to:
  /// **'Language'**
  String get formsProfileLanguage;

  /// No description provided for @formsProfileNewsletter.
  ///
  /// In en, this message translates to:
  /// **'Subscribe to newsletter'**
  String get formsProfileNewsletter;

  /// No description provided for @formsProfileInterests.
  ///
  /// In en, this message translates to:
  /// **'Interests'**
  String get formsProfileInterests;

  /// No description provided for @formsProfileRole.
  ///
  /// In en, this message translates to:
  /// **'Role'**
  String get formsProfileRole;

  /// No description provided for @formsProfileBirthDate.
  ///
  /// In en, this message translates to:
  /// **'Birth Date'**
  String get formsProfileBirthDate;

  /// No description provided for @formsProfileMeetingTime.
  ///
  /// In en, this message translates to:
  /// **'Meeting Time'**
  String get formsProfileMeetingTime;

  /// No description provided for @formsProfileNotificationPrefs.
  ///
  /// In en, this message translates to:
  /// **'Notification Preferences'**
  String get formsProfileNotificationPrefs;

  /// No description provided for @formsProfileSave.
  ///
  /// In en, this message translates to:
  /// **'Save Profile'**
  String get formsProfileSave;

  /// No description provided for @formsProfileSaving.
  ///
  /// In en, this message translates to:
  /// **'Saving...'**
  String get formsProfileSaving;

  /// No description provided for @formsProfileSaveSuccess.
  ///
  /// In en, this message translates to:
  /// **'Profile updated successfully'**
  String get formsProfileSaveSuccess;

  /// No description provided for @formsProfileDemoOnlyFields.
  ///
  /// In en, this message translates to:
  /// **'The following fields are demo-only and not persisted'**
  String get formsProfileDemoOnlyFields;

  /// No description provided for @formsProfileUsernameChecking.
  ///
  /// In en, this message translates to:
  /// **'Checking availability…'**
  String get formsProfileUsernameChecking;

  /// No description provided for @formsProfileUsernameAvailable.
  ///
  /// In en, this message translates to:
  /// **'Available'**
  String get formsProfileUsernameAvailable;

  /// No description provided for @formsProfileUsernameTaken.
  ///
  /// In en, this message translates to:
  /// **'Already taken'**
  String get formsProfileUsernameTaken;

  /// No description provided for @formsProfileFirstNameRequired.
  ///
  /// In en, this message translates to:
  /// **'First name is required'**
  String get formsProfileFirstNameRequired;

  /// No description provided for @formsProfileLastNameRequired.
  ///
  /// In en, this message translates to:
  /// **'Last name is required'**
  String get formsProfileLastNameRequired;

  /// No description provided for @formsProfileUsernameMin.
  ///
  /// In en, this message translates to:
  /// **'Username must be at least 2 characters'**
  String get formsProfileUsernameMin;

  /// No description provided for @formsProfileEmailInvalid.
  ///
  /// In en, this message translates to:
  /// **'Invalid email'**
  String get formsProfileEmailInvalid;

  /// No description provided for @formsProfileUsernameHint.
  ///
  /// In en, this message translates to:
  /// **'3–30 characters: lowercase letters, numbers, and _ only'**
  String get formsProfileUsernameHint;

  /// No description provided for @formsProfileBioHint.
  ///
  /// In en, this message translates to:
  /// **'Up to 500 characters'**
  String get formsProfileBioHint;

  /// No description provided for @formsTeamInviteHeading.
  ///
  /// In en, this message translates to:
  /// **'Invite Team Members'**
  String get formsTeamInviteHeading;

  /// No description provided for @formsTeamInviteStepEmails.
  ///
  /// In en, this message translates to:
  /// **'Email Addresses'**
  String get formsTeamInviteStepEmails;

  /// No description provided for @formsTeamInviteStepRole.
  ///
  /// In en, this message translates to:
  /// **'Role & Permissions'**
  String get formsTeamInviteStepRole;

  /// No description provided for @formsTeamInviteStepMessage.
  ///
  /// In en, this message translates to:
  /// **'Optional Message'**
  String get formsTeamInviteStepMessage;

  /// No description provided for @formsTeamInviteStepReview.
  ///
  /// In en, this message translates to:
  /// **'Review & Send'**
  String get formsTeamInviteStepReview;

  /// No description provided for @formsTeamInviteNext.
  ///
  /// In en, this message translates to:
  /// **'Next'**
  String get formsTeamInviteNext;

  /// No description provided for @formsTeamInviteBack.
  ///
  /// In en, this message translates to:
  /// **'Back'**
  String get formsTeamInviteBack;

  /// No description provided for @formsTeamInviteSend.
  ///
  /// In en, this message translates to:
  /// **'Send Invites'**
  String get formsTeamInviteSend;

  /// No description provided for @formsTeamInviteSending.
  ///
  /// In en, this message translates to:
  /// **'Sending...'**
  String get formsTeamInviteSending;

  /// No description provided for @formsTeamInviteEmailPlaceholder.
  ///
  /// In en, this message translates to:
  /// **'Enter email and press Enter'**
  String get formsTeamInviteEmailPlaceholder;

  /// No description provided for @formsTeamInviteEmailDuplicate.
  ///
  /// In en, this message translates to:
  /// **'Duplicate email address'**
  String get formsTeamInviteEmailDuplicate;

  /// No description provided for @formsTeamInviteRoleLabel.
  ///
  /// In en, this message translates to:
  /// **'Role'**
  String get formsTeamInviteRoleLabel;

  /// No description provided for @formsTeamInviteMessageLabel.
  ///
  /// In en, this message translates to:
  /// **'Personal Message (optional)'**
  String get formsTeamInviteMessageLabel;

  /// No description provided for @formsTeamInviteMessagePlaceholder.
  ///
  /// In en, this message translates to:
  /// **'Add a personal note...'**
  String get formsTeamInviteMessagePlaceholder;

  /// No description provided for @formsTeamInviteInviteSent.
  ///
  /// In en, this message translates to:
  /// **'Invites sent successfully'**
  String get formsTeamInviteInviteSent;

  /// No description provided for @formsTeamInviteInviteFailed.
  ///
  /// In en, this message translates to:
  /// **'Failed to send invites'**
  String get formsTeamInviteInviteFailed;

  /// No description provided for @formsTeamInviteEmailRequired.
  ///
  /// In en, this message translates to:
  /// **'At least one email is required'**
  String get formsTeamInviteEmailRequired;

  /// No description provided for @formsTeamInviteEmailInvalid.
  ///
  /// In en, this message translates to:
  /// **'Invalid email format'**
  String get formsTeamInviteEmailInvalid;

  /// No description provided for @formsTeamInviteRoleRequired.
  ///
  /// In en, this message translates to:
  /// **'Please select a role'**
  String get formsTeamInviteRoleRequired;

  /// No description provided for @formsTeamInviteQuotaTitle.
  ///
  /// In en, this message translates to:
  /// **'Upgrade Required'**
  String get formsTeamInviteQuotaTitle;

  /// No description provided for @formsTeamInviteQuotaBody.
  ///
  /// In en, this message translates to:
  /// **'You can invite up to 5 team members on your current plan.'**
  String get formsTeamInviteQuotaBody;

  /// No description provided for @formsTeamInviteEmails.
  ///
  /// In en, this message translates to:
  /// **'Emails'**
  String get formsTeamInviteEmails;

  /// No description provided for @formsTeamInviteRole.
  ///
  /// In en, this message translates to:
  /// **'Role'**
  String get formsTeamInviteRole;

  /// No description provided for @formsTeamInviteMessage.
  ///
  /// In en, this message translates to:
  /// **'Message'**
  String get formsTeamInviteMessage;

  /// No description provided for @formsTeamInviteEmailChipRemove.
  ///
  /// In en, this message translates to:
  /// **'Remove email'**
  String get formsTeamInviteEmailChipRemove;

  /// No description provided for @formsApiKeyHeading.
  ///
  /// In en, this message translates to:
  /// **'API Key Manager'**
  String get formsApiKeyHeading;

  /// No description provided for @formsApiKeyNameLabel.
  ///
  /// In en, this message translates to:
  /// **'Key Name'**
  String get formsApiKeyNameLabel;

  /// No description provided for @formsApiKeyNamePlaceholder.
  ///
  /// In en, this message translates to:
  /// **'e.g. CI/CD, Development'**
  String get formsApiKeyNamePlaceholder;

  /// No description provided for @formsApiKeyExpiresLabel.
  ///
  /// In en, this message translates to:
  /// **'Expiry'**
  String get formsApiKeyExpiresLabel;

  /// No description provided for @formsApiKeyExpires30.
  ///
  /// In en, this message translates to:
  /// **'30 Days'**
  String get formsApiKeyExpires30;

  /// No description provided for @formsApiKeyExpires60.
  ///
  /// In en, this message translates to:
  /// **'60 Days'**
  String get formsApiKeyExpires60;

  /// No description provided for @formsApiKeyExpires90.
  ///
  /// In en, this message translates to:
  /// **'90 Days'**
  String get formsApiKeyExpires90;

  /// No description provided for @formsApiKeyExpiresNever.
  ///
  /// In en, this message translates to:
  /// **'No Expiry'**
  String get formsApiKeyExpiresNever;

  /// No description provided for @formsApiKeyPermissionsLabel.
  ///
  /// In en, this message translates to:
  /// **'Permissions'**
  String get formsApiKeyPermissionsLabel;

  /// No description provided for @formsApiKeySelectAll.
  ///
  /// In en, this message translates to:
  /// **'Select All'**
  String get formsApiKeySelectAll;

  /// No description provided for @formsApiKeyIpWhitelistLabel.
  ///
  /// In en, this message translates to:
  /// **'IP Whitelist (optional)'**
  String get formsApiKeyIpWhitelistLabel;

  /// No description provided for @formsApiKeyIpPlaceholder.
  ///
  /// In en, this message translates to:
  /// **'e.g. 203.0.113.42 — one address per line'**
  String get formsApiKeyIpPlaceholder;

  /// No description provided for @formsApiKeyCreate.
  ///
  /// In en, this message translates to:
  /// **'Create API Key'**
  String get formsApiKeyCreate;

  /// No description provided for @formsApiKeyCreating.
  ///
  /// In en, this message translates to:
  /// **'Creating...'**
  String get formsApiKeyCreating;

  /// No description provided for @formsApiKeyCreated.
  ///
  /// In en, this message translates to:
  /// **'API key created — copy it now'**
  String get formsApiKeyCreated;

  /// No description provided for @formsApiKeyCopied.
  ///
  /// In en, this message translates to:
  /// **'Copied to clipboard'**
  String get formsApiKeyCopied;

  /// No description provided for @formsApiKeyRevoke.
  ///
  /// In en, this message translates to:
  /// **'Revoke'**
  String get formsApiKeyRevoke;

  /// No description provided for @formsApiKeyRevokeConfirm.
  ///
  /// In en, this message translates to:
  /// **'Revoke this API key? This cannot be undone.'**
  String get formsApiKeyRevokeConfirm;

  /// No description provided for @formsApiKeyRevokeConfirmDescription.
  ///
  /// In en, this message translates to:
  /// **'This will permanently revoke the key and all associated tokens.'**
  String get formsApiKeyRevokeConfirmDescription;

  /// No description provided for @formsApiKeyRevoked.
  ///
  /// In en, this message translates to:
  /// **'API key revoked'**
  String get formsApiKeyRevoked;

  /// No description provided for @formsApiKeyRevealSecret.
  ///
  /// In en, this message translates to:
  /// **'Your API Key'**
  String get formsApiKeyRevealSecret;

  /// No description provided for @formsApiKeySecretNote.
  ///
  /// In en, this message translates to:
  /// **'You won\'t see this again'**
  String get formsApiKeySecretNote;

  /// No description provided for @formsApiKeyEmpty.
  ///
  /// In en, this message translates to:
  /// **'No API keys yet'**
  String get formsApiKeyEmpty;

  /// No description provided for @formsApiKeyLoadFailed.
  ///
  /// In en, this message translates to:
  /// **'Failed to load API keys'**
  String get formsApiKeyLoadFailed;

  /// No description provided for @formsApiKeyReveal.
  ///
  /// In en, this message translates to:
  /// **'Reveal'**
  String get formsApiKeyReveal;

  /// No description provided for @formsApiKeyCopy.
  ///
  /// In en, this message translates to:
  /// **'Copy'**
  String get formsApiKeyCopy;

  /// No description provided for @formsApiKeyDismiss.
  ///
  /// In en, this message translates to:
  /// **'Dismiss'**
  String get formsApiKeyDismiss;

  /// No description provided for @formsApiKeyCancel.
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get formsApiKeyCancel;

  /// No description provided for @formsApiKeyNewKey.
  ///
  /// In en, this message translates to:
  /// **'New Key'**
  String get formsApiKeyNewKey;

  /// No description provided for @formsApiKeyNameRequired.
  ///
  /// In en, this message translates to:
  /// **'Key name is required'**
  String get formsApiKeyNameRequired;

  /// No description provided for @formsApiKeyNameTooLong.
  ///
  /// In en, this message translates to:
  /// **'Key name must be 60 characters or fewer'**
  String get formsApiKeyNameTooLong;

  /// No description provided for @formsApiKeyNameExists.
  ///
  /// In en, this message translates to:
  /// **'You already have a key with this name'**
  String get formsApiKeyNameExists;

  /// No description provided for @formsApiKeyAddIp.
  ///
  /// In en, this message translates to:
  /// **'Add'**
  String get formsApiKeyAddIp;

  /// No description provided for @formsApiKeyIpInvalid.
  ///
  /// In en, this message translates to:
  /// **'Enter a valid IPv4 address, e.g. 203.0.113.42'**
  String get formsApiKeyIpInvalid;

  /// No description provided for @formsApiKeyRemoveIp.
  ///
  /// In en, this message translates to:
  /// **'Remove IP address'**
  String get formsApiKeyRemoveIp;

  /// No description provided for @formsBillingHeading.
  ///
  /// In en, this message translates to:
  /// **'Billing & Plan'**
  String get formsBillingHeading;

  /// No description provided for @formsBillingPlan.
  ///
  /// In en, this message translates to:
  /// **'Plan'**
  String get formsBillingPlan;

  /// No description provided for @formsBillingBillingPeriod.
  ///
  /// In en, this message translates to:
  /// **'Billing Period'**
  String get formsBillingBillingPeriod;

  /// No description provided for @formsBillingMonthly.
  ///
  /// In en, this message translates to:
  /// **'Monthly'**
  String get formsBillingMonthly;

  /// No description provided for @formsBillingYearly.
  ///
  /// In en, this message translates to:
  /// **'Yearly (Save 20%)'**
  String get formsBillingYearly;

  /// No description provided for @formsBillingPaymentMethod.
  ///
  /// In en, this message translates to:
  /// **'Payment Method'**
  String get formsBillingPaymentMethod;

  /// No description provided for @formsBillingCouponCode.
  ///
  /// In en, this message translates to:
  /// **'Coupon Code'**
  String get formsBillingCouponCode;

  /// No description provided for @formsBillingCouponPlaceholder.
  ///
  /// In en, this message translates to:
  /// **'Enter coupon code'**
  String get formsBillingCouponPlaceholder;

  /// No description provided for @formsBillingCouponChecking.
  ///
  /// In en, this message translates to:
  /// **'Checking coupon...'**
  String get formsBillingCouponChecking;

  /// No description provided for @formsBillingCouponApplied.
  ///
  /// In en, this message translates to:
  /// **'Coupon applied'**
  String get formsBillingCouponApplied;

  /// No description provided for @formsBillingCouponOff.
  ///
  /// In en, this message translates to:
  /// **'off'**
  String get formsBillingCouponOff;

  /// No description provided for @formsBillingTaxId.
  ///
  /// In en, this message translates to:
  /// **'Tax ID (VAT only)'**
  String get formsBillingTaxId;

  /// No description provided for @formsBillingTaxIdPlaceholder.
  ///
  /// In en, this message translates to:
  /// **'Enter tax ID'**
  String get formsBillingTaxIdPlaceholder;

  /// No description provided for @formsBillingPriceSummary.
  ///
  /// In en, this message translates to:
  /// **'Price Summary'**
  String get formsBillingPriceSummary;

  /// No description provided for @formsBillingSubtotal.
  ///
  /// In en, this message translates to:
  /// **'Subtotal'**
  String get formsBillingSubtotal;

  /// No description provided for @formsBillingDiscount.
  ///
  /// In en, this message translates to:
  /// **'Discount'**
  String get formsBillingDiscount;

  /// No description provided for @formsBillingTotal.
  ///
  /// In en, this message translates to:
  /// **'Total'**
  String get formsBillingTotal;

  /// No description provided for @formsBillingAutoSave.
  ///
  /// In en, this message translates to:
  /// **'Auto-saved'**
  String get formsBillingAutoSave;

  /// No description provided for @formsBillingAutoSaveFailed.
  ///
  /// In en, this message translates to:
  /// **'Auto-save failed'**
  String get formsBillingAutoSaveFailed;

  /// No description provided for @formsBillingSaveSuccess.
  ///
  /// In en, this message translates to:
  /// **'Billing updated'**
  String get formsBillingSaveSuccess;

  /// No description provided for @formsBillingUnsaved.
  ///
  /// In en, this message translates to:
  /// **'Unsaved changes'**
  String get formsBillingUnsaved;

  /// No description provided for @formsBillingUpdateButton.
  ///
  /// In en, this message translates to:
  /// **'Update Billing'**
  String get formsBillingUpdateButton;

  /// No description provided for @formsBillingPlanRequired.
  ///
  /// In en, this message translates to:
  /// **'Please select a plan'**
  String get formsBillingPlanRequired;

  /// No description provided for @formsBillingPeriodRequired.
  ///
  /// In en, this message translates to:
  /// **'Please select a billing period'**
  String get formsBillingPeriodRequired;

  /// No description provided for @formsBillingTaxIdInvalid.
  ///
  /// In en, this message translates to:
  /// **'Tax ID format looks wrong — expect a 2-letter country code followed by 2–13 digits/letters'**
  String get formsBillingTaxIdInvalid;

  /// No description provided for @formsBillingCouponHint.
  ///
  /// In en, this message translates to:
  /// **'Case-insensitive — try SAVE10 or WELCOME20'**
  String get formsBillingCouponHint;

  /// No description provided for @formsBillingTaxIdHint.
  ///
  /// In en, this message translates to:
  /// **'2-letter country code + 2–13 digits/letters, e.g. GB123456789'**
  String get formsBillingTaxIdHint;

  /// No description provided for @formsFiltersHeading.
  ///
  /// In en, this message translates to:
  /// **'Filters'**
  String get formsFiltersHeading;

  /// No description provided for @formsFiltersSearch.
  ///
  /// In en, this message translates to:
  /// **'Search'**
  String get formsFiltersSearch;

  /// No description provided for @formsFiltersSearchPlaceholder.
  ///
  /// In en, this message translates to:
  /// **'Search...'**
  String get formsFiltersSearchPlaceholder;

  /// No description provided for @formsFiltersCategory.
  ///
  /// In en, this message translates to:
  /// **'Category'**
  String get formsFiltersCategory;

  /// No description provided for @formsFiltersCategoryPlaceholder.
  ///
  /// In en, this message translates to:
  /// **'Select categories'**
  String get formsFiltersCategoryPlaceholder;

  /// No description provided for @formsFiltersTags.
  ///
  /// In en, this message translates to:
  /// **'Tags'**
  String get formsFiltersTags;

  /// No description provided for @formsFiltersTagsPlaceholder.
  ///
  /// In en, this message translates to:
  /// **'Type to add tags'**
  String get formsFiltersTagsPlaceholder;

  /// No description provided for @formsFiltersDateRange.
  ///
  /// In en, this message translates to:
  /// **'Date Range'**
  String get formsFiltersDateRange;

  /// No description provided for @formsFiltersSortBy.
  ///
  /// In en, this message translates to:
  /// **'Sort By'**
  String get formsFiltersSortBy;

  /// No description provided for @formsFiltersSortOrder.
  ///
  /// In en, this message translates to:
  /// **'Order'**
  String get formsFiltersSortOrder;

  /// No description provided for @formsFiltersAsc.
  ///
  /// In en, this message translates to:
  /// **'Ascending'**
  String get formsFiltersAsc;

  /// No description provided for @formsFiltersDesc.
  ///
  /// In en, this message translates to:
  /// **'Descending'**
  String get formsFiltersDesc;

  /// No description provided for @formsFiltersPageSize.
  ///
  /// In en, this message translates to:
  /// **'Per Page'**
  String get formsFiltersPageSize;

  /// No description provided for @formsFiltersStatus.
  ///
  /// In en, this message translates to:
  /// **'Status'**
  String get formsFiltersStatus;

  /// No description provided for @formsFiltersReset.
  ///
  /// In en, this message translates to:
  /// **'Reset Filters'**
  String get formsFiltersReset;

  /// No description provided for @formsFiltersResults.
  ///
  /// In en, this message translates to:
  /// **'Showing resolved state'**
  String get formsFiltersResults;

  /// No description provided for @formsFieldStatesHeading.
  ///
  /// In en, this message translates to:
  /// **'Field States & Validation Modes'**
  String get formsFieldStatesHeading;

  /// No description provided for @formsFieldStatesDefault.
  ///
  /// In en, this message translates to:
  /// **'Default'**
  String get formsFieldStatesDefault;

  /// No description provided for @formsFieldStatesFilled.
  ///
  /// In en, this message translates to:
  /// **'Filled'**
  String get formsFieldStatesFilled;

  /// No description provided for @formsFieldStatesError.
  ///
  /// In en, this message translates to:
  /// **'Error'**
  String get formsFieldStatesError;

  /// No description provided for @formsFieldStatesWarning.
  ///
  /// In en, this message translates to:
  /// **'Warning'**
  String get formsFieldStatesWarning;

  /// No description provided for @formsFieldStatesDisabled.
  ///
  /// In en, this message translates to:
  /// **'Disabled'**
  String get formsFieldStatesDisabled;

  /// No description provided for @formsFieldStatesLoading.
  ///
  /// In en, this message translates to:
  /// **'Loading'**
  String get formsFieldStatesLoading;

  /// No description provided for @formsFieldStatesReadOnly.
  ///
  /// In en, this message translates to:
  /// **'Read Only'**
  String get formsFieldStatesReadOnly;

  /// No description provided for @formsFieldStatesRequired.
  ///
  /// In en, this message translates to:
  /// **'Required'**
  String get formsFieldStatesRequired;

  /// No description provided for @formsFieldStatesValidationModes.
  ///
  /// In en, this message translates to:
  /// **'Validation Modes'**
  String get formsFieldStatesValidationModes;

  /// No description provided for @formsFieldStatesEager.
  ///
  /// In en, this message translates to:
  /// **'Eager (onChange)'**
  String get formsFieldStatesEager;

  /// No description provided for @formsFieldStatesClassic.
  ///
  /// In en, this message translates to:
  /// **'Classic (onBlur)'**
  String get formsFieldStatesClassic;

  /// No description provided for @formsFieldStatesDynamic.
  ///
  /// In en, this message translates to:
  /// **'Dynamic (reward early, punish late)'**
  String get formsFieldStatesDynamic;

  /// No description provided for @formsFieldStatesLinkedFields.
  ///
  /// In en, this message translates to:
  /// **'Linked Fields'**
  String get formsFieldStatesLinkedFields;

  /// No description provided for @formsFieldStatesConfirmPassword.
  ///
  /// In en, this message translates to:
  /// **'Confirm Password'**
  String get formsFieldStatesConfirmPassword;

  /// No description provided for @formsFieldStatesPassword.
  ///
  /// In en, this message translates to:
  /// **'Password'**
  String get formsFieldStatesPassword;

  /// No description provided for @formsFieldStatesNameMin.
  ///
  /// In en, this message translates to:
  /// **'Name must be at least 2 characters'**
  String get formsFieldStatesNameMin;

  /// No description provided for @formsFieldStatesEmailInvalid.
  ///
  /// In en, this message translates to:
  /// **'Invalid email address'**
  String get formsFieldStatesEmailInvalid;

  /// No description provided for @formsFieldStatesRoleRequired.
  ///
  /// In en, this message translates to:
  /// **'Please select a role'**
  String get formsFieldStatesRoleRequired;

  /// No description provided for @formsFieldStatesAsyncChecked.
  ///
  /// In en, this message translates to:
  /// **'Async (onBlur + server)'**
  String get formsFieldStatesAsyncChecked;

  /// No description provided for @formsUploadsHeading.
  ///
  /// In en, this message translates to:
  /// **'File Uploads & Attachments'**
  String get formsUploadsHeading;

  /// No description provided for @formsUploadsAvatar.
  ///
  /// In en, this message translates to:
  /// **'Avatar'**
  String get formsUploadsAvatar;

  /// No description provided for @formsUploadsGallery.
  ///
  /// In en, this message translates to:
  /// **'Gallery'**
  String get formsUploadsGallery;

  /// No description provided for @formsUploadsDocuments.
  ///
  /// In en, this message translates to:
  /// **'Documents'**
  String get formsUploadsDocuments;

  /// No description provided for @formsUploadsUploadLabel.
  ///
  /// In en, this message translates to:
  /// **'Upload files'**
  String get formsUploadsUploadLabel;

  /// No description provided for @formsUploadsSimulatedNote.
  ///
  /// In en, this message translates to:
  /// **'This section uses simulated backend — real file upload would 415'**
  String get formsUploadsSimulatedNote;

  /// No description provided for @formsUploadsAvatarDescription.
  ///
  /// In en, this message translates to:
  /// **'Single image, 5 MB max, uploaded on selection'**
  String get formsUploadsAvatarDescription;

  /// No description provided for @formsUploadsGalleryDescription.
  ///
  /// In en, this message translates to:
  /// **'Up to 6 images, parallel XHR uploads with real progress'**
  String get formsUploadsGalleryDescription;

  /// No description provided for @formsUploadsDocumentsDescription.
  ///
  /// In en, this message translates to:
  /// **'Simulated — the backend only accepts images (JPEG, PNG, WebP, GIF, AVIF). This section shows where a real generic-file route would go.'**
  String get formsUploadsDocumentsDescription;

  /// No description provided for @formsUploadsLabelsDropzoneIdle.
  ///
  /// In en, this message translates to:
  /// **'Drop images here or click to browse'**
  String get formsUploadsLabelsDropzoneIdle;

  /// No description provided for @formsUploadsLabelsDropzoneActive.
  ///
  /// In en, this message translates to:
  /// **'Drop images here'**
  String get formsUploadsLabelsDropzoneActive;

  /// No description provided for @formsUploadsLabelsUploaded.
  ///
  /// In en, this message translates to:
  /// **'Uploaded'**
  String get formsUploadsLabelsUploaded;

  /// No description provided for @formsUploadsLabelsUploadFailed.
  ///
  /// In en, this message translates to:
  /// **'Upload failed'**
  String get formsUploadsLabelsUploadFailed;

  /// No description provided for @formsUploadsLabelsUploading.
  ///
  /// In en, this message translates to:
  /// **'Uploading...'**
  String get formsUploadsLabelsUploading;

  /// No description provided for @formsUploadsLabelsRemove.
  ///
  /// In en, this message translates to:
  /// **'Remove {file}'**
  String formsUploadsLabelsRemove(Object file);

  /// No description provided for @formsUploadsLabelsDocDropzoneIdle.
  ///
  /// In en, this message translates to:
  /// **'Drag PDF/DOCX here'**
  String get formsUploadsLabelsDocDropzoneIdle;

  /// No description provided for @formsUploadsLabelsDocDropzoneActive.
  ///
  /// In en, this message translates to:
  /// **'Drop files here'**
  String get formsUploadsLabelsDocDropzoneActive;

  /// No description provided for @formsUploadsLabelsInvalidType.
  ///
  /// In en, this message translates to:
  /// **'Only {accepted} files are allowed — got {file}'**
  String formsUploadsLabelsInvalidType(Object accepted, Object file);

  /// No description provided for @formsUploadsLabelsAcceptedImages.
  ///
  /// In en, this message translates to:
  /// **'Images'**
  String get formsUploadsLabelsAcceptedImages;

  /// No description provided for @formsUploadsLabelsAcceptedPdfWord.
  ///
  /// In en, this message translates to:
  /// **'PDF, Word'**
  String get formsUploadsLabelsAcceptedPdfWord;

  /// No description provided for @formsUploadsLabelsMaxSize.
  ///
  /// In en, this message translates to:
  /// **'Max {max} per file'**
  String formsUploadsLabelsMaxSize(Object max);

  /// No description provided for @formsUploadsInvalidFileType.
  ///
  /// In en, this message translates to:
  /// **'Invalid file type'**
  String get formsUploadsInvalidFileType;

  /// No description provided for @formsErrorLabHeading.
  ///
  /// In en, this message translates to:
  /// **'Error & Async States Lab'**
  String get formsErrorLabHeading;

  /// No description provided for @formsErrorLabScenario.
  ///
  /// In en, this message translates to:
  /// **'Error Scenario'**
  String get formsErrorLabScenario;

  /// No description provided for @formsErrorLabLocale.
  ///
  /// In en, this message translates to:
  /// **'Locale'**
  String get formsErrorLabLocale;

  /// No description provided for @formsErrorLabNetwork.
  ///
  /// In en, this message translates to:
  /// **'Network Condition'**
  String get formsErrorLabNetwork;

  /// No description provided for @formsErrorLabInstant.
  ///
  /// In en, this message translates to:
  /// **'Instant'**
  String get formsErrorLabInstant;

  /// No description provided for @formsErrorLabDelayed.
  ///
  /// In en, this message translates to:
  /// **'Delayed (800ms)'**
  String get formsErrorLabDelayed;

  /// No description provided for @formsErrorLabTimeout.
  ///
  /// In en, this message translates to:
  /// **'Timeout (5s)'**
  String get formsErrorLabTimeout;

  /// No description provided for @formsErrorLabOffline.
  ///
  /// In en, this message translates to:
  /// **'Offline'**
  String get formsErrorLabOffline;

  /// No description provided for @formsErrorLabRandomFail.
  ///
  /// In en, this message translates to:
  /// **'Random Failure (30%)'**
  String get formsErrorLabRandomFail;

  /// No description provided for @formsErrorLabTrigger.
  ///
  /// In en, this message translates to:
  /// **'Trigger Error'**
  String get formsErrorLabTrigger;

  /// No description provided for @formsErrorLabPayloadInspector.
  ///
  /// In en, this message translates to:
  /// **'Raw Payload'**
  String get formsErrorLabPayloadInspector;

  /// No description provided for @formsErrorLabEn.
  ///
  /// In en, this message translates to:
  /// **'English'**
  String get formsErrorLabEn;

  /// No description provided for @formsErrorLabTr.
  ///
  /// In en, this message translates to:
  /// **'Turkish'**
  String get formsErrorLabTr;

  /// No description provided for @formsErrorLabSubheading.
  ///
  /// In en, this message translates to:
  /// **'Test every error surface and locale combination'**
  String get formsErrorLabSubheading;

  /// No description provided for @formsErrorLabScenarioLabel.
  ///
  /// In en, this message translates to:
  /// **'Error Scenario'**
  String get formsErrorLabScenarioLabel;

  /// No description provided for @formsErrorLabLocaleLabel.
  ///
  /// In en, this message translates to:
  /// **'Locale'**
  String get formsErrorLabLocaleLabel;

  /// No description provided for @formsErrorLabNetworkLabel.
  ///
  /// In en, this message translates to:
  /// **'Network Condition'**
  String get formsErrorLabNetworkLabel;

  /// No description provided for @formsErrorLabTriggering.
  ///
  /// In en, this message translates to:
  /// **'Triggering...'**
  String get formsErrorLabTriggering;

  /// No description provided for @formsErrorLabRawPayload.
  ///
  /// In en, this message translates to:
  /// **'Raw Payload'**
  String get formsErrorLabRawPayload;

  /// No description provided for @formsCheckoutTabHeading.
  ///
  /// In en, this message translates to:
  /// **'Checkout'**
  String get formsCheckoutTabHeading;

  /// No description provided for @formsCheckoutTabShippingAddress.
  ///
  /// In en, this message translates to:
  /// **'Shipping Address'**
  String get formsCheckoutTabShippingAddress;

  /// No description provided for @formsCheckoutTabBillingAddress.
  ///
  /// In en, this message translates to:
  /// **'Billing Address'**
  String get formsCheckoutTabBillingAddress;

  /// No description provided for @formsCheckoutTabBillingSameAsShipping.
  ///
  /// In en, this message translates to:
  /// **'Same as shipping'**
  String get formsCheckoutTabBillingSameAsShipping;

  /// No description provided for @formsCheckoutTabStreet.
  ///
  /// In en, this message translates to:
  /// **'Street'**
  String get formsCheckoutTabStreet;

  /// No description provided for @formsCheckoutTabCity.
  ///
  /// In en, this message translates to:
  /// **'City'**
  String get formsCheckoutTabCity;

  /// No description provided for @formsCheckoutTabProvince.
  ///
  /// In en, this message translates to:
  /// **'Province / State'**
  String get formsCheckoutTabProvince;

  /// No description provided for @formsCheckoutTabPostalCode.
  ///
  /// In en, this message translates to:
  /// **'Postal Code'**
  String get formsCheckoutTabPostalCode;

  /// No description provided for @formsCheckoutTabCountry.
  ///
  /// In en, this message translates to:
  /// **'Country'**
  String get formsCheckoutTabCountry;

  /// No description provided for @formsCheckoutTabPhone.
  ///
  /// In en, this message translates to:
  /// **'Phone'**
  String get formsCheckoutTabPhone;

  /// No description provided for @formsCheckoutTabEmail.
  ///
  /// In en, this message translates to:
  /// **'Email'**
  String get formsCheckoutTabEmail;

  /// No description provided for @formsCheckoutTabConfirmEmail.
  ///
  /// In en, this message translates to:
  /// **'Confirm Email'**
  String get formsCheckoutTabConfirmEmail;

  /// No description provided for @formsCheckoutTabOrderSummary.
  ///
  /// In en, this message translates to:
  /// **'Order Summary'**
  String get formsCheckoutTabOrderSummary;

  /// No description provided for @formsCheckoutTabPlaceOrder.
  ///
  /// In en, this message translates to:
  /// **'Place Order'**
  String get formsCheckoutTabPlaceOrder;

  /// No description provided for @formsCheckoutTabPaymentMethod.
  ///
  /// In en, this message translates to:
  /// **'Payment Method'**
  String get formsCheckoutTabPaymentMethod;

  /// No description provided for @formsCheckoutTabAddPaymentMethod.
  ///
  /// In en, this message translates to:
  /// **'Add Payment Method'**
  String get formsCheckoutTabAddPaymentMethod;

  /// No description provided for @formsCheckoutTabStripeSetup.
  ///
  /// In en, this message translates to:
  /// **'Add card via Stripe'**
  String get formsCheckoutTabStripeSetup;

  /// No description provided for @formsCheckoutTabPaymentDeclined.
  ///
  /// In en, this message translates to:
  /// **'Payment declined'**
  String get formsCheckoutTabPaymentDeclined;

  /// No description provided for @formsCheckoutTabOrderPlaced.
  ///
  /// In en, this message translates to:
  /// **'Order placed successfully'**
  String get formsCheckoutTabOrderPlaced;

  /// No description provided for @formsCheckoutTabStreetRequired.
  ///
  /// In en, this message translates to:
  /// **'Street is required'**
  String get formsCheckoutTabStreetRequired;

  /// No description provided for @formsCheckoutTabCityRequired.
  ///
  /// In en, this message translates to:
  /// **'City is required'**
  String get formsCheckoutTabCityRequired;

  /// No description provided for @formsCheckoutTabProvinceRequired.
  ///
  /// In en, this message translates to:
  /// **'Province is required'**
  String get formsCheckoutTabProvinceRequired;

  /// No description provided for @formsCheckoutTabPostalCodeInvalid.
  ///
  /// In en, this message translates to:
  /// **'Invalid postal code'**
  String get formsCheckoutTabPostalCodeInvalid;

  /// No description provided for @formsCheckoutTabEmailInvalid.
  ///
  /// In en, this message translates to:
  /// **'Invalid email'**
  String get formsCheckoutTabEmailInvalid;

  /// No description provided for @formsCheckoutTabEmailMismatch.
  ///
  /// In en, this message translates to:
  /// **'Emails must match'**
  String get formsCheckoutTabEmailMismatch;

  /// No description provided for @formsCheckoutTabPaymentMethodRequired.
  ///
  /// In en, this message translates to:
  /// **'Payment method is required'**
  String get formsCheckoutTabPaymentMethodRequired;

  /// No description provided for @formsCheckoutTabOrderFailed.
  ///
  /// In en, this message translates to:
  /// **'Order failed. Please try again.'**
  String get formsCheckoutTabOrderFailed;

  /// No description provided for @formsCheckoutTabPlacing.
  ///
  /// In en, this message translates to:
  /// **'Placing Order...'**
  String get formsCheckoutTabPlacing;

  /// No description provided for @formsCheckoutTabPhoneInvalid.
  ///
  /// In en, this message translates to:
  /// **'Enter a valid phone number'**
  String get formsCheckoutTabPhoneInvalid;

  /// No description provided for @formsCheckoutTabPhoneHint.
  ///
  /// In en, this message translates to:
  /// **'Include your country code, e.g. +1 555 123 4567'**
  String get formsCheckoutTabPhoneHint;

  /// No description provided for @formsCheckoutTabPostalCodeHint.
  ///
  /// In en, this message translates to:
  /// **'Format depends on the country selected above'**
  String get formsCheckoutTabPostalCodeHint;

  /// No description provided for @formsContentEditorHeading.
  ///
  /// In en, this message translates to:
  /// **'Content Editor'**
  String get formsContentEditorHeading;

  /// No description provided for @formsContentEditorTitle.
  ///
  /// In en, this message translates to:
  /// **'Title'**
  String get formsContentEditorTitle;

  /// No description provided for @formsContentEditorTitlePlaceholder.
  ///
  /// In en, this message translates to:
  /// **'Enter title...'**
  String get formsContentEditorTitlePlaceholder;

  /// No description provided for @formsContentEditorSlug.
  ///
  /// In en, this message translates to:
  /// **'Slug'**
  String get formsContentEditorSlug;

  /// No description provided for @formsContentEditorTags.
  ///
  /// In en, this message translates to:
  /// **'Tags'**
  String get formsContentEditorTags;

  /// No description provided for @formsContentEditorTagsPlaceholder.
  ///
  /// In en, this message translates to:
  /// **'Add tags...'**
  String get formsContentEditorTagsPlaceholder;

  /// No description provided for @formsContentEditorCoverImage.
  ///
  /// In en, this message translates to:
  /// **'Cover Image'**
  String get formsContentEditorCoverImage;

  /// No description provided for @formsContentEditorBody.
  ///
  /// In en, this message translates to:
  /// **'Body'**
  String get formsContentEditorBody;

  /// No description provided for @formsContentEditorBodyPlaceholder.
  ///
  /// In en, this message translates to:
  /// **'Write your content...'**
  String get formsContentEditorBodyPlaceholder;

  /// No description provided for @formsContentEditorPreview.
  ///
  /// In en, this message translates to:
  /// **'Preview'**
  String get formsContentEditorPreview;

  /// No description provided for @formsContentEditorEdit.
  ///
  /// In en, this message translates to:
  /// **'Edit'**
  String get formsContentEditorEdit;

  /// No description provided for @formsContentEditorSaveDraft.
  ///
  /// In en, this message translates to:
  /// **'Save Draft'**
  String get formsContentEditorSaveDraft;

  /// No description provided for @formsContentEditorPublish.
  ///
  /// In en, this message translates to:
  /// **'Publish'**
  String get formsContentEditorPublish;

  /// No description provided for @formsContentEditorSchedule.
  ///
  /// In en, this message translates to:
  /// **'Schedule'**
  String get formsContentEditorSchedule;

  /// No description provided for @formsContentEditorPublished.
  ///
  /// In en, this message translates to:
  /// **'Published!'**
  String get formsContentEditorPublished;

  /// No description provided for @formsContentEditorScheduled.
  ///
  /// In en, this message translates to:
  /// **'Scheduled!'**
  String get formsContentEditorScheduled;

  /// No description provided for @formsContentEditorDraftSaved.
  ///
  /// In en, this message translates to:
  /// **'Draft saved'**
  String get formsContentEditorDraftSaved;

  /// No description provided for @formsContentEditorDraftRestored.
  ///
  /// In en, this message translates to:
  /// **'Draft restored from {time}'**
  String formsContentEditorDraftRestored(Object time);

  /// No description provided for @formsContentEditorDraftRestore.
  ///
  /// In en, this message translates to:
  /// **'Restore'**
  String get formsContentEditorDraftRestore;

  /// No description provided for @formsContentEditorDraftDiscard.
  ///
  /// In en, this message translates to:
  /// **'Discard'**
  String get formsContentEditorDraftDiscard;

  /// No description provided for @formsContentEditorDraftDiscardConfirm.
  ///
  /// In en, this message translates to:
  /// **'This draft will be permanently discarded.'**
  String get formsContentEditorDraftDiscardConfirm;

  /// No description provided for @formsContentEditorSimulateFailure.
  ///
  /// In en, this message translates to:
  /// **'Simulate failure'**
  String get formsContentEditorSimulateFailure;

  /// No description provided for @formsContentEditorUnsavedChanges.
  ///
  /// In en, this message translates to:
  /// **'You have unsaved changes'**
  String get formsContentEditorUnsavedChanges;

  /// No description provided for @formsContentEditorUnsavedDescription.
  ///
  /// In en, this message translates to:
  /// **'Your changes may not be saved'**
  String get formsContentEditorUnsavedDescription;

  /// No description provided for @formsContentEditorStay.
  ///
  /// In en, this message translates to:
  /// **'Stay'**
  String get formsContentEditorStay;

  /// No description provided for @formsContentEditorLeave.
  ///
  /// In en, this message translates to:
  /// **'Leave'**
  String get formsContentEditorLeave;

  /// No description provided for @formsContentEditorTitleRequired.
  ///
  /// In en, this message translates to:
  /// **'Title is required'**
  String get formsContentEditorTitleRequired;

  /// No description provided for @formsContentEditorSlugInvalid.
  ///
  /// In en, this message translates to:
  /// **'Only lowercase letters, numbers, and hyphens allowed'**
  String get formsContentEditorSlugInvalid;

  /// No description provided for @formsContentEditorScheduleDateRequired.
  ///
  /// In en, this message translates to:
  /// **'Schedule date is required'**
  String get formsContentEditorScheduleDateRequired;

  /// No description provided for @formsContentEditorPublishing.
  ///
  /// In en, this message translates to:
  /// **'Publishing...'**
  String get formsContentEditorPublishing;

  /// No description provided for @formsContentEditorScheduling.
  ///
  /// In en, this message translates to:
  /// **'Scheduling...'**
  String get formsContentEditorScheduling;

  /// No description provided for @formsContentEditorUntitled.
  ///
  /// In en, this message translates to:
  /// **'Untitled'**
  String get formsContentEditorUntitled;

  /// No description provided for @formsContentEditorTime.
  ///
  /// In en, this message translates to:
  /// **'Time'**
  String get formsContentEditorTime;

  /// No description provided for @formsContentEditorSlugHint.
  ///
  /// In en, this message translates to:
  /// **'Auto-generated from the title — edit here to customize the URL'**
  String get formsContentEditorSlugHint;

  /// No description provided for @formsFormBuilderHeading.
  ///
  /// In en, this message translates to:
  /// **'Form Builder'**
  String get formsFormBuilderHeading;

  /// No description provided for @formsFormBuilderBuilder.
  ///
  /// In en, this message translates to:
  /// **'Builder'**
  String get formsFormBuilderBuilder;

  /// No description provided for @formsFormBuilderPreview.
  ///
  /// In en, this message translates to:
  /// **'Preview'**
  String get formsFormBuilderPreview;

  /// No description provided for @formsFormBuilderAddField.
  ///
  /// In en, this message translates to:
  /// **'Add Field'**
  String get formsFormBuilderAddField;

  /// No description provided for @formsFormBuilderFieldType.
  ///
  /// In en, this message translates to:
  /// **'Type'**
  String get formsFormBuilderFieldType;

  /// No description provided for @formsFormBuilderFieldLabel.
  ///
  /// In en, this message translates to:
  /// **'Label'**
  String get formsFormBuilderFieldLabel;

  /// No description provided for @formsFormBuilderFieldRequired.
  ///
  /// In en, this message translates to:
  /// **'Required'**
  String get formsFormBuilderFieldRequired;

  /// No description provided for @formsFormBuilderFieldOptions.
  ///
  /// In en, this message translates to:
  /// **'Options'**
  String get formsFormBuilderFieldOptions;

  /// No description provided for @formsFormBuilderText.
  ///
  /// In en, this message translates to:
  /// **'Text'**
  String get formsFormBuilderText;

  /// No description provided for @formsFormBuilderSelect.
  ///
  /// In en, this message translates to:
  /// **'Select'**
  String get formsFormBuilderSelect;

  /// No description provided for @formsFormBuilderCheckbox.
  ///
  /// In en, this message translates to:
  /// **'Checkbox'**
  String get formsFormBuilderCheckbox;

  /// No description provided for @formsFormBuilderDate.
  ///
  /// In en, this message translates to:
  /// **'Date'**
  String get formsFormBuilderDate;

  /// No description provided for @formsFormBuilderMoveUp.
  ///
  /// In en, this message translates to:
  /// **'Move Up'**
  String get formsFormBuilderMoveUp;

  /// No description provided for @formsFormBuilderMoveDown.
  ///
  /// In en, this message translates to:
  /// **'Move Down'**
  String get formsFormBuilderMoveDown;

  /// No description provided for @formsFormBuilderRemoveField.
  ///
  /// In en, this message translates to:
  /// **'Remove'**
  String get formsFormBuilderRemoveField;

  /// No description provided for @formsFormBuilderExportConfig.
  ///
  /// In en, this message translates to:
  /// **'Export Config'**
  String get formsFormBuilderExportConfig;

  /// No description provided for @formsFormBuilderSubmitPreview.
  ///
  /// In en, this message translates to:
  /// **'Submit'**
  String get formsFormBuilderSubmitPreview;

  /// No description provided for @formsFormBuilderConfigCopied.
  ///
  /// In en, this message translates to:
  /// **'Config copied to clipboard'**
  String get formsFormBuilderConfigCopied;

  /// No description provided for @formsFormBuilderFieldNamesLabel.
  ///
  /// In en, this message translates to:
  /// **'Field names:'**
  String get formsFormBuilderFieldNamesLabel;

  /// No description provided for @formsFormBuilderUntitledField.
  ///
  /// In en, this message translates to:
  /// **'Untitled'**
  String get formsFormBuilderUntitledField;

  /// No description provided for @formsFormBuilderOptionsPlaceholder.
  ///
  /// In en, this message translates to:
  /// **'Comma-separated'**
  String get formsFormBuilderOptionsPlaceholder;

  /// No description provided for @formsEditableTableHeading.
  ///
  /// In en, this message translates to:
  /// **'Editable Table'**
  String get formsEditableTableHeading;

  /// No description provided for @formsEditableTableDescription.
  ///
  /// In en, this message translates to:
  /// **'Description'**
  String get formsEditableTableDescription;

  /// No description provided for @formsEditableTableQuantity.
  ///
  /// In en, this message translates to:
  /// **'Qty'**
  String get formsEditableTableQuantity;

  /// No description provided for @formsEditableTableUnitPrice.
  ///
  /// In en, this message translates to:
  /// **'Unit Price'**
  String get formsEditableTableUnitPrice;

  /// No description provided for @formsEditableTableTaxClass.
  ///
  /// In en, this message translates to:
  /// **'Tax Class'**
  String get formsEditableTableTaxClass;

  /// No description provided for @formsEditableTableAddRow.
  ///
  /// In en, this message translates to:
  /// **'Add Row'**
  String get formsEditableTableAddRow;

  /// No description provided for @formsEditableTableDuplicateRow.
  ///
  /// In en, this message translates to:
  /// **'Duplicate'**
  String get formsEditableTableDuplicateRow;

  /// No description provided for @formsEditableTableRemoveRow.
  ///
  /// In en, this message translates to:
  /// **'Remove'**
  String get formsEditableTableRemoveRow;

  /// No description provided for @formsEditableTableRemoveRowConfirm.
  ///
  /// In en, this message translates to:
  /// **'This row will be permanently deleted.'**
  String get formsEditableTableRemoveRowConfirm;

  /// No description provided for @formsEditableTableMoveUp.
  ///
  /// In en, this message translates to:
  /// **'Move Up'**
  String get formsEditableTableMoveUp;

  /// No description provided for @formsEditableTableMoveDown.
  ///
  /// In en, this message translates to:
  /// **'Move Down'**
  String get formsEditableTableMoveDown;

  /// No description provided for @formsEditableTableTotal.
  ///
  /// In en, this message translates to:
  /// **'Total'**
  String get formsEditableTableTotal;

  /// No description provided for @formsEditableTableSubtotal.
  ///
  /// In en, this message translates to:
  /// **'Subtotal'**
  String get formsEditableTableSubtotal;

  /// No description provided for @formsEditableTableTax.
  ///
  /// In en, this message translates to:
  /// **'Tax'**
  String get formsEditableTableTax;

  /// No description provided for @formsEditableTableSaveAll.
  ///
  /// In en, this message translates to:
  /// **'Save All'**
  String get formsEditableTableSaveAll;

  /// No description provided for @formsEditableTableSaving.
  ///
  /// In en, this message translates to:
  /// **'Saving...'**
  String get formsEditableTableSaving;

  /// No description provided for @formsEditableTableRowError.
  ///
  /// In en, this message translates to:
  /// **'Row rejected'**
  String get formsEditableTableRowError;

  /// No description provided for @formsEditableTableSaveSuccess.
  ///
  /// In en, this message translates to:
  /// **'All rows saved'**
  String get formsEditableTableSaveSuccess;

  /// No description provided for @formsEditableTableSaveFailed.
  ///
  /// In en, this message translates to:
  /// **'Some rows failed'**
  String get formsEditableTableSaveFailed;

  /// No description provided for @formsEditableTableDescRequired.
  ///
  /// In en, this message translates to:
  /// **'Description is required'**
  String get formsEditableTableDescRequired;

  /// No description provided for @formsEditableTableQtyMin.
  ///
  /// In en, this message translates to:
  /// **'Minimum quantity is 1'**
  String get formsEditableTableQtyMin;

  /// No description provided for @formsEditableTablePricePositive.
  ///
  /// In en, this message translates to:
  /// **'Price must be positive'**
  String get formsEditableTablePricePositive;

  /// No description provided for @formsEditableTableTaxClassRequired.
  ///
  /// In en, this message translates to:
  /// **'Select a tax class'**
  String get formsEditableTableTaxClassRequired;

  /// No description provided for @formsEditableTableNet.
  ///
  /// In en, this message translates to:
  /// **'Net'**
  String get formsEditableTableNet;

  /// No description provided for @formsEditableTableSavedBadge.
  ///
  /// In en, this message translates to:
  /// **'Saved'**
  String get formsEditableTableSavedBadge;

  /// No description provided for @formsEditableTableSaveRow.
  ///
  /// In en, this message translates to:
  /// **'Save row'**
  String get formsEditableTableSaveRow;

  /// No description provided for @formsEditableTableQuantityHint.
  ///
  /// In en, this message translates to:
  /// **'Whole numbers, 1 or more'**
  String get formsEditableTableQuantityHint;

  /// No description provided for @formsEditableTableUnitPriceHint.
  ///
  /// In en, this message translates to:
  /// **'Enter as a decimal, e.g. 19.99'**
  String get formsEditableTableUnitPriceHint;

  /// No description provided for @formsAdvancedHeading.
  ///
  /// In en, this message translates to:
  /// **'Advanced Form Patterns'**
  String get formsAdvancedHeading;

  /// No description provided for @formsAdvancedAccountType.
  ///
  /// In en, this message translates to:
  /// **'Account Type'**
  String get formsAdvancedAccountType;

  /// No description provided for @formsAdvancedPersonal.
  ///
  /// In en, this message translates to:
  /// **'Personal'**
  String get formsAdvancedPersonal;

  /// No description provided for @formsAdvancedBusiness.
  ///
  /// In en, this message translates to:
  /// **'Business'**
  String get formsAdvancedBusiness;

  /// No description provided for @formsAdvancedFullName.
  ///
  /// In en, this message translates to:
  /// **'Full Name'**
  String get formsAdvancedFullName;

  /// No description provided for @formsAdvancedEmail.
  ///
  /// In en, this message translates to:
  /// **'Email'**
  String get formsAdvancedEmail;

  /// No description provided for @formsAdvancedPassword.
  ///
  /// In en, this message translates to:
  /// **'Password'**
  String get formsAdvancedPassword;

  /// No description provided for @formsAdvancedCompanyName.
  ///
  /// In en, this message translates to:
  /// **'Company Name'**
  String get formsAdvancedCompanyName;

  /// No description provided for @formsAdvancedTaxId.
  ///
  /// In en, this message translates to:
  /// **'Tax ID'**
  String get formsAdvancedTaxId;

  /// No description provided for @formsAdvancedIndustry.
  ///
  /// In en, this message translates to:
  /// **'Industry'**
  String get formsAdvancedIndustry;

  /// No description provided for @formsAdvancedTeamMembers.
  ///
  /// In en, this message translates to:
  /// **'Team Members'**
  String get formsAdvancedTeamMembers;

  /// No description provided for @formsAdvancedAddMember.
  ///
  /// In en, this message translates to:
  /// **'Add Member'**
  String get formsAdvancedAddMember;

  /// No description provided for @formsAdvancedRemoveMember.
  ///
  /// In en, this message translates to:
  /// **'Remove'**
  String get formsAdvancedRemoveMember;

  /// No description provided for @formsAdvancedMemberName.
  ///
  /// In en, this message translates to:
  /// **'Name'**
  String get formsAdvancedMemberName;

  /// No description provided for @formsAdvancedMemberEmail.
  ///
  /// In en, this message translates to:
  /// **'Email'**
  String get formsAdvancedMemberEmail;

  /// No description provided for @formsAdvancedMemberRole.
  ///
  /// In en, this message translates to:
  /// **'Role'**
  String get formsAdvancedMemberRole;

  /// No description provided for @formsAdvancedSubmit.
  ///
  /// In en, this message translates to:
  /// **'Submit Registration'**
  String get formsAdvancedSubmit;

  /// No description provided for @formsAdvancedSubmitting.
  ///
  /// In en, this message translates to:
  /// **'Submitting...'**
  String get formsAdvancedSubmitting;

  /// No description provided for @formsAdvancedSubmitSuccess.
  ///
  /// In en, this message translates to:
  /// **'Registration submitted successfully'**
  String get formsAdvancedSubmitSuccess;

  /// No description provided for @formsAdvancedSubmitFailed.
  ///
  /// In en, this message translates to:
  /// **'Registration failed — check the errors below'**
  String get formsAdvancedSubmitFailed;

  /// No description provided for @formsAdvancedFullNameMin.
  ///
  /// In en, this message translates to:
  /// **'Full name must be at least 2 characters'**
  String get formsAdvancedFullNameMin;

  /// No description provided for @formsAdvancedEmailInvalid.
  ///
  /// In en, this message translates to:
  /// **'Invalid email address'**
  String get formsAdvancedEmailInvalid;

  /// No description provided for @formsAdvancedPasswordMin.
  ///
  /// In en, this message translates to:
  /// **'Password must be at least 8 characters'**
  String get formsAdvancedPasswordMin;

  /// No description provided for @formsAdvancedCompanyNameRequired.
  ///
  /// In en, this message translates to:
  /// **'Company name is required'**
  String get formsAdvancedCompanyNameRequired;

  /// No description provided for @formsAdvancedTaxIdInvalid.
  ///
  /// In en, this message translates to:
  /// **'Format: XX1234567890 (2 letters + 2-13 alphanumeric)'**
  String get formsAdvancedTaxIdInvalid;

  /// No description provided for @formsAdvancedIndustryRequired.
  ///
  /// In en, this message translates to:
  /// **'Select an industry'**
  String get formsAdvancedIndustryRequired;

  /// No description provided for @formsAdvancedMemberNameRequired.
  ///
  /// In en, this message translates to:
  /// **'Name is required'**
  String get formsAdvancedMemberNameRequired;

  /// No description provided for @formsAdvancedMemberEmailInvalid.
  ///
  /// In en, this message translates to:
  /// **'Invalid email address'**
  String get formsAdvancedMemberEmailInvalid;

  /// No description provided for @formsAdvancedMemberRoleRequired.
  ///
  /// In en, this message translates to:
  /// **'Select a role'**
  String get formsAdvancedMemberRoleRequired;

  /// No description provided for @formsAdvancedFullNamePlaceholder.
  ///
  /// In en, this message translates to:
  /// **'John Doe'**
  String get formsAdvancedFullNamePlaceholder;

  /// No description provided for @formsAdvancedFullNameInfo.
  ///
  /// In en, this message translates to:
  /// **'Enter your full name — must be at least 2 characters'**
  String get formsAdvancedFullNameInfo;

  /// No description provided for @formsAdvancedEmailPlaceholder.
  ///
  /// In en, this message translates to:
  /// **'john@example.com'**
  String get formsAdvancedEmailPlaceholder;

  /// No description provided for @formsAdvancedEmailInfo.
  ///
  /// In en, this message translates to:
  /// **'You must provide a valid email address in the format user@example.com'**
  String get formsAdvancedEmailInfo;

  /// No description provided for @formsAdvancedPasswordPlaceholder.
  ///
  /// In en, this message translates to:
  /// **'Create a strong password'**
  String get formsAdvancedPasswordPlaceholder;

  /// No description provided for @formsAdvancedPasswordInfo.
  ///
  /// In en, this message translates to:
  /// **'Create a strong password with at least 8 characters including a number'**
  String get formsAdvancedPasswordInfo;

  /// No description provided for @formsAdvancedCompanyNamePlaceholder.
  ///
  /// In en, this message translates to:
  /// **'Acme Inc.'**
  String get formsAdvancedCompanyNamePlaceholder;

  /// No description provided for @formsAdvancedCompanyNameInfo.
  ///
  /// In en, this message translates to:
  /// **'Enter your registered business or company name'**
  String get formsAdvancedCompanyNameInfo;

  /// No description provided for @formsAdvancedTaxIdPlaceholder.
  ///
  /// In en, this message translates to:
  /// **'XX1234567890'**
  String get formsAdvancedTaxIdPlaceholder;

  /// No description provided for @formsAdvancedTaxIdInfo.
  ///
  /// In en, this message translates to:
  /// **'Tax identification number — format: 2 letters followed by 2-13 alphanumeric characters'**
  String get formsAdvancedTaxIdInfo;

  /// No description provided for @formsAdvancedIndustryPlaceholder.
  ///
  /// In en, this message translates to:
  /// **'Select industry'**
  String get formsAdvancedIndustryPlaceholder;

  /// No description provided for @formsAdvancedIndustryInfo.
  ///
  /// In en, this message translates to:
  /// **'Choose the industry your business operates in'**
  String get formsAdvancedIndustryInfo;

  /// No description provided for @formsAdvancedMemberNamePlaceholder.
  ///
  /// In en, this message translates to:
  /// **'Jane Smith'**
  String get formsAdvancedMemberNamePlaceholder;

  /// No description provided for @formsAdvancedMemberNameInfo.
  ///
  /// In en, this message translates to:
  /// **'Enter the team member\'s full name'**
  String get formsAdvancedMemberNameInfo;

  /// No description provided for @formsAdvancedMemberEmailPlaceholder.
  ///
  /// In en, this message translates to:
  /// **'jane@company.com'**
  String get formsAdvancedMemberEmailPlaceholder;

  /// No description provided for @formsAdvancedMemberEmailInfo.
  ///
  /// In en, this message translates to:
  /// **'Enter the team member\'s email address'**
  String get formsAdvancedMemberEmailInfo;

  /// No description provided for @formsAdvancedMemberRolePlaceholder.
  ///
  /// In en, this message translates to:
  /// **'Select role'**
  String get formsAdvancedMemberRolePlaceholder;

  /// No description provided for @formsAdvancedMemberRoleInfo.
  ///
  /// In en, this message translates to:
  /// **'Choose the role and permissions for this team member'**
  String get formsAdvancedMemberRoleInfo;

  /// No description provided for @formsAdvancedAccountTypeInfo.
  ///
  /// In en, this message translates to:
  /// **'Select whether this is a personal or business account — business accounts require additional information'**
  String get formsAdvancedAccountTypeInfo;

  /// No description provided for @formsAdvancedTeamMembersInfo.
  ///
  /// In en, this message translates to:
  /// **'Add team members who will have access to this account'**
  String get formsAdvancedTeamMembersInfo;

  /// No description provided for @formsAdvancedRoleDeveloper.
  ///
  /// In en, this message translates to:
  /// **'Developer'**
  String get formsAdvancedRoleDeveloper;

  /// No description provided for @formsAdvancedRoleDesigner.
  ///
  /// In en, this message translates to:
  /// **'Designer'**
  String get formsAdvancedRoleDesigner;

  /// No description provided for @formsAdvancedRoleManager.
  ///
  /// In en, this message translates to:
  /// **'Manager'**
  String get formsAdvancedRoleManager;

  /// No description provided for @formsAdvancedRoleViewer.
  ///
  /// In en, this message translates to:
  /// **'Viewer'**
  String get formsAdvancedRoleViewer;

  /// No description provided for @formsAdvancedIndustryTechnology.
  ///
  /// In en, this message translates to:
  /// **'Technology'**
  String get formsAdvancedIndustryTechnology;

  /// No description provided for @formsAdvancedIndustryFinance.
  ///
  /// In en, this message translates to:
  /// **'Finance'**
  String get formsAdvancedIndustryFinance;

  /// No description provided for @formsAdvancedIndustryHealthcare.
  ///
  /// In en, this message translates to:
  /// **'Healthcare'**
  String get formsAdvancedIndustryHealthcare;

  /// No description provided for @formsAdvancedIndustryEducation.
  ///
  /// In en, this message translates to:
  /// **'Education'**
  String get formsAdvancedIndustryEducation;

  /// No description provided for @formsAdvancedIndustryEcommerce.
  ///
  /// In en, this message translates to:
  /// **'E-Commerce'**
  String get formsAdvancedIndustryEcommerce;

  /// No description provided for @formsAdvancedIndustryOther.
  ///
  /// In en, this message translates to:
  /// **'Other'**
  String get formsAdvancedIndustryOther;

  /// No description provided for @formsAdvancedEmailAlreadyMember.
  ///
  /// In en, this message translates to:
  /// **'This email is already registered'**
  String get formsAdvancedEmailAlreadyMember;

  /// No description provided for @formsAdvancedFormErrors.
  ///
  /// In en, this message translates to:
  /// **'Please fix the errors below before submitting'**
  String get formsAdvancedFormErrors;

  /// No description provided for @formsElementsHeading.
  ///
  /// In en, this message translates to:
  /// **'Form Elements'**
  String get formsElementsHeading;

  /// No description provided for @formsElementsDescription.
  ///
  /// In en, this message translates to:
  /// **'Input groups, selects, textareas, checkboxes, radios, toggles, and validation states'**
  String get formsElementsDescription;

  /// No description provided for @formsElementsSection_defaultInputs.
  ///
  /// In en, this message translates to:
  /// **'Default Inputs'**
  String get formsElementsSection_defaultInputs;

  /// No description provided for @formsElementsSection_inputGroups.
  ///
  /// In en, this message translates to:
  /// **'Input Groups'**
  String get formsElementsSection_inputGroups;

  /// No description provided for @formsElementsSection_selectInputs.
  ///
  /// In en, this message translates to:
  /// **'Select Inputs'**
  String get formsElementsSection_selectInputs;

  /// No description provided for @formsElementsSection_textarea.
  ///
  /// In en, this message translates to:
  /// **'Textarea Input Field'**
  String get formsElementsSection_textarea;

  /// No description provided for @formsElementsSection_inputStates.
  ///
  /// In en, this message translates to:
  /// **'Input States'**
  String get formsElementsSection_inputStates;

  /// No description provided for @formsElementsSection_fileInput.
  ///
  /// In en, this message translates to:
  /// **'File Input'**
  String get formsElementsSection_fileInput;

  /// No description provided for @formsElementsSection_dropzone.
  ///
  /// In en, this message translates to:
  /// **'Dropzone'**
  String get formsElementsSection_dropzone;

  /// No description provided for @formsElementsSection_checkboxes.
  ///
  /// In en, this message translates to:
  /// **'Checkboxes'**
  String get formsElementsSection_checkboxes;

  /// No description provided for @formsElementsSection_radioButtons.
  ///
  /// In en, this message translates to:
  /// **'Radio Buttons'**
  String get formsElementsSection_radioButtons;

  /// No description provided for @formsElementsSection_toggleSwitches.
  ///
  /// In en, this message translates to:
  /// **'Toggle Switches'**
  String get formsElementsSection_toggleSwitches;

  /// No description provided for @formsElementsSection_dateTimePickers.
  ///
  /// In en, this message translates to:
  /// **'Date & Time Pickers'**
  String get formsElementsSection_dateTimePickers;

  /// No description provided for @formsElementsSection_formValidation.
  ///
  /// In en, this message translates to:
  /// **'Form with Validation'**
  String get formsElementsSection_formValidation;

  /// No description provided for @formsElementsInput_label.
  ///
  /// In en, this message translates to:
  /// **'Input'**
  String get formsElementsInput_label;

  /// No description provided for @formsElementsInput_placeholder.
  ///
  /// In en, this message translates to:
  /// **'Simple input field'**
  String get formsElementsInput_placeholder;

  /// No description provided for @formsElementsInput_info.
  ///
  /// In en, this message translates to:
  /// **'A standard text input for entering any type of information'**
  String get formsElementsInput_info;

  /// No description provided for @formsElementsInputWithPlaceholder_label.
  ///
  /// In en, this message translates to:
  /// **'With Placeholder'**
  String get formsElementsInputWithPlaceholder_label;

  /// No description provided for @formsElementsInputWithPlaceholder_placeholder.
  ///
  /// In en, this message translates to:
  /// **'Placeholder text'**
  String get formsElementsInputWithPlaceholder_placeholder;

  /// No description provided for @formsElementsInputWithPlaceholder_info.
  ///
  /// In en, this message translates to:
  /// **'Shows placeholder text when empty, demonstrating user guidance'**
  String get formsElementsInputWithPlaceholder_info;

  /// No description provided for @formsElementsSelectInput_label.
  ///
  /// In en, this message translates to:
  /// **'Select Input'**
  String get formsElementsSelectInput_label;

  /// No description provided for @formsElementsSelectInput_info.
  ///
  /// In en, this message translates to:
  /// **'A dropdown menu for choosing a single option from a list'**
  String get formsElementsSelectInput_info;

  /// No description provided for @formsElementsPasswordInput_label.
  ///
  /// In en, this message translates to:
  /// **'Password Input'**
  String get formsElementsPasswordInput_label;

  /// No description provided for @formsElementsPasswordInput_placeholder.
  ///
  /// In en, this message translates to:
  /// **'••••••••'**
  String get formsElementsPasswordInput_placeholder;

  /// No description provided for @formsElementsPasswordInput_info.
  ///
  /// In en, this message translates to:
  /// **'Masks characters for secure password entry'**
  String get formsElementsPasswordInput_info;

  /// No description provided for @formsElementsDatePicker_label.
  ///
  /// In en, this message translates to:
  /// **'Date Picker'**
  String get formsElementsDatePicker_label;

  /// No description provided for @formsElementsDatePicker_info.
  ///
  /// In en, this message translates to:
  /// **'Opens a native date picker for selecting a calendar date'**
  String get formsElementsDatePicker_info;

  /// No description provided for @formsElementsTimeSelect_label.
  ///
  /// In en, this message translates to:
  /// **'Time Select'**
  String get formsElementsTimeSelect_label;

  /// No description provided for @formsElementsTimeSelect_info.
  ///
  /// In en, this message translates to:
  /// **'Native time picker for selecting hours and minutes'**
  String get formsElementsTimeSelect_info;

  /// No description provided for @formsElementsEmailGroup_label.
  ///
  /// In en, this message translates to:
  /// **'Email'**
  String get formsElementsEmailGroup_label;

  /// No description provided for @formsElementsEmailGroup_placeholder.
  ///
  /// In en, this message translates to:
  /// **'your@email.com'**
  String get formsElementsEmailGroup_placeholder;

  /// No description provided for @formsElementsEmailGroup_info.
  ///
  /// In en, this message translates to:
  /// **'Enter a valid email address in the format user@example.com'**
  String get formsElementsEmailGroup_info;

  /// No description provided for @formsElementsPhoneGroup_label.
  ///
  /// In en, this message translates to:
  /// **'Phone'**
  String get formsElementsPhoneGroup_label;

  /// No description provided for @formsElementsPhoneGroup_placeholder.
  ///
  /// In en, this message translates to:
  /// **'555-0123'**
  String get formsElementsPhoneGroup_placeholder;

  /// No description provided for @formsElementsPhoneGroup_info.
  ///
  /// In en, this message translates to:
  /// **'Phone number with country code prefix selector'**
  String get formsElementsPhoneGroup_info;

  /// No description provided for @formsElementsCardNumberGroup_label.
  ///
  /// In en, this message translates to:
  /// **'Card Number'**
  String get formsElementsCardNumberGroup_label;

  /// No description provided for @formsElementsCardNumberGroup_placeholder.
  ///
  /// In en, this message translates to:
  /// **'4242 4242 4242 4242'**
  String get formsElementsCardNumberGroup_placeholder;

  /// No description provided for @formsElementsCardNumberGroup_info.
  ///
  /// In en, this message translates to:
  /// **'Credit card number with card type icon indicator'**
  String get formsElementsCardNumberGroup_info;

  /// No description provided for @formsElementsWebsiteGroup_label.
  ///
  /// In en, this message translates to:
  /// **'Website'**
  String get formsElementsWebsiteGroup_label;

  /// No description provided for @formsElementsWebsiteGroup_placeholder.
  ///
  /// In en, this message translates to:
  /// **'example.com'**
  String get formsElementsWebsiteGroup_placeholder;

  /// No description provided for @formsElementsWebsiteGroup_info.
  ///
  /// In en, this message translates to:
  /// **'Website URL with automatic http:// protocol prefix'**
  String get formsElementsWebsiteGroup_info;

  /// No description provided for @formsElementsReferralGroup_label.
  ///
  /// In en, this message translates to:
  /// **'Referral Code'**
  String get formsElementsReferralGroup_label;

  /// No description provided for @formsElementsReferralGroup_placeholder.
  ///
  /// In en, this message translates to:
  /// **'REF-XXXX'**
  String get formsElementsReferralGroup_placeholder;

  /// No description provided for @formsElementsReferralGroup_info.
  ///
  /// In en, this message translates to:
  /// **'A referral code with one-click copy button'**
  String get formsElementsReferralGroup_info;

  /// No description provided for @formsElementsAmountGroup_label.
  ///
  /// In en, this message translates to:
  /// **'Amount'**
  String get formsElementsAmountGroup_label;

  /// No description provided for @formsElementsAmountGroup_placeholder.
  ///
  /// In en, this message translates to:
  /// **'0.00'**
  String get formsElementsAmountGroup_placeholder;

  /// No description provided for @formsElementsAmountGroup_info.
  ///
  /// In en, this message translates to:
  /// **'Currency amount input with \$ prefix and USD suffix'**
  String get formsElementsAmountGroup_info;

  /// No description provided for @formsElementsCountryOption_us.
  ///
  /// In en, this message translates to:
  /// **'US +1'**
  String get formsElementsCountryOption_us;

  /// No description provided for @formsElementsCountryOption_gb.
  ///
  /// In en, this message translates to:
  /// **'GB +44'**
  String get formsElementsCountryOption_gb;

  /// No description provided for @formsElementsCountryOption_ca.
  ///
  /// In en, this message translates to:
  /// **'CA +1'**
  String get formsElementsCountryOption_ca;

  /// No description provided for @formsElementsCountryOption_au.
  ///
  /// In en, this message translates to:
  /// **'AU +61'**
  String get formsElementsCountryOption_au;

  /// No description provided for @formsElementsCountryOption_tr.
  ///
  /// In en, this message translates to:
  /// **'TR +90'**
  String get formsElementsCountryOption_tr;

  /// No description provided for @formsElementsSingleSelect_label.
  ///
  /// In en, this message translates to:
  /// **'Single Select'**
  String get formsElementsSingleSelect_label;

  /// No description provided for @formsElementsSingleSelect_placeholder.
  ///
  /// In en, this message translates to:
  /// **'Select an option'**
  String get formsElementsSingleSelect_placeholder;

  /// No description provided for @formsElementsSingleSelect_info.
  ///
  /// In en, this message translates to:
  /// **'A native dropdown for selecting a single option'**
  String get formsElementsSingleSelect_info;

  /// No description provided for @formsElementsSingleSelect_option1.
  ///
  /// In en, this message translates to:
  /// **'Marketing'**
  String get formsElementsSingleSelect_option1;

  /// No description provided for @formsElementsSingleSelect_option2.
  ///
  /// In en, this message translates to:
  /// **'Template'**
  String get formsElementsSingleSelect_option2;

  /// No description provided for @formsElementsSingleSelect_option3.
  ///
  /// In en, this message translates to:
  /// **'Development'**
  String get formsElementsSingleSelect_option3;

  /// No description provided for @formsElementsMultiSelect_label.
  ///
  /// In en, this message translates to:
  /// **'Multi Select'**
  String get formsElementsMultiSelect_label;

  /// No description provided for @formsElementsMultiSelect_placeholder.
  ///
  /// In en, this message translates to:
  /// **'Select options'**
  String get formsElementsMultiSelect_placeholder;

  /// No description provided for @formsElementsMultiSelect_info.
  ///
  /// In en, this message translates to:
  /// **'Select multiple options from a list — each selection appears as a removable chip'**
  String get formsElementsMultiSelect_info;

  /// No description provided for @formsElementsMultiSelect_option1.
  ///
  /// In en, this message translates to:
  /// **'React'**
  String get formsElementsMultiSelect_option1;

  /// No description provided for @formsElementsMultiSelect_option2.
  ///
  /// In en, this message translates to:
  /// **'Vue'**
  String get formsElementsMultiSelect_option2;

  /// No description provided for @formsElementsMultiSelect_option3.
  ///
  /// In en, this message translates to:
  /// **'Angular'**
  String get formsElementsMultiSelect_option3;

  /// No description provided for @formsElementsMultiSelect_chipAdd.
  ///
  /// In en, this message translates to:
  /// **'+ Add'**
  String get formsElementsMultiSelect_chipAdd;

  /// No description provided for @formsElementsTextareaDefault_label.
  ///
  /// In en, this message translates to:
  /// **'Default'**
  String get formsElementsTextareaDefault_label;

  /// No description provided for @formsElementsTextareaDefault_placeholder.
  ///
  /// In en, this message translates to:
  /// **'Write your message here...'**
  String get formsElementsTextareaDefault_placeholder;

  /// No description provided for @formsElementsTextareaDefault_info.
  ///
  /// In en, this message translates to:
  /// **'A standard multi-line text area for longer content'**
  String get formsElementsTextareaDefault_info;

  /// No description provided for @formsElementsTextareaCharCount_label.
  ///
  /// In en, this message translates to:
  /// **'With Char Count'**
  String get formsElementsTextareaCharCount_label;

  /// No description provided for @formsElementsTextareaCharCount_placeholder.
  ///
  /// In en, this message translates to:
  /// **'Max 100 chars...'**
  String get formsElementsTextareaCharCount_placeholder;

  /// No description provided for @formsElementsTextareaCharCount_info.
  ///
  /// In en, this message translates to:
  /// **'Shows a live character counter that changes color as you approach the limit'**
  String get formsElementsTextareaCharCount_info;

  /// No description provided for @formsElementsTextareaDisabled_label.
  ///
  /// In en, this message translates to:
  /// **'Disabled'**
  String get formsElementsTextareaDisabled_label;

  /// No description provided for @formsElementsTextareaDisabled_placeholder.
  ///
  /// In en, this message translates to:
  /// **'Cannot edit'**
  String get formsElementsTextareaDisabled_placeholder;

  /// No description provided for @formsElementsTextareaDisabled_info.
  ///
  /// In en, this message translates to:
  /// **'A read-only textarea that cannot be modified'**
  String get formsElementsTextareaDisabled_info;

  /// No description provided for @formsElementsErrorState_label.
  ///
  /// In en, this message translates to:
  /// **'Error'**
  String get formsElementsErrorState_label;

  /// No description provided for @formsElementsErrorState_placeholder.
  ///
  /// In en, this message translates to:
  /// **'Invalid value'**
  String get formsElementsErrorState_placeholder;

  /// No description provided for @formsElementsErrorState_info.
  ///
  /// In en, this message translates to:
  /// **'Demonstrates the error visual state with a validation message'**
  String get formsElementsErrorState_info;

  /// No description provided for @formsElementsErrorState_message.
  ///
  /// In en, this message translates to:
  /// **'This field has an error'**
  String get formsElementsErrorState_message;

  /// No description provided for @formsElementsSuccessState_label.
  ///
  /// In en, this message translates to:
  /// **'Success'**
  String get formsElementsSuccessState_label;

  /// No description provided for @formsElementsSuccessState_placeholder.
  ///
  /// In en, this message translates to:
  /// **'Valid value'**
  String get formsElementsSuccessState_placeholder;

  /// No description provided for @formsElementsSuccessState_info.
  ///
  /// In en, this message translates to:
  /// **'Demonstrates the success visual state with a validation message'**
  String get formsElementsSuccessState_info;

  /// No description provided for @formsElementsSuccessState_message.
  ///
  /// In en, this message translates to:
  /// **'Looks good!'**
  String get formsElementsSuccessState_message;

  /// No description provided for @formsElementsFileInput_label.
  ///
  /// In en, this message translates to:
  /// **'Upload File'**
  String get formsElementsFileInput_label;

  /// No description provided for @formsElementsFileInput_info.
  ///
  /// In en, this message translates to:
  /// **'A file picker that opens the system file browser'**
  String get formsElementsFileInput_info;

  /// No description provided for @formsElementsFileInput_buttonLabel.
  ///
  /// In en, this message translates to:
  /// **'Choose File'**
  String get formsElementsFileInput_buttonLabel;

  /// No description provided for @formsElementsDropzone_info.
  ///
  /// In en, this message translates to:
  /// **'Drag and drop files or click to browse — supports multiple file uploads'**
  String get formsElementsDropzone_info;

  /// No description provided for @formsElementsDropzone_text.
  ///
  /// In en, this message translates to:
  /// **'Drag & drop your files here or click to browse'**
  String get formsElementsDropzone_text;

  /// No description provided for @formsElementsDropzone_formats.
  ///
  /// In en, this message translates to:
  /// **'Accepted formats: JPEG, PNG, WebP, GIF, AVIF — max 5 MB per file'**
  String get formsElementsDropzone_formats;

  /// No description provided for @formsElementsCheckboxDefault_label.
  ///
  /// In en, this message translates to:
  /// **'Default'**
  String get formsElementsCheckboxDefault_label;

  /// No description provided for @formsElementsCheckboxDefault_info.
  ///
  /// In en, this message translates to:
  /// **'An unchecked checkbox in its default state'**
  String get formsElementsCheckboxDefault_info;

  /// No description provided for @formsElementsCheckboxChecked_label.
  ///
  /// In en, this message translates to:
  /// **'Checked'**
  String get formsElementsCheckboxChecked_label;

  /// No description provided for @formsElementsCheckboxChecked_info.
  ///
  /// In en, this message translates to:
  /// **'A checkbox in its checked/selected state'**
  String get formsElementsCheckboxChecked_info;

  /// No description provided for @formsElementsCheckboxIndeterminate_label.
  ///
  /// In en, this message translates to:
  /// **'Indeterminate'**
  String get formsElementsCheckboxIndeterminate_label;

  /// No description provided for @formsElementsCheckboxIndeterminate_info.
  ///
  /// In en, this message translates to:
  /// **'A checkbox in an indeterminate (partial) state, used for group selection'**
  String get formsElementsCheckboxIndeterminate_info;

  /// No description provided for @formsElementsRadioSelected_label.
  ///
  /// In en, this message translates to:
  /// **'Selected'**
  String get formsElementsRadioSelected_label;

  /// No description provided for @formsElementsRadioSelected_info.
  ///
  /// In en, this message translates to:
  /// **'A radio button in its selected state'**
  String get formsElementsRadioSelected_info;

  /// No description provided for @formsElementsRadioUnselected_label.
  ///
  /// In en, this message translates to:
  /// **'Unselected'**
  String get formsElementsRadioUnselected_label;

  /// No description provided for @formsElementsRadioUnselected_info.
  ///
  /// In en, this message translates to:
  /// **'A radio button in its unselected/default state'**
  String get formsElementsRadioUnselected_info;

  /// No description provided for @formsElementsRadioDisabled_label.
  ///
  /// In en, this message translates to:
  /// **'Disabled'**
  String get formsElementsRadioDisabled_label;

  /// No description provided for @formsElementsRadioDisabled_info.
  ///
  /// In en, this message translates to:
  /// **'A disabled radio button that cannot be interacted with'**
  String get formsElementsRadioDisabled_info;

  /// No description provided for @formsElementsToggleDefault_label.
  ///
  /// In en, this message translates to:
  /// **'Default'**
  String get formsElementsToggleDefault_label;

  /// No description provided for @formsElementsToggleDefault_info.
  ///
  /// In en, this message translates to:
  /// **'A toggle switch in its off/default state'**
  String get formsElementsToggleDefault_info;

  /// No description provided for @formsElementsToggleChecked_label.
  ///
  /// In en, this message translates to:
  /// **'Checked'**
  String get formsElementsToggleChecked_label;

  /// No description provided for @formsElementsToggleChecked_info.
  ///
  /// In en, this message translates to:
  /// **'A toggle switch in its on/checked state'**
  String get formsElementsToggleChecked_info;

  /// No description provided for @formsElementsDateTimeDate_label.
  ///
  /// In en, this message translates to:
  /// **'Date Picker'**
  String get formsElementsDateTimeDate_label;

  /// No description provided for @formsElementsDateTimeDate_info.
  ///
  /// In en, this message translates to:
  /// **'Select a date using the native browser date picker'**
  String get formsElementsDateTimeDate_info;

  /// No description provided for @formsElementsDateTimeTime_label.
  ///
  /// In en, this message translates to:
  /// **'Time Picker'**
  String get formsElementsDateTimeTime_label;

  /// No description provided for @formsElementsDateTimeTime_info.
  ///
  /// In en, this message translates to:
  /// **'Select a time using the native browser time picker'**
  String get formsElementsDateTimeTime_info;

  /// No description provided for @formsElementsValidation_heading.
  ///
  /// In en, this message translates to:
  /// **'Form with Validation'**
  String get formsElementsValidation_heading;

  /// No description provided for @formsElementsValidation_info.
  ///
  /// In en, this message translates to:
  /// **'TanStack Form fields with onChange Zod validation'**
  String get formsElementsValidation_info;

  /// No description provided for @formsElementsValidationFullName_label.
  ///
  /// In en, this message translates to:
  /// **'Full Name'**
  String get formsElementsValidationFullName_label;

  /// No description provided for @formsElementsValidationFullName_placeholder.
  ///
  /// In en, this message translates to:
  /// **'John Doe'**
  String get formsElementsValidationFullName_placeholder;

  /// No description provided for @formsElementsValidationFullName_info.
  ///
  /// In en, this message translates to:
  /// **'Enter your full name — must be at least 2 characters'**
  String get formsElementsValidationFullName_info;

  /// No description provided for @formsElementsValidationEmail_label.
  ///
  /// In en, this message translates to:
  /// **'Email'**
  String get formsElementsValidationEmail_label;

  /// No description provided for @formsElementsValidationEmail_placeholder.
  ///
  /// In en, this message translates to:
  /// **'john@example.com'**
  String get formsElementsValidationEmail_placeholder;

  /// No description provided for @formsElementsValidationEmail_info.
  ///
  /// In en, this message translates to:
  /// **'You must provide a valid email address in the format user@example.com'**
  String get formsElementsValidationEmail_info;

  /// No description provided for @formsElementsValidationPassword_label.
  ///
  /// In en, this message translates to:
  /// **'Password'**
  String get formsElementsValidationPassword_label;

  /// No description provided for @formsElementsValidationPassword_placeholder.
  ///
  /// In en, this message translates to:
  /// **'Create a password'**
  String get formsElementsValidationPassword_placeholder;

  /// No description provided for @formsElementsValidationPassword_info.
  ///
  /// In en, this message translates to:
  /// **'Create a strong password with at least 8 characters including a number'**
  String get formsElementsValidationPassword_info;

  /// No description provided for @formsElementsValidationBio_label.
  ///
  /// In en, this message translates to:
  /// **'Bio'**
  String get formsElementsValidationBio_label;

  /// No description provided for @formsElementsValidationBio_placeholder.
  ///
  /// In en, this message translates to:
  /// **'Tell us about yourself'**
  String get formsElementsValidationBio_placeholder;

  /// No description provided for @formsElementsValidationBio_info.
  ///
  /// In en, this message translates to:
  /// **'A short biography describing yourself, up to 200 characters'**
  String get formsElementsValidationBio_info;

  /// No description provided for @formsLayoutsHeading.
  ///
  /// In en, this message translates to:
  /// **'Form Layouts'**
  String get formsLayoutsHeading;

  /// No description provided for @formsLayoutsDescription.
  ///
  /// In en, this message translates to:
  /// **'Basic stacked, two-column grid, icon-prefixed, and sectioned card form patterns'**
  String get formsLayoutsDescription;

  /// No description provided for @formsLayoutsContact_label.
  ///
  /// In en, this message translates to:
  /// **'Contact Form'**
  String get formsLayoutsContact_label;

  /// No description provided for @formsLayoutsContact_description.
  ///
  /// In en, this message translates to:
  /// **'Basic single-column form with name, email, subject, and message'**
  String get formsLayoutsContact_description;

  /// No description provided for @formsLayoutsContactFullName_label.
  ///
  /// In en, this message translates to:
  /// **'Full Name'**
  String get formsLayoutsContactFullName_label;

  /// No description provided for @formsLayoutsContactFullName_placeholder.
  ///
  /// In en, this message translates to:
  /// **'John Doe'**
  String get formsLayoutsContactFullName_placeholder;

  /// No description provided for @formsLayoutsContactFullName_info.
  ///
  /// In en, this message translates to:
  /// **'Enter your full name as it appears on official documents'**
  String get formsLayoutsContactFullName_info;

  /// No description provided for @formsLayoutsContactEmail_label.
  ///
  /// In en, this message translates to:
  /// **'Email'**
  String get formsLayoutsContactEmail_label;

  /// No description provided for @formsLayoutsContactEmail_placeholder.
  ///
  /// In en, this message translates to:
  /// **'john@example.com'**
  String get formsLayoutsContactEmail_placeholder;

  /// No description provided for @formsLayoutsContactEmail_info.
  ///
  /// In en, this message translates to:
  /// **'You must provide a valid email address in the format user@example.com'**
  String get formsLayoutsContactEmail_info;

  /// No description provided for @formsLayoutsContactSubject_label.
  ///
  /// In en, this message translates to:
  /// **'Subject'**
  String get formsLayoutsContactSubject_label;

  /// No description provided for @formsLayoutsContactSubject_info.
  ///
  /// In en, this message translates to:
  /// **'Select the category that best describes your inquiry'**
  String get formsLayoutsContactSubject_info;

  /// No description provided for @formsLayoutsContactSubject_placeholder.
  ///
  /// In en, this message translates to:
  /// **'Select Subject'**
  String get formsLayoutsContactSubject_placeholder;

  /// No description provided for @formsLayoutsContactSubject_general.
  ///
  /// In en, this message translates to:
  /// **'General Inquiry'**
  String get formsLayoutsContactSubject_general;

  /// No description provided for @formsLayoutsContactSubject_support.
  ///
  /// In en, this message translates to:
  /// **'Support'**
  String get formsLayoutsContactSubject_support;

  /// No description provided for @formsLayoutsContactSubject_feedback.
  ///
  /// In en, this message translates to:
  /// **'Feedback'**
  String get formsLayoutsContactSubject_feedback;

  /// No description provided for @formsLayoutsContactSubject_other.
  ///
  /// In en, this message translates to:
  /// **'Other'**
  String get formsLayoutsContactSubject_other;

  /// No description provided for @formsLayoutsContactMessage_label.
  ///
  /// In en, this message translates to:
  /// **'Message'**
  String get formsLayoutsContactMessage_label;

  /// No description provided for @formsLayoutsContactMessage_info.
  ///
  /// In en, this message translates to:
  /// **'Write your message in detail so we can best assist you'**
  String get formsLayoutsContactMessage_info;

  /// No description provided for @formsLayoutsContactSubmit.
  ///
  /// In en, this message translates to:
  /// **'Submit'**
  String get formsLayoutsContactSubmit;

  /// No description provided for @formsLayoutsContactSubmitting.
  ///
  /// In en, this message translates to:
  /// **'Submitting...'**
  String get formsLayoutsContactSubmitting;

  /// No description provided for @formsLayoutsTwoColumn_label.
  ///
  /// In en, this message translates to:
  /// **'Two-Column Grid Form'**
  String get formsLayoutsTwoColumn_label;

  /// No description provided for @formsLayoutsTwoColumn_description.
  ///
  /// In en, this message translates to:
  /// **'Side-by-side name fields with full-width email, subject, and message'**
  String get formsLayoutsTwoColumn_description;

  /// No description provided for @formsLayoutsTwoColumnFirstName_label.
  ///
  /// In en, this message translates to:
  /// **'First Name'**
  String get formsLayoutsTwoColumnFirstName_label;

  /// No description provided for @formsLayoutsTwoColumnFirstName_placeholder.
  ///
  /// In en, this message translates to:
  /// **'John'**
  String get formsLayoutsTwoColumnFirstName_placeholder;

  /// No description provided for @formsLayoutsTwoColumnFirstName_info.
  ///
  /// In en, this message translates to:
  /// **'Your given name'**
  String get formsLayoutsTwoColumnFirstName_info;

  /// No description provided for @formsLayoutsTwoColumnLastName_label.
  ///
  /// In en, this message translates to:
  /// **'Last Name'**
  String get formsLayoutsTwoColumnLastName_label;

  /// No description provided for @formsLayoutsTwoColumnLastName_placeholder.
  ///
  /// In en, this message translates to:
  /// **'Doe'**
  String get formsLayoutsTwoColumnLastName_placeholder;

  /// No description provided for @formsLayoutsTwoColumnLastName_info.
  ///
  /// In en, this message translates to:
  /// **'Your family name or surname'**
  String get formsLayoutsTwoColumnLastName_info;

  /// No description provided for @formsLayoutsTwoColumnEmail_label.
  ///
  /// In en, this message translates to:
  /// **'Email'**
  String get formsLayoutsTwoColumnEmail_label;

  /// No description provided for @formsLayoutsTwoColumnEmail_placeholder.
  ///
  /// In en, this message translates to:
  /// **'john@example.com'**
  String get formsLayoutsTwoColumnEmail_placeholder;

  /// No description provided for @formsLayoutsTwoColumnEmail_info.
  ///
  /// In en, this message translates to:
  /// **'You must provide a valid email address in the format user@example.com'**
  String get formsLayoutsTwoColumnEmail_info;

  /// No description provided for @formsLayoutsTwoColumnSubject_label.
  ///
  /// In en, this message translates to:
  /// **'Select Subject'**
  String get formsLayoutsTwoColumnSubject_label;

  /// No description provided for @formsLayoutsTwoColumnSubject_info.
  ///
  /// In en, this message translates to:
  /// **'Choose a subject category for your message'**
  String get formsLayoutsTwoColumnSubject_info;

  /// No description provided for @formsLayoutsTwoColumnSubject_placeholder.
  ///
  /// In en, this message translates to:
  /// **'Choose an option'**
  String get formsLayoutsTwoColumnSubject_placeholder;

  /// No description provided for @formsLayoutsTwoColumnSubject_option1.
  ///
  /// In en, this message translates to:
  /// **'Option 1'**
  String get formsLayoutsTwoColumnSubject_option1;

  /// No description provided for @formsLayoutsTwoColumnSubject_option2.
  ///
  /// In en, this message translates to:
  /// **'Option 2'**
  String get formsLayoutsTwoColumnSubject_option2;

  /// No description provided for @formsLayoutsTwoColumnSubject_option3.
  ///
  /// In en, this message translates to:
  /// **'Option 3'**
  String get formsLayoutsTwoColumnSubject_option3;

  /// No description provided for @formsLayoutsTwoColumnSubject_option4.
  ///
  /// In en, this message translates to:
  /// **'Option 4'**
  String get formsLayoutsTwoColumnSubject_option4;

  /// No description provided for @formsLayoutsTwoColumnMessage_label.
  ///
  /// In en, this message translates to:
  /// **'Message'**
  String get formsLayoutsTwoColumnMessage_label;

  /// No description provided for @formsLayoutsTwoColumnMessage_info.
  ///
  /// In en, this message translates to:
  /// **'Your message content with a 200 character limit'**
  String get formsLayoutsTwoColumnMessage_info;

  /// No description provided for @formsLayoutsTwoColumnSubmit.
  ///
  /// In en, this message translates to:
  /// **'Send Message'**
  String get formsLayoutsTwoColumnSubmit;

  /// No description provided for @formsLayoutsTwoColumnSubmitting.
  ///
  /// In en, this message translates to:
  /// **'Sending...'**
  String get formsLayoutsTwoColumnSubmitting;

  /// No description provided for @formsLayoutsIcon_label.
  ///
  /// In en, this message translates to:
  /// **'Icon-Prefixed Inputs'**
  String get formsLayoutsIcon_label;

  /// No description provided for @formsLayoutsIcon_description.
  ///
  /// In en, this message translates to:
  /// **'Inputs with leading SVG icons and a remember-me checkbox'**
  String get formsLayoutsIcon_description;

  /// No description provided for @formsLayoutsIconName_label.
  ///
  /// In en, this message translates to:
  /// **'Name'**
  String get formsLayoutsIconName_label;

  /// No description provided for @formsLayoutsIconName_placeholder.
  ///
  /// In en, this message translates to:
  /// **'Your name'**
  String get formsLayoutsIconName_placeholder;

  /// No description provided for @formsLayoutsIconName_info.
  ///
  /// In en, this message translates to:
  /// **'Enter your name — this field has a leading user icon'**
  String get formsLayoutsIconName_info;

  /// No description provided for @formsLayoutsIconEmail_label.
  ///
  /// In en, this message translates to:
  /// **'Email'**
  String get formsLayoutsIconEmail_label;

  /// No description provided for @formsLayoutsIconEmail_placeholder.
  ///
  /// In en, this message translates to:
  /// **'your@email.com'**
  String get formsLayoutsIconEmail_placeholder;

  /// No description provided for @formsLayoutsIconEmail_info.
  ///
  /// In en, this message translates to:
  /// **'You must provide a valid email address in the format user@example.com'**
  String get formsLayoutsIconEmail_info;

  /// No description provided for @formsLayoutsIconPassword_label.
  ///
  /// In en, this message translates to:
  /// **'Password'**
  String get formsLayoutsIconPassword_label;

  /// No description provided for @formsLayoutsIconPassword_placeholder.
  ///
  /// In en, this message translates to:
  /// **'••••••••'**
  String get formsLayoutsIconPassword_placeholder;

  /// No description provided for @formsLayoutsIconPassword_info.
  ///
  /// In en, this message translates to:
  /// **'Enter your password — this field has a leading lock icon'**
  String get formsLayoutsIconPassword_info;

  /// No description provided for @formsLayoutsIconRemember_label.
  ///
  /// In en, this message translates to:
  /// **'Remember me'**
  String get formsLayoutsIconRemember_label;

  /// No description provided for @formsLayoutsIconRemember_info.
  ///
  /// In en, this message translates to:
  /// **'Keep me signed in on this device'**
  String get formsLayoutsIconRemember_info;

  /// No description provided for @formsLayoutsIconSubmit.
  ///
  /// In en, this message translates to:
  /// **'Create Account'**
  String get formsLayoutsIconSubmit;

  /// No description provided for @formsLayoutsSectioned_label.
  ///
  /// In en, this message translates to:
  /// **'Sectioned Card Form'**
  String get formsLayoutsSectioned_label;

  /// No description provided for @formsLayoutsSectioned_description.
  ///
  /// In en, this message translates to:
  /// **'Multiple card sections for complex data entry'**
  String get formsLayoutsSectioned_description;

  /// No description provided for @formsLayoutsSectioned_personalInfo.
  ///
  /// In en, this message translates to:
  /// **'Personal Info'**
  String get formsLayoutsSectioned_personalInfo;

  /// No description provided for @formsLayoutsSectioned_address.
  ///
  /// In en, this message translates to:
  /// **'Address'**
  String get formsLayoutsSectioned_address;

  /// No description provided for @formsLayoutsSectioned_membership.
  ///
  /// In en, this message translates to:
  /// **'Membership'**
  String get formsLayoutsSectioned_membership;

  /// No description provided for @formsLayoutsSectionedFirstName_label.
  ///
  /// In en, this message translates to:
  /// **'First Name'**
  String get formsLayoutsSectionedFirstName_label;

  /// No description provided for @formsLayoutsSectionedFirstName_placeholder.
  ///
  /// In en, this message translates to:
  /// **'John'**
  String get formsLayoutsSectionedFirstName_placeholder;

  /// No description provided for @formsLayoutsSectionedFirstName_info.
  ///
  /// In en, this message translates to:
  /// **'Your given name for your profile'**
  String get formsLayoutsSectionedFirstName_info;

  /// No description provided for @formsLayoutsSectionedLastName_label.
  ///
  /// In en, this message translates to:
  /// **'Last Name'**
  String get formsLayoutsSectionedLastName_label;

  /// No description provided for @formsLayoutsSectionedLastName_placeholder.
  ///
  /// In en, this message translates to:
  /// **'Doe'**
  String get formsLayoutsSectionedLastName_placeholder;

  /// No description provided for @formsLayoutsSectionedLastName_info.
  ///
  /// In en, this message translates to:
  /// **'Your family name for your profile'**
  String get formsLayoutsSectionedLastName_info;

  /// No description provided for @formsLayoutsSectionedEmail_label.
  ///
  /// In en, this message translates to:
  /// **'Email'**
  String get formsLayoutsSectionedEmail_label;

  /// No description provided for @formsLayoutsSectionedEmail_placeholder.
  ///
  /// In en, this message translates to:
  /// **'john@example.com'**
  String get formsLayoutsSectionedEmail_placeholder;

  /// No description provided for @formsLayoutsSectionedEmail_info.
  ///
  /// In en, this message translates to:
  /// **'You must provide a valid email address in the format user@example.com'**
  String get formsLayoutsSectionedEmail_info;

  /// No description provided for @formsLayoutsSectionedDob_label.
  ///
  /// In en, this message translates to:
  /// **'Date of Birth'**
  String get formsLayoutsSectionedDob_label;

  /// No description provided for @formsLayoutsSectionedDob_info.
  ///
  /// In en, this message translates to:
  /// **'Select your date of birth from the date picker'**
  String get formsLayoutsSectionedDob_info;

  /// No description provided for @formsLayoutsSectionedGender_label.
  ///
  /// In en, this message translates to:
  /// **'Gender'**
  String get formsLayoutsSectionedGender_label;

  /// No description provided for @formsLayoutsSectionedGender_info.
  ///
  /// In en, this message translates to:
  /// **'Select your gender from the available options'**
  String get formsLayoutsSectionedGender_info;

  /// No description provided for @formsLayoutsSectionedGender_male.
  ///
  /// In en, this message translates to:
  /// **'Male'**
  String get formsLayoutsSectionedGender_male;

  /// No description provided for @formsLayoutsSectionedGender_female.
  ///
  /// In en, this message translates to:
  /// **'Female'**
  String get formsLayoutsSectionedGender_female;

  /// No description provided for @formsLayoutsSectionedGender_other.
  ///
  /// In en, this message translates to:
  /// **'Other'**
  String get formsLayoutsSectionedGender_other;

  /// No description provided for @formsLayoutsSectionedCategory_label.
  ///
  /// In en, this message translates to:
  /// **'Category'**
  String get formsLayoutsSectionedCategory_label;

  /// No description provided for @formsLayoutsSectionedCategory_info.
  ///
  /// In en, this message translates to:
  /// **'Select the category that best describes your interests'**
  String get formsLayoutsSectionedCategory_info;

  /// No description provided for @formsLayoutsSectionedCategory_tech.
  ///
  /// In en, this message translates to:
  /// **'Technology'**
  String get formsLayoutsSectionedCategory_tech;

  /// No description provided for @formsLayoutsSectionedCategory_design.
  ///
  /// In en, this message translates to:
  /// **'Design'**
  String get formsLayoutsSectionedCategory_design;

  /// No description provided for @formsLayoutsSectionedCategory_business.
  ///
  /// In en, this message translates to:
  /// **'Business'**
  String get formsLayoutsSectionedCategory_business;

  /// No description provided for @formsLayoutsSectionedStreet_label.
  ///
  /// In en, this message translates to:
  /// **'Street'**
  String get formsLayoutsSectionedStreet_label;

  /// No description provided for @formsLayoutsSectionedStreet_placeholder.
  ///
  /// In en, this message translates to:
  /// **'123 Main St'**
  String get formsLayoutsSectionedStreet_placeholder;

  /// No description provided for @formsLayoutsSectionedStreet_info.
  ///
  /// In en, this message translates to:
  /// **'Your street address including building or apartment number'**
  String get formsLayoutsSectionedStreet_info;

  /// No description provided for @formsLayoutsSectionedCity_label.
  ///
  /// In en, this message translates to:
  /// **'City'**
  String get formsLayoutsSectionedCity_label;

  /// No description provided for @formsLayoutsSectionedCity_placeholder.
  ///
  /// In en, this message translates to:
  /// **'Istanbul'**
  String get formsLayoutsSectionedCity_placeholder;

  /// No description provided for @formsLayoutsSectionedCity_info.
  ///
  /// In en, this message translates to:
  /// **'Your city of residence'**
  String get formsLayoutsSectionedCity_info;

  /// No description provided for @formsLayoutsSectionedState_label.
  ///
  /// In en, this message translates to:
  /// **'State'**
  String get formsLayoutsSectionedState_label;

  /// No description provided for @formsLayoutsSectionedState_placeholder.
  ///
  /// In en, this message translates to:
  /// **'Kadıköy'**
  String get formsLayoutsSectionedState_placeholder;

  /// No description provided for @formsLayoutsSectionedState_info.
  ///
  /// In en, this message translates to:
  /// **'Your state, province, or district'**
  String get formsLayoutsSectionedState_info;

  /// No description provided for @formsLayoutsSectionedZip_label.
  ///
  /// In en, this message translates to:
  /// **'Post Code'**
  String get formsLayoutsSectionedZip_label;

  /// No description provided for @formsLayoutsSectionedZip_placeholder.
  ///
  /// In en, this message translates to:
  /// **'34700'**
  String get formsLayoutsSectionedZip_placeholder;

  /// No description provided for @formsLayoutsSectionedZip_info.
  ///
  /// In en, this message translates to:
  /// **'Your postal or ZIP code for mail delivery'**
  String get formsLayoutsSectionedZip_info;

  /// No description provided for @formsLayoutsSectionedCountry_label.
  ///
  /// In en, this message translates to:
  /// **'Country'**
  String get formsLayoutsSectionedCountry_label;

  /// No description provided for @formsLayoutsSectionedCountry_info.
  ///
  /// In en, this message translates to:
  /// **'Select your country of residence'**
  String get formsLayoutsSectionedCountry_info;

  /// No description provided for @formsLayoutsSectionedCountry_placeholder.
  ///
  /// In en, this message translates to:
  /// **'-- Select Country --'**
  String get formsLayoutsSectionedCountry_placeholder;

  /// No description provided for @formsLayoutsSectionedCountry_us.
  ///
  /// In en, this message translates to:
  /// **'USA'**
  String get formsLayoutsSectionedCountry_us;

  /// No description provided for @formsLayoutsSectionedCountry_ca.
  ///
  /// In en, this message translates to:
  /// **'Canada'**
  String get formsLayoutsSectionedCountry_ca;

  /// No description provided for @formsLayoutsSectionedCountry_uk.
  ///
  /// In en, this message translates to:
  /// **'United Kingdom'**
  String get formsLayoutsSectionedCountry_uk;

  /// No description provided for @formsLayoutsSectionedCountry_tr.
  ///
  /// In en, this message translates to:
  /// **'Turkey'**
  String get formsLayoutsSectionedCountry_tr;

  /// No description provided for @formsLayoutsSectionedPlan_label.
  ///
  /// In en, this message translates to:
  /// **'Plan'**
  String get formsLayoutsSectionedPlan_label;

  /// No description provided for @formsLayoutsSectionedPlan_info.
  ///
  /// In en, this message translates to:
  /// **'Choose a membership plan that suits your needs'**
  String get formsLayoutsSectionedPlan_info;

  /// No description provided for @formsLayoutsSectionedPlan_free.
  ///
  /// In en, this message translates to:
  /// **'Free'**
  String get formsLayoutsSectionedPlan_free;

  /// No description provided for @formsLayoutsSectionedPlan_basic.
  ///
  /// In en, this message translates to:
  /// **'Basic'**
  String get formsLayoutsSectionedPlan_basic;

  /// No description provided for @formsLayoutsSectionedPlan_premium.
  ///
  /// In en, this message translates to:
  /// **'Premium'**
  String get formsLayoutsSectionedPlan_premium;

  /// No description provided for @formsLayoutsSectionedAgree_label.
  ///
  /// In en, this message translates to:
  /// **'I agree to the terms and conditions'**
  String get formsLayoutsSectionedAgree_label;

  /// No description provided for @formsLayoutsSectionedAgree_info.
  ///
  /// In en, this message translates to:
  /// **'You must accept the terms and conditions to proceed'**
  String get formsLayoutsSectionedAgree_info;

  /// No description provided for @formsLayoutsSectionedSubmit.
  ///
  /// In en, this message translates to:
  /// **'Save Changes'**
  String get formsLayoutsSectionedSubmit;

  /// No description provided for @formsLayoutsSectionedCancel.
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get formsLayoutsSectionedCancel;

  /// No description provided for @formsLayoutsUnsaved.
  ///
  /// In en, this message translates to:
  /// **'Unsaved changes'**
  String get formsLayoutsUnsaved;

  /// No description provided for @formsErrorsEmailAlreadyMember.
  ///
  /// In en, this message translates to:
  /// **'This email is already a member'**
  String get formsErrorsEmailAlreadyMember;

  /// No description provided for @formsErrorsInviteQuotaExceeded.
  ///
  /// In en, this message translates to:
  /// **'Invite quota exceeded — upgrade your plan'**
  String get formsErrorsInviteQuotaExceeded;

  /// No description provided for @formsErrorsCouponInvalid.
  ///
  /// In en, this message translates to:
  /// **'Invalid coupon code'**
  String get formsErrorsCouponInvalid;

  /// No description provided for @formsErrorsCouponExpired.
  ///
  /// In en, this message translates to:
  /// **'This coupon has expired'**
  String get formsErrorsCouponExpired;

  /// No description provided for @formsErrorsConnectionUnstable.
  ///
  /// In en, this message translates to:
  /// **'Connection is unstable — check your network'**
  String get formsErrorsConnectionUnstable;

  /// No description provided for @formsErrorsScanFailed.
  ///
  /// In en, this message translates to:
  /// **'Virus scan failed — this file may be unsafe'**
  String get formsErrorsScanFailed;

  /// No description provided for @formsErrorsPostalCodeInvalid.
  ///
  /// In en, this message translates to:
  /// **'Postal code doesn\'t match the selected country'**
  String get formsErrorsPostalCodeInvalid;

  /// No description provided for @formsErrorsPaymentDeclined.
  ///
  /// In en, this message translates to:
  /// **'Payment was declined'**
  String get formsErrorsPaymentDeclined;

  /// No description provided for @formsErrorsRowRejected.
  ///
  /// In en, this message translates to:
  /// **'This row was rejected by the server'**
  String get formsErrorsRowRejected;

  /// No description provided for @formsErrorsUnknown.
  ///
  /// In en, this message translates to:
  /// **'An unexpected error occurred'**
  String get formsErrorsUnknown;

  /// No description provided for @formsErrorsSlugTaken.
  ///
  /// In en, this message translates to:
  /// **'This slug is already in use — try a different one'**
  String get formsErrorsSlugTaken;

  /// No description provided for @homeSignIn.
  ///
  /// In en, this message translates to:
  /// **'Sign in'**
  String get homeSignIn;

  /// No description provided for @homeRegister.
  ///
  /// In en, this message translates to:
  /// **'Register'**
  String get homeRegister;

  /// No description provided for @homeChatRoom.
  ///
  /// In en, this message translates to:
  /// **'Chat Room'**
  String get homeChatRoom;

  /// No description provided for @homeMessages.
  ///
  /// In en, this message translates to:
  /// **'Messages'**
  String get homeMessages;

  /// No description provided for @homeStylingPipeline.
  ///
  /// In en, this message translates to:
  /// **'Styling pipeline'**
  String get homeStylingPipeline;

  /// No description provided for @i18nTitle.
  ///
  /// In en, this message translates to:
  /// **'Internationalization'**
  String get i18nTitle;

  /// No description provided for @i18nGreeting.
  ///
  /// In en, this message translates to:
  /// **'Hello!'**
  String get i18nGreeting;

  /// No description provided for @i18nDescription.
  ///
  /// In en, this message translates to:
  /// **'This page was rendered on the server in English from its dictionary.'**
  String get i18nDescription;

  /// No description provided for @messagesTitle.
  ///
  /// In en, this message translates to:
  /// **'Messages'**
  String get messagesTitle;

  /// No description provided for @messagesConnected.
  ///
  /// In en, this message translates to:
  /// **'Connected'**
  String get messagesConnected;

  /// No description provided for @messagesDisconnected.
  ///
  /// In en, this message translates to:
  /// **'Disconnected'**
  String get messagesDisconnected;

  /// No description provided for @messagesChats.
  ///
  /// In en, this message translates to:
  /// **'Chats'**
  String get messagesChats;

  /// No description provided for @messagesFriends.
  ///
  /// In en, this message translates to:
  /// **'Friends'**
  String get messagesFriends;

  /// No description provided for @messagesSearchUsers.
  ///
  /// In en, this message translates to:
  /// **'Search all users...'**
  String get messagesSearchUsers;

  /// No description provided for @messagesSearchFriends.
  ///
  /// In en, this message translates to:
  /// **'Search friends...'**
  String get messagesSearchFriends;

  /// No description provided for @messagesAdd.
  ///
  /// In en, this message translates to:
  /// **'Add'**
  String get messagesAdd;

  /// No description provided for @messagesNoConversations.
  ///
  /// In en, this message translates to:
  /// **'No conversations yet'**
  String get messagesNoConversations;

  /// No description provided for @messagesNoFriends.
  ///
  /// In en, this message translates to:
  /// **'No friends yet. Find people to add!'**
  String get messagesNoFriends;

  /// No description provided for @messagesSelectConversation.
  ///
  /// In en, this message translates to:
  /// **'Select a conversation'**
  String get messagesSelectConversation;

  /// No description provided for @messagesNoMessages.
  ///
  /// In en, this message translates to:
  /// **'No messages yet. Say hello!'**
  String get messagesNoMessages;

  /// No description provided for @messagesInputPlaceholder.
  ///
  /// In en, this message translates to:
  /// **'Type a message...'**
  String get messagesInputPlaceholder;

  /// No description provided for @messagesConnecting.
  ///
  /// In en, this message translates to:
  /// **'Connecting...'**
  String get messagesConnecting;

  /// No description provided for @messagesSend.
  ///
  /// In en, this message translates to:
  /// **'Send'**
  String get messagesSend;

  /// No description provided for @messagesLoading.
  ///
  /// In en, this message translates to:
  /// **'Loading...'**
  String get messagesLoading;

  /// No description provided for @messagesFailedToLoad.
  ///
  /// In en, this message translates to:
  /// **'Failed to load messages'**
  String get messagesFailedToLoad;

  /// No description provided for @messagesSignInRequired.
  ///
  /// In en, this message translates to:
  /// **'Sign in to start messaging'**
  String get messagesSignInRequired;

  /// No description provided for @notificationTitle.
  ///
  /// In en, this message translates to:
  /// **'Notifications'**
  String get notificationTitle;

  /// No description provided for @notificationMarkAllRead.
  ///
  /// In en, this message translates to:
  /// **'Mark all read'**
  String get notificationMarkAllRead;

  /// No description provided for @notificationNoNotifications.
  ///
  /// In en, this message translates to:
  /// **'No notifications yet'**
  String get notificationNoNotifications;

  /// No description provided for @notificationEnablePush.
  ///
  /// In en, this message translates to:
  /// **'Enable push notifications'**
  String get notificationEnablePush;

  /// No description provided for @notificationDisablePush.
  ///
  /// In en, this message translates to:
  /// **'Disable push notifications'**
  String get notificationDisablePush;

  /// No description provided for @notificationBack.
  ///
  /// In en, this message translates to:
  /// **'Back'**
  String get notificationBack;

  /// No description provided for @postsBack.
  ///
  /// In en, this message translates to:
  /// **'Back'**
  String get postsBack;

  /// No description provided for @postsDeletePost.
  ///
  /// In en, this message translates to:
  /// **'Delete post'**
  String get postsDeletePost;

  /// No description provided for @postsDeletePostConfirm.
  ///
  /// In en, this message translates to:
  /// **'Are you sure you want to delete this post?'**
  String get postsDeletePostConfirm;

  /// No description provided for @postsSave.
  ///
  /// In en, this message translates to:
  /// **'Save'**
  String get postsSave;

  /// No description provided for @postsCancel.
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get postsCancel;

  /// No description provided for @postsComments.
  ///
  /// In en, this message translates to:
  /// **'{count} comments'**
  String postsComments(Object count);

  /// No description provided for @postsReactionBreakdown.
  ///
  /// In en, this message translates to:
  /// **'Reaction Breakdown'**
  String get postsReactionBreakdown;

  /// No description provided for @postsWhoReacted.
  ///
  /// In en, this message translates to:
  /// **'Who Reacted'**
  String get postsWhoReacted;

  /// No description provided for @postsUnknown.
  ///
  /// In en, this message translates to:
  /// **'Unknown'**
  String get postsUnknown;

  /// No description provided for @postsPostNotFound.
  ///
  /// In en, this message translates to:
  /// **'Post not found'**
  String get postsPostNotFound;

  /// No description provided for @premiumHeading.
  ///
  /// In en, this message translates to:
  /// **'Premium Dashboard'**
  String get premiumHeading;

  /// No description provided for @premiumSignInToView.
  ///
  /// In en, this message translates to:
  /// **'Sign in to view premium'**
  String get premiumSignInToView;

  /// No description provided for @premiumUpgradeMessage.
  ///
  /// In en, this message translates to:
  /// **'Upgrade to view premium features and stats.'**
  String get premiumUpgradeMessage;

  /// No description provided for @premiumViewPlans.
  ///
  /// In en, this message translates to:
  /// **'View plans'**
  String get premiumViewPlans;

  /// No description provided for @premiumLoadStats.
  ///
  /// In en, this message translates to:
  /// **'Load premium stats'**
  String get premiumLoadStats;

  /// No description provided for @premiumLoadGrowthStats.
  ///
  /// In en, this message translates to:
  /// **'Load growth stats'**
  String get premiumLoadGrowthStats;

  /// No description provided for @premiumLoading.
  ///
  /// In en, this message translates to:
  /// **'Loading...'**
  String get premiumLoading;

  /// No description provided for @premiumTotalUsers.
  ///
  /// In en, this message translates to:
  /// **'Total Users'**
  String get premiumTotalUsers;

  /// No description provided for @premiumActiveUsers.
  ///
  /// In en, this message translates to:
  /// **'Active Users'**
  String get premiumActiveUsers;

  /// No description provided for @premiumRevenue.
  ///
  /// In en, this message translates to:
  /// **'Revenue'**
  String get premiumRevenue;

  /// No description provided for @premiumNewUsers7d.
  ///
  /// In en, this message translates to:
  /// **'New Users (7d)'**
  String get premiumNewUsers7d;

  /// No description provided for @premiumTotalPosts.
  ///
  /// In en, this message translates to:
  /// **'Total Posts'**
  String get premiumTotalPosts;

  /// No description provided for @premiumTotalFriendships.
  ///
  /// In en, this message translates to:
  /// **'Total Friendships'**
  String get premiumTotalFriendships;

  /// No description provided for @premiumExportCsv.
  ///
  /// In en, this message translates to:
  /// **'Export CSV'**
  String get premiumExportCsv;

  /// No description provided for @premiumNetworkError.
  ///
  /// In en, this message translates to:
  /// **'Network error'**
  String get premiumNetworkError;

  /// No description provided for @premiumLoadStatsFirst.
  ///
  /// In en, this message translates to:
  /// **'Load stats first'**
  String get premiumLoadStatsFirst;

  /// No description provided for @premiumErrorStatus.
  ///
  /// In en, this message translates to:
  /// **'Error {status}'**
  String premiumErrorStatus(Object status);

  /// No description provided for @pricingHeading.
  ///
  /// In en, this message translates to:
  /// **'Pricing'**
  String get pricingHeading;

  /// No description provided for @pricingSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Choose the plan that fits your needs.'**
  String get pricingSubtitle;

  /// No description provided for @pricingCurrentPlan.
  ///
  /// In en, this message translates to:
  /// **'Current plan'**
  String get pricingCurrentPlan;

  /// No description provided for @pricingIncluded.
  ///
  /// In en, this message translates to:
  /// **'Included'**
  String get pricingIncluded;

  /// No description provided for @pricingUpgrade.
  ///
  /// In en, this message translates to:
  /// **'Upgrade'**
  String get pricingUpgrade;

  /// No description provided for @pricingFeaturesBasic0.
  ///
  /// In en, this message translates to:
  /// **'Basic access'**
  String get pricingFeaturesBasic0;

  /// No description provided for @pricingFeaturesBasic1.
  ///
  /// In en, this message translates to:
  /// **'Community support'**
  String get pricingFeaturesBasic1;

  /// No description provided for @pricingFeaturesMedium0.
  ///
  /// In en, this message translates to:
  /// **'Everything in Free'**
  String get pricingFeaturesMedium0;

  /// No description provided for @pricingFeaturesMedium1.
  ///
  /// In en, this message translates to:
  /// **'Priority support'**
  String get pricingFeaturesMedium1;

  /// No description provided for @pricingFeaturesMedium2.
  ///
  /// In en, this message translates to:
  /// **'Basic analytics'**
  String get pricingFeaturesMedium2;

  /// No description provided for @pricingFeaturesPremium0.
  ///
  /// In en, this message translates to:
  /// **'Everything in Medium'**
  String get pricingFeaturesPremium0;

  /// No description provided for @pricingFeaturesPremium1.
  ///
  /// In en, this message translates to:
  /// **'Post stats & reaction breakdown'**
  String get pricingFeaturesPremium1;

  /// No description provided for @pricingFeaturesPremium2.
  ///
  /// In en, this message translates to:
  /// **'VIP room access'**
  String get pricingFeaturesPremium2;

  /// No description provided for @pricingFeaturesPremium3.
  ///
  /// In en, this message translates to:
  /// **'Suggested friends'**
  String get pricingFeaturesPremium3;

  /// No description provided for @pricingFeaturesPro0.
  ///
  /// In en, this message translates to:
  /// **'Everything in Premium'**
  String get pricingFeaturesPro0;

  /// No description provided for @pricingFeaturesPro1.
  ///
  /// In en, this message translates to:
  /// **'Who-reacted list'**
  String get pricingFeaturesPro1;

  /// No description provided for @pricingFeaturesPro2.
  ///
  /// In en, this message translates to:
  /// **'Export data'**
  String get pricingFeaturesPro2;

  /// No description provided for @pricingFeaturesPro3.
  ///
  /// In en, this message translates to:
  /// **'Crown badge'**
  String get pricingFeaturesPro3;

  /// No description provided for @pricingFeaturesPro4.
  ///
  /// In en, this message translates to:
  /// **'Dedicated support'**
  String get pricingFeaturesPro4;

  /// No description provided for @pricingPriceFree.
  ///
  /// In en, this message translates to:
  /// **'\$0'**
  String get pricingPriceFree;

  /// No description provided for @pricingPriceBasic.
  ///
  /// In en, this message translates to:
  /// **'\$9.99/mo'**
  String get pricingPriceBasic;

  /// No description provided for @pricingPriceMedium.
  ///
  /// In en, this message translates to:
  /// **'\$19.99/mo'**
  String get pricingPriceMedium;

  /// No description provided for @pricingPricePremium.
  ///
  /// In en, this message translates to:
  /// **'\$49.99/mo'**
  String get pricingPricePremium;

  /// No description provided for @settingsNavGeneral.
  ///
  /// In en, this message translates to:
  /// **'General'**
  String get settingsNavGeneral;

  /// No description provided for @settingsNavAccount.
  ///
  /// In en, this message translates to:
  /// **'Account'**
  String get settingsNavAccount;

  /// No description provided for @settingsNavPrivacy.
  ///
  /// In en, this message translates to:
  /// **'Privacy'**
  String get settingsNavPrivacy;

  /// No description provided for @settingsNavBilling.
  ///
  /// In en, this message translates to:
  /// **'Billing'**
  String get settingsNavBilling;

  /// No description provided for @settingsNavSessions.
  ///
  /// In en, this message translates to:
  /// **'Sessions'**
  String get settingsNavSessions;

  /// No description provided for @settingsAccountHeading.
  ///
  /// In en, this message translates to:
  /// **'Account'**
  String get settingsAccountHeading;

  /// No description provided for @settingsName.
  ///
  /// In en, this message translates to:
  /// **'Name'**
  String get settingsName;

  /// No description provided for @settingsUsername.
  ///
  /// In en, this message translates to:
  /// **'Username'**
  String get settingsUsername;

  /// No description provided for @settingsUsernameChecking.
  ///
  /// In en, this message translates to:
  /// **'Checking availability…'**
  String get settingsUsernameChecking;

  /// No description provided for @settingsUsernameAvailable.
  ///
  /// In en, this message translates to:
  /// **'Available'**
  String get settingsUsernameAvailable;

  /// No description provided for @settingsUsernameTaken.
  ///
  /// In en, this message translates to:
  /// **'Already taken'**
  String get settingsUsernameTaken;

  /// No description provided for @settingsBio.
  ///
  /// In en, this message translates to:
  /// **'Bio'**
  String get settingsBio;

  /// No description provided for @settingsAvatarChange.
  ///
  /// In en, this message translates to:
  /// **'Change photo'**
  String get settingsAvatarChange;

  /// No description provided for @settingsSave.
  ///
  /// In en, this message translates to:
  /// **'Save changes'**
  String get settingsSave;

  /// No description provided for @settingsSaveSuccess.
  ///
  /// In en, this message translates to:
  /// **'Profile updated'**
  String get settingsSaveSuccess;

  /// No description provided for @settingsGeneralHeading.
  ///
  /// In en, this message translates to:
  /// **'General'**
  String get settingsGeneralHeading;

  /// No description provided for @settingsLanguage.
  ///
  /// In en, this message translates to:
  /// **'Language'**
  String get settingsLanguage;

  /// No description provided for @settingsTimezone.
  ///
  /// In en, this message translates to:
  /// **'Timezone'**
  String get settingsTimezone;

  /// No description provided for @settingsCurrency.
  ///
  /// In en, this message translates to:
  /// **'Currency'**
  String get settingsCurrency;

  /// No description provided for @settingsTheme.
  ///
  /// In en, this message translates to:
  /// **'Theme'**
  String get settingsTheme;

  /// No description provided for @settingsDateDisplay.
  ///
  /// In en, this message translates to:
  /// **'Date display'**
  String get settingsDateDisplay;

  /// No description provided for @settingsDateDisplayLong.
  ///
  /// In en, this message translates to:
  /// **'Long'**
  String get settingsDateDisplayLong;

  /// No description provided for @settingsDateDisplayIso.
  ///
  /// In en, this message translates to:
  /// **'ISO timestamp'**
  String get settingsDateDisplayIso;

  /// No description provided for @settingsDateDisplayShort.
  ///
  /// In en, this message translates to:
  /// **'Short'**
  String get settingsDateDisplayShort;

  /// No description provided for @settingsBillingHeading.
  ///
  /// In en, this message translates to:
  /// **'Billing'**
  String get settingsBillingHeading;

  /// No description provided for @settingsCurrentPlan.
  ///
  /// In en, this message translates to:
  /// **'Current plan'**
  String get settingsCurrentPlan;

  /// No description provided for @settingsUpgradePlan.
  ///
  /// In en, this message translates to:
  /// **'Upgrade plan'**
  String get settingsUpgradePlan;

  /// No description provided for @settingsBillingHistory.
  ///
  /// In en, this message translates to:
  /// **'Billing history'**
  String get settingsBillingHistory;

  /// No description provided for @settingsBillingHistoryEmpty.
  ///
  /// In en, this message translates to:
  /// **'No transactions yet.'**
  String get settingsBillingHistoryEmpty;

  /// No description provided for @settingsPlanDetails.
  ///
  /// In en, this message translates to:
  /// **'Plan Details'**
  String get settingsPlanDetails;

  /// No description provided for @settingsPlanBenefits.
  ///
  /// In en, this message translates to:
  /// **'Plan Benefits'**
  String get settingsPlanBenefits;

  /// No description provided for @settingsPaymentMethods.
  ///
  /// In en, this message translates to:
  /// **'Payment Methods'**
  String get settingsPaymentMethods;

  /// No description provided for @settingsAddPaymentMethod.
  ///
  /// In en, this message translates to:
  /// **'Add new card'**
  String get settingsAddPaymentMethod;

  /// No description provided for @settingsMakeDefault.
  ///
  /// In en, this message translates to:
  /// **'Make default'**
  String get settingsMakeDefault;

  /// No description provided for @settingsEditBillingInfo.
  ///
  /// In en, this message translates to:
  /// **'Edit billing info'**
  String get settingsEditBillingInfo;

  /// No description provided for @settingsBillingInfo.
  ///
  /// In en, this message translates to:
  /// **'Billing Info'**
  String get settingsBillingInfo;

  /// No description provided for @settingsBillingAddressEmpty.
  ///
  /// In en, this message translates to:
  /// **'No billing address saved.'**
  String get settingsBillingAddressEmpty;

  /// No description provided for @settingsCancelSubscription.
  ///
  /// In en, this message translates to:
  /// **'Cancel subscription'**
  String get settingsCancelSubscription;

  /// No description provided for @settingsCancelSubscriptionConfirm.
  ///
  /// In en, this message translates to:
  /// **'Are you sure you want to cancel your subscription? You\'ll lose access to premium features at the end of the current billing period.'**
  String get settingsCancelSubscriptionConfirm;

  /// No description provided for @settingsCancelSubscriptionSuccess.
  ///
  /// In en, this message translates to:
  /// **'Subscription will cancel at the end of the billing period'**
  String get settingsCancelSubscriptionSuccess;

  /// No description provided for @settingsCancelSubscriptionFailed.
  ///
  /// In en, this message translates to:
  /// **'Failed to cancel subscription'**
  String get settingsCancelSubscriptionFailed;

  /// No description provided for @settingsInvoices.
  ///
  /// In en, this message translates to:
  /// **'Invoices'**
  String get settingsInvoices;

  /// No description provided for @settingsInvoiceNumber.
  ///
  /// In en, this message translates to:
  /// **'Invoice {number}'**
  String settingsInvoiceNumber(Object number);

  /// No description provided for @settingsDownloadInvoice.
  ///
  /// In en, this message translates to:
  /// **'Download'**
  String get settingsDownloadInvoice;

  /// No description provided for @settingsViewInvoice.
  ///
  /// In en, this message translates to:
  /// **'View'**
  String get settingsViewInvoice;

  /// No description provided for @settingsPaid.
  ///
  /// In en, this message translates to:
  /// **'Paid'**
  String get settingsPaid;

  /// No description provided for @settingsUnpaid.
  ///
  /// In en, this message translates to:
  /// **'Unpaid'**
  String get settingsUnpaid;

  /// No description provided for @settingsShowingXofY.
  ///
  /// In en, this message translates to:
  /// **'Showing {x}–{y} of {z}'**
  String settingsShowingXofY(Object x, Object y, Object z);

  /// No description provided for @settingsPrevious.
  ///
  /// In en, this message translates to:
  /// **'Previous'**
  String get settingsPrevious;

  /// No description provided for @settingsNext.
  ///
  /// In en, this message translates to:
  /// **'Next'**
  String get settingsNext;

  /// No description provided for @settingsStreet.
  ///
  /// In en, this message translates to:
  /// **'Street'**
  String get settingsStreet;

  /// No description provided for @settingsCity.
  ///
  /// In en, this message translates to:
  /// **'City'**
  String get settingsCity;

  /// No description provided for @settingsState.
  ///
  /// In en, this message translates to:
  /// **'State'**
  String get settingsState;

  /// No description provided for @settingsCountry.
  ///
  /// In en, this message translates to:
  /// **'Country'**
  String get settingsCountry;

  /// No description provided for @settingsZipCode.
  ///
  /// In en, this message translates to:
  /// **'Zip / Postal Code'**
  String get settingsZipCode;

  /// No description provided for @settingsVatNumber.
  ///
  /// In en, this message translates to:
  /// **'VAT Number'**
  String get settingsVatNumber;

  /// No description provided for @settingsNoPaymentMethods.
  ///
  /// In en, this message translates to:
  /// **'No payment methods saved.'**
  String get settingsNoPaymentMethods;

  /// No description provided for @settingsPrice.
  ///
  /// In en, this message translates to:
  /// **'Price'**
  String get settingsPrice;

  /// No description provided for @settingsRenewalDate.
  ///
  /// In en, this message translates to:
  /// **'Renewal Date'**
  String get settingsRenewalDate;

  /// No description provided for @settingsCancelsOn.
  ///
  /// In en, this message translates to:
  /// **'Cancels on'**
  String get settingsCancelsOn;

  /// No description provided for @settingsEditAddress.
  ///
  /// In en, this message translates to:
  /// **'Edit'**
  String get settingsEditAddress;

  /// No description provided for @settingsUpdateAddress.
  ///
  /// In en, this message translates to:
  /// **'Update Address'**
  String get settingsUpdateAddress;

  /// No description provided for @settingsNameLabel.
  ///
  /// In en, this message translates to:
  /// **'Name'**
  String get settingsNameLabel;

  /// No description provided for @settingsExpires.
  ///
  /// In en, this message translates to:
  /// **'Expires'**
  String get settingsExpires;

  /// No description provided for @settingsDate.
  ///
  /// In en, this message translates to:
  /// **'Date'**
  String get settingsDate;

  /// No description provided for @settingsStatus.
  ///
  /// In en, this message translates to:
  /// **'Status'**
  String get settingsStatus;

  /// No description provided for @settingsPlanBenefitsEmpty.
  ///
  /// In en, this message translates to:
  /// **'No benefits available for this tier.'**
  String get settingsPlanBenefitsEmpty;

  /// No description provided for @settingsPrivacyHeading.
  ///
  /// In en, this message translates to:
  /// **'Privacy'**
  String get settingsPrivacyHeading;

  /// No description provided for @settingsPrivacySessionsNote.
  ///
  /// In en, this message translates to:
  /// **'Manage where you\'re signed in from the Sessions tab.'**
  String get settingsPrivacySessionsNote;

  /// No description provided for @settingsPrivacyHideProfilePicture.
  ///
  /// In en, this message translates to:
  /// **'Don\'t show my profile picture'**
  String get settingsPrivacyHideProfilePicture;

  /// No description provided for @settingsPrivacyHideProfilePictureDesc.
  ///
  /// In en, this message translates to:
  /// **'Your avatar will be hidden from other users'**
  String get settingsPrivacyHideProfilePictureDesc;

  /// No description provided for @settingsPrivacyNickname.
  ///
  /// In en, this message translates to:
  /// **'Go to chat rooms with nickname'**
  String get settingsPrivacyNickname;

  /// No description provided for @settingsPrivacyNicknameDesc.
  ///
  /// In en, this message translates to:
  /// **'Use a nickname instead of your real name in chat rooms'**
  String get settingsPrivacyNicknameDesc;

  /// No description provided for @settingsPrivacyNicknamePlaceholder.
  ///
  /// In en, this message translates to:
  /// **'Enter your nickname'**
  String get settingsPrivacyNicknamePlaceholder;

  /// No description provided for @settingsPrivacyTwoFactor.
  ///
  /// In en, this message translates to:
  /// **'Two-factor authentication (2FA)'**
  String get settingsPrivacyTwoFactor;

  /// No description provided for @settingsPrivacyTwoFactorDesc.
  ///
  /// In en, this message translates to:
  /// **'Add an extra layer of security to your account'**
  String get settingsPrivacyTwoFactorDesc;

  /// No description provided for @settingsSettingsLink.
  ///
  /// In en, this message translates to:
  /// **'Settings'**
  String get settingsSettingsLink;

  /// No description provided for @settingsNavSettings.
  ///
  /// In en, this message translates to:
  /// **'Settings'**
  String get settingsNavSettings;

  /// No description provided for @settingsSettingsSectionLabel.
  ///
  /// In en, this message translates to:
  /// **'Settings'**
  String get settingsSettingsSectionLabel;

  /// No description provided for @settingsSaving.
  ///
  /// In en, this message translates to:
  /// **'Saving…'**
  String get settingsSaving;

  /// No description provided for @settingsSaveFailed.
  ///
  /// In en, this message translates to:
  /// **'Failed to save'**
  String get settingsSaveFailed;

  /// No description provided for @settingsUploadFailed.
  ///
  /// In en, this message translates to:
  /// **'Upload failed'**
  String get settingsUploadFailed;

  /// No description provided for @settingsInvalidFileType.
  ///
  /// In en, this message translates to:
  /// **'Only JPEG, PNG, WebP, and GIF images are allowed'**
  String get settingsInvalidFileType;

  /// No description provided for @settingsFileTooLarge.
  ///
  /// In en, this message translates to:
  /// **'File must be under 5 MB'**
  String get settingsFileTooLarge;

  /// No description provided for @settingsLoading.
  ///
  /// In en, this message translates to:
  /// **'Loading…'**
  String get settingsLoading;

  /// No description provided for @settingsNavApiKeys.
  ///
  /// In en, this message translates to:
  /// **'API Keys'**
  String get settingsNavApiKeys;

  /// No description provided for @settingsApiKeysHeading.
  ///
  /// In en, this message translates to:
  /// **'API Keys'**
  String get settingsApiKeysHeading;

  /// No description provided for @settingsApiKeysDescription.
  ///
  /// In en, this message translates to:
  /// **'API keys allow programmatic access to your account. Treat them like passwords.'**
  String get settingsApiKeysDescription;

  /// No description provided for @settingsApiKeysEmpty.
  ///
  /// In en, this message translates to:
  /// **'No API keys yet. Create one to get started.'**
  String get settingsApiKeysEmpty;

  /// No description provided for @settingsApiKeysCreate.
  ///
  /// In en, this message translates to:
  /// **'New API key'**
  String get settingsApiKeysCreate;

  /// No description provided for @settingsApiKeysCreateHeading.
  ///
  /// In en, this message translates to:
  /// **'Create new API key'**
  String get settingsApiKeysCreateHeading;

  /// No description provided for @settingsApiKeysNameLabel.
  ///
  /// In en, this message translates to:
  /// **'Key name'**
  String get settingsApiKeysNameLabel;

  /// No description provided for @settingsApiKeysNamePlaceholder.
  ///
  /// In en, this message translates to:
  /// **'e.g. \'CI/CD\', \'Development\''**
  String get settingsApiKeysNamePlaceholder;

  /// No description provided for @settingsApiKeysExpiryLabel.
  ///
  /// In en, this message translates to:
  /// **'Expiry'**
  String get settingsApiKeysExpiryLabel;

  /// No description provided for @settingsApiKeysNoExpiry.
  ///
  /// In en, this message translates to:
  /// **'No expiry'**
  String get settingsApiKeysNoExpiry;

  /// No description provided for @settingsApiKeysCreated.
  ///
  /// In en, this message translates to:
  /// **'Key created — copy it now. You won\'t see it again.'**
  String get settingsApiKeysCreated;

  /// No description provided for @settingsApiKeysCopied.
  ///
  /// In en, this message translates to:
  /// **'Copied to clipboard'**
  String get settingsApiKeysCopied;

  /// No description provided for @settingsApiKeysRevokeConfirm.
  ///
  /// In en, this message translates to:
  /// **'Revoke API key \"{name}\"? This cannot be undone.'**
  String settingsApiKeysRevokeConfirm(Object name);

  /// No description provided for @settingsApiKeysRevoked.
  ///
  /// In en, this message translates to:
  /// **'API key revoked'**
  String get settingsApiKeysRevoked;

  /// No description provided for @settingsApiKeysActive.
  ///
  /// In en, this message translates to:
  /// **'Active'**
  String get settingsApiKeysActive;

  /// No description provided for @settingsApiKeysDisabled.
  ///
  /// In en, this message translates to:
  /// **'Disabled'**
  String get settingsApiKeysDisabled;

  /// No description provided for @settingsApiKeysCreatedDate.
  ///
  /// In en, this message translates to:
  /// **'Created {date}'**
  String settingsApiKeysCreatedDate(Object date);

  /// No description provided for @settingsApiKeysLastUsed.
  ///
  /// In en, this message translates to:
  /// **'Last used {date}'**
  String settingsApiKeysLastUsed(Object date);

  /// No description provided for @settingsApiKeysExpires.
  ///
  /// In en, this message translates to:
  /// **'Expires {date}'**
  String settingsApiKeysExpires(Object date);

  /// No description provided for @settingsApiKeysLoadFailed.
  ///
  /// In en, this message translates to:
  /// **'Failed to load API keys'**
  String get settingsApiKeysLoadFailed;

  /// No description provided for @settingsApiKeysCreateFailed.
  ///
  /// In en, this message translates to:
  /// **'Failed to create API key'**
  String get settingsApiKeysCreateFailed;

  /// No description provided for @settingsApiKeysRevokeFailed.
  ///
  /// In en, this message translates to:
  /// **'Failed to revoke API key'**
  String get settingsApiKeysRevokeFailed;

  /// No description provided for @settingsSignInToManageSettings.
  ///
  /// In en, this message translates to:
  /// **'Sign in to manage settings'**
  String get settingsSignInToManageSettings;

  /// No description provided for @settingsSignInToManageBilling.
  ///
  /// In en, this message translates to:
  /// **'Sign in to manage billing'**
  String get settingsSignInToManageBilling;

  /// No description provided for @settingsSignInToManageAccount.
  ///
  /// In en, this message translates to:
  /// **'Sign in to manage your account'**
  String get settingsSignInToManageAccount;

  /// No description provided for @settingsSignInToManageSessions.
  ///
  /// In en, this message translates to:
  /// **'Sign in to manage sessions'**
  String get settingsSignInToManageSessions;

  /// No description provided for @settingsSessionsHeading.
  ///
  /// In en, this message translates to:
  /// **'Sessions & Devices'**
  String get settingsSessionsHeading;

  /// No description provided for @settingsLogOutAllOtherSessions.
  ///
  /// In en, this message translates to:
  /// **'Log out all other sessions'**
  String get settingsLogOutAllOtherSessions;

  /// No description provided for @settingsLoadingSessions.
  ///
  /// In en, this message translates to:
  /// **'Loading sessions...'**
  String get settingsLoadingSessions;

  /// No description provided for @settingsNoSessions.
  ///
  /// In en, this message translates to:
  /// **'No active sessions found.'**
  String get settingsNoSessions;

  /// No description provided for @settingsCurrentSession.
  ///
  /// In en, this message translates to:
  /// **'Current'**
  String get settingsCurrentSession;

  /// No description provided for @settingsUnknownDevice.
  ///
  /// In en, this message translates to:
  /// **'Unknown device'**
  String get settingsUnknownDevice;

  /// No description provided for @settingsMoreDeviceInfo.
  ///
  /// In en, this message translates to:
  /// **'More Device Info'**
  String get settingsMoreDeviceInfo;

  /// No description provided for @settingsDeviceId.
  ///
  /// In en, this message translates to:
  /// **'Device ID:'**
  String get settingsDeviceId;

  /// No description provided for @settingsUserAgent.
  ///
  /// In en, this message translates to:
  /// **'User-Agent:'**
  String get settingsUserAgent;

  /// No description provided for @settingsRevoke.
  ///
  /// In en, this message translates to:
  /// **'Revoke'**
  String get settingsRevoke;

  /// No description provided for @settingsErrorsUsernameTaken.
  ///
  /// In en, this message translates to:
  /// **'Username is already taken'**
  String get settingsErrorsUsernameTaken;

  /// No description provided for @shareShareSomething.
  ///
  /// In en, this message translates to:
  /// **'Share something'**
  String get shareShareSomething;

  /// No description provided for @shareTitle.
  ///
  /// In en, this message translates to:
  /// **'Title'**
  String get shareTitle;

  /// No description provided for @shareTitlePlaceholder.
  ///
  /// In en, this message translates to:
  /// **'What\'s on your mind?'**
  String get shareTitlePlaceholder;

  /// No description provided for @shareContent.
  ///
  /// In en, this message translates to:
  /// **'Content'**
  String get shareContent;

  /// No description provided for @shareContentPlaceholder.
  ///
  /// In en, this message translates to:
  /// **'Write something...'**
  String get shareContentPlaceholder;

  /// No description provided for @shareImageOptional.
  ///
  /// In en, this message translates to:
  /// **'Image (optional)'**
  String get shareImageOptional;

  /// No description provided for @sharePreview.
  ///
  /// In en, this message translates to:
  /// **'Preview'**
  String get sharePreview;

  /// No description provided for @shareUploading.
  ///
  /// In en, this message translates to:
  /// **'Uploading...'**
  String get shareUploading;

  /// No description provided for @shareImageUploadFailed.
  ///
  /// In en, this message translates to:
  /// **'Image couldn\'t be uploaded.'**
  String get shareImageUploadFailed;

  /// No description provided for @shareRemove.
  ///
  /// In en, this message translates to:
  /// **'Remove'**
  String get shareRemove;

  /// No description provided for @shareRetry.
  ///
  /// In en, this message translates to:
  /// **'Retry'**
  String get shareRetry;

  /// No description provided for @shareSharing.
  ///
  /// In en, this message translates to:
  /// **'Sharing...'**
  String get shareSharing;

  /// No description provided for @shareShare.
  ///
  /// In en, this message translates to:
  /// **'Share'**
  String get shareShare;

  /// No description provided for @shareFailedToCreatePost.
  ///
  /// In en, this message translates to:
  /// **'Failed to create post'**
  String get shareFailedToCreatePost;

  /// No description provided for @sharedLocaleSwitcherSwitchLabel.
  ///
  /// In en, this message translates to:
  /// **'Choose a language'**
  String get sharedLocaleSwitcherSwitchLabel;

  /// No description provided for @uiPageTitle.
  ///
  /// In en, this message translates to:
  /// **'UI Components'**
  String get uiPageTitle;

  /// No description provided for @uiPageDescription.
  ///
  /// In en, this message translates to:
  /// **'Browse and inspect all custom UI components.'**
  String get uiPageDescription;

  /// No description provided for @uiBack.
  ///
  /// In en, this message translates to:
  /// **'Back'**
  String get uiBack;

  /// No description provided for @uiBreadcrumbLabel.
  ///
  /// In en, this message translates to:
  /// **'UI Components'**
  String get uiBreadcrumbLabel;

  /// No description provided for @uiBreadcrumbPattern.
  ///
  /// In en, this message translates to:
  /// **'/v1/:lang/ui/:component'**
  String get uiBreadcrumbPattern;

  /// No description provided for @uiAccordionTitle.
  ///
  /// In en, this message translates to:
  /// **'Accordion - Single State'**
  String get uiAccordionTitle;

  /// No description provided for @uiAccordionDescription.
  ///
  /// In en, this message translates to:
  /// **'When a new accordion opens, the other open one closes.'**
  String get uiAccordionDescription;

  /// No description provided for @uiAccordionText.
  ///
  /// In en, this message translates to:
  /// **'When a new accordion opens, the other open one closes.'**
  String get uiAccordionText;

  /// No description provided for @uiAccordionVariantsTitle.
  ///
  /// In en, this message translates to:
  /// **'Accordion - Multi State'**
  String get uiAccordionVariantsTitle;

  /// No description provided for @uiAccordionVariantsDescription.
  ///
  /// In en, this message translates to:
  /// **'When a new accordion opens, the other open ones don\'t close.'**
  String get uiAccordionVariantsDescription;

  /// No description provided for @uiAccordionVariantsText.
  ///
  /// In en, this message translates to:
  /// **'When a new accordion opens, the other open ones don\'t close.'**
  String get uiAccordionVariantsText;

  /// No description provided for @uiAccordionRichItemsTitle.
  ///
  /// In en, this message translates to:
  /// **'Accordion - Rich Items'**
  String get uiAccordionRichItemsTitle;

  /// No description provided for @uiAccordionRichItemsDescription.
  ///
  /// In en, this message translates to:
  /// **'AccordionItemComplex with flexible slots for avatars, badges, and rich content.'**
  String get uiAccordionRichItemsDescription;

  /// No description provided for @uiAccordionRichItemsText.
  ///
  /// In en, this message translates to:
  /// **'AccordionItemComplex with flexible slots for avatars, badges, and rich content.'**
  String get uiAccordionRichItemsText;

  /// No description provided for @uiAlertTitle.
  ///
  /// In en, this message translates to:
  /// **'Alert'**
  String get uiAlertTitle;

  /// No description provided for @uiAlertDescription.
  ///
  /// In en, this message translates to:
  /// **'Alert component demo'**
  String get uiAlertDescription;

  /// No description provided for @uiAlertDialogTitle.
  ///
  /// In en, this message translates to:
  /// **'Alert Dialog'**
  String get uiAlertDialogTitle;

  /// No description provided for @uiAlertDialogDescription.
  ///
  /// In en, this message translates to:
  /// **'Alert Dialog component demo'**
  String get uiAlertDialogDescription;

  /// No description provided for @uiAspectRatioTitle.
  ///
  /// In en, this message translates to:
  /// **'Aspect Ratio'**
  String get uiAspectRatioTitle;

  /// No description provided for @uiAspectRatioDescription.
  ///
  /// In en, this message translates to:
  /// **'Aspect Ratio component demo'**
  String get uiAspectRatioDescription;

  /// No description provided for @uiAvatarTitle.
  ///
  /// In en, this message translates to:
  /// **'Avatar'**
  String get uiAvatarTitle;

  /// No description provided for @uiAvatarDescription.
  ///
  /// In en, this message translates to:
  /// **'Avatar component demo'**
  String get uiAvatarDescription;

  /// No description provided for @uiBadgeTitle.
  ///
  /// In en, this message translates to:
  /// **'Badge'**
  String get uiBadgeTitle;

  /// No description provided for @uiBadgeDescription.
  ///
  /// In en, this message translates to:
  /// **'Badge component demo'**
  String get uiBadgeDescription;

  /// No description provided for @uiBreadcrumbTitle.
  ///
  /// In en, this message translates to:
  /// **'Breadcrumb'**
  String get uiBreadcrumbTitle;

  /// No description provided for @uiBreadcrumbDescription.
  ///
  /// In en, this message translates to:
  /// **'Breadcrumb component demo'**
  String get uiBreadcrumbDescription;

  /// No description provided for @uiButtonTitle.
  ///
  /// In en, this message translates to:
  /// **'Button'**
  String get uiButtonTitle;

  /// No description provided for @uiButtonDescription.
  ///
  /// In en, this message translates to:
  /// **'Button component demo'**
  String get uiButtonDescription;

  /// No description provided for @uiCalendarTitle.
  ///
  /// In en, this message translates to:
  /// **'Calendar'**
  String get uiCalendarTitle;

  /// No description provided for @uiCalendarDescription.
  ///
  /// In en, this message translates to:
  /// **'Calendar component demo'**
  String get uiCalendarDescription;

  /// No description provided for @uiCardTitle.
  ///
  /// In en, this message translates to:
  /// **'Card'**
  String get uiCardTitle;

  /// No description provided for @uiCardDescription.
  ///
  /// In en, this message translates to:
  /// **'Card component demo'**
  String get uiCardDescription;

  /// No description provided for @uiCarouselTitle.
  ///
  /// In en, this message translates to:
  /// **'Carousel'**
  String get uiCarouselTitle;

  /// No description provided for @uiCarouselDescription.
  ///
  /// In en, this message translates to:
  /// **'Carousel component demo'**
  String get uiCarouselDescription;

  /// No description provided for @uiCheckboxTitle.
  ///
  /// In en, this message translates to:
  /// **'Checkbox'**
  String get uiCheckboxTitle;

  /// No description provided for @uiCheckboxDescription.
  ///
  /// In en, this message translates to:
  /// **'Checkbox component demo'**
  String get uiCheckboxDescription;

  /// No description provided for @uiCollapsibleTitle.
  ///
  /// In en, this message translates to:
  /// **'Collapsible'**
  String get uiCollapsibleTitle;

  /// No description provided for @uiCollapsibleDescription.
  ///
  /// In en, this message translates to:
  /// **'Collapsible component demo'**
  String get uiCollapsibleDescription;

  /// No description provided for @uiComboboxTitle.
  ///
  /// In en, this message translates to:
  /// **'Combobox'**
  String get uiComboboxTitle;

  /// No description provided for @uiComboboxDescription.
  ///
  /// In en, this message translates to:
  /// **'Combobox component demo'**
  String get uiComboboxDescription;

  /// No description provided for @uiCommandTitle.
  ///
  /// In en, this message translates to:
  /// **'Command'**
  String get uiCommandTitle;

  /// No description provided for @uiCommandDescription.
  ///
  /// In en, this message translates to:
  /// **'Command component demo'**
  String get uiCommandDescription;

  /// No description provided for @uiConfirmDialogTitle.
  ///
  /// In en, this message translates to:
  /// **'Confirm Dialog'**
  String get uiConfirmDialogTitle;

  /// No description provided for @uiConfirmDialogDescription.
  ///
  /// In en, this message translates to:
  /// **'Confirm Dialog component demo'**
  String get uiConfirmDialogDescription;

  /// No description provided for @uiContextMenuTitle.
  ///
  /// In en, this message translates to:
  /// **'Context Menu'**
  String get uiContextMenuTitle;

  /// No description provided for @uiContextMenuDescription.
  ///
  /// In en, this message translates to:
  /// **'Context Menu component demo'**
  String get uiContextMenuDescription;

  /// No description provided for @uiCounterTitle.
  ///
  /// In en, this message translates to:
  /// **'Counter'**
  String get uiCounterTitle;

  /// No description provided for @uiCounterDescription.
  ///
  /// In en, this message translates to:
  /// **'Counter component demo'**
  String get uiCounterDescription;

  /// No description provided for @uiDatePickerTitle.
  ///
  /// In en, this message translates to:
  /// **'Date Picker'**
  String get uiDatePickerTitle;

  /// No description provided for @uiDatePickerDescription.
  ///
  /// In en, this message translates to:
  /// **'Date Picker component demo'**
  String get uiDatePickerDescription;

  /// No description provided for @uiDialogTitle.
  ///
  /// In en, this message translates to:
  /// **'Dialog'**
  String get uiDialogTitle;

  /// No description provided for @uiDialogDescription.
  ///
  /// In en, this message translates to:
  /// **'Dialog component demo'**
  String get uiDialogDescription;

  /// No description provided for @uiDrawerTitle.
  ///
  /// In en, this message translates to:
  /// **'Drawer'**
  String get uiDrawerTitle;

  /// No description provided for @uiDrawerDescription.
  ///
  /// In en, this message translates to:
  /// **'Drawer component demo'**
  String get uiDrawerDescription;

  /// No description provided for @uiDropdownTitle.
  ///
  /// In en, this message translates to:
  /// **'Dropdown'**
  String get uiDropdownTitle;

  /// No description provided for @uiDropdownDescription.
  ///
  /// In en, this message translates to:
  /// **'Dropdown component demo'**
  String get uiDropdownDescription;

  /// No description provided for @uiDropdownMenuTitle.
  ///
  /// In en, this message translates to:
  /// **'Dropdown Menu'**
  String get uiDropdownMenuTitle;

  /// No description provided for @uiDropdownMenuDescription.
  ///
  /// In en, this message translates to:
  /// **'Dropdown Menu component demo'**
  String get uiDropdownMenuDescription;

  /// No description provided for @uiEmptyTitle.
  ///
  /// In en, this message translates to:
  /// **'Empty'**
  String get uiEmptyTitle;

  /// No description provided for @uiEmptyDescription.
  ///
  /// In en, this message translates to:
  /// **'Empty component demo'**
  String get uiEmptyDescription;

  /// No description provided for @uiErrorBoundaryTitle.
  ///
  /// In en, this message translates to:
  /// **'Error Boundary'**
  String get uiErrorBoundaryTitle;

  /// No description provided for @uiErrorBoundaryDescription.
  ///
  /// In en, this message translates to:
  /// **'Error Boundary component demo'**
  String get uiErrorBoundaryDescription;

  /// No description provided for @uiFileUploadTitle.
  ///
  /// In en, this message translates to:
  /// **'File Upload'**
  String get uiFileUploadTitle;

  /// No description provided for @uiFileUploadDescription.
  ///
  /// In en, this message translates to:
  /// **'File upload component demo'**
  String get uiFileUploadDescription;

  /// No description provided for @uiHoverCardTitle.
  ///
  /// In en, this message translates to:
  /// **'Hover Card'**
  String get uiHoverCardTitle;

  /// No description provided for @uiHoverCardDescription.
  ///
  /// In en, this message translates to:
  /// **'Hover Card component demo'**
  String get uiHoverCardDescription;

  /// No description provided for @uiImageUploadTitle.
  ///
  /// In en, this message translates to:
  /// **'Image Upload'**
  String get uiImageUploadTitle;

  /// No description provided for @uiImageUploadDescription.
  ///
  /// In en, this message translates to:
  /// **'Image upload component demo'**
  String get uiImageUploadDescription;

  /// No description provided for @uiInputGroupTitle.
  ///
  /// In en, this message translates to:
  /// **'Input Group'**
  String get uiInputGroupTitle;

  /// No description provided for @uiInputGroupDescription.
  ///
  /// In en, this message translates to:
  /// **'Input Group component demo'**
  String get uiInputGroupDescription;

  /// No description provided for @uiInputOtpTitle.
  ///
  /// In en, this message translates to:
  /// **'Input OTP'**
  String get uiInputOtpTitle;

  /// No description provided for @uiInputOtpDescription.
  ///
  /// In en, this message translates to:
  /// **'Input OTP component demo'**
  String get uiInputOtpDescription;

  /// No description provided for @uiKbdTitle.
  ///
  /// In en, this message translates to:
  /// **'Kbd'**
  String get uiKbdTitle;

  /// No description provided for @uiKbdDescription.
  ///
  /// In en, this message translates to:
  /// **'Kbd component demo'**
  String get uiKbdDescription;

  /// No description provided for @uiLabelTitle.
  ///
  /// In en, this message translates to:
  /// **'Label'**
  String get uiLabelTitle;

  /// No description provided for @uiLabelDescription.
  ///
  /// In en, this message translates to:
  /// **'Label component demo'**
  String get uiLabelDescription;

  /// No description provided for @uiLogoSpinnerTitle.
  ///
  /// In en, this message translates to:
  /// **'Logo Spinner'**
  String get uiLogoSpinnerTitle;

  /// No description provided for @uiLogoSpinnerDescription.
  ///
  /// In en, this message translates to:
  /// **'Logo Spinner component demo'**
  String get uiLogoSpinnerDescription;

  /// No description provided for @uiMenubarTitle.
  ///
  /// In en, this message translates to:
  /// **'Menubar'**
  String get uiMenubarTitle;

  /// No description provided for @uiMenubarDescription.
  ///
  /// In en, this message translates to:
  /// **'Menubar component demo'**
  String get uiMenubarDescription;

  /// No description provided for @uiNativeSelectTitle.
  ///
  /// In en, this message translates to:
  /// **'Native Select'**
  String get uiNativeSelectTitle;

  /// No description provided for @uiNativeSelectDescription.
  ///
  /// In en, this message translates to:
  /// **'Native Select component demo'**
  String get uiNativeSelectDescription;

  /// No description provided for @uiNavigationMenuTitle.
  ///
  /// In en, this message translates to:
  /// **'Navigation Menu'**
  String get uiNavigationMenuTitle;

  /// No description provided for @uiNavigationMenuDescription.
  ///
  /// In en, this message translates to:
  /// **'Navigation Menu component demo'**
  String get uiNavigationMenuDescription;

  /// No description provided for @uiPaginationTitle.
  ///
  /// In en, this message translates to:
  /// **'Pagination'**
  String get uiPaginationTitle;

  /// No description provided for @uiPaginationDescription.
  ///
  /// In en, this message translates to:
  /// **'Pagination component demo'**
  String get uiPaginationDescription;

  /// No description provided for @uiPopoverTitle.
  ///
  /// In en, this message translates to:
  /// **'Popover'**
  String get uiPopoverTitle;

  /// No description provided for @uiPopoverDescription.
  ///
  /// In en, this message translates to:
  /// **'Popover component demo'**
  String get uiPopoverDescription;

  /// No description provided for @uiProgressTitle.
  ///
  /// In en, this message translates to:
  /// **'Progress'**
  String get uiProgressTitle;

  /// No description provided for @uiProgressDescription.
  ///
  /// In en, this message translates to:
  /// **'Progress component demo'**
  String get uiProgressDescription;

  /// No description provided for @uiRadioGroupTitle.
  ///
  /// In en, this message translates to:
  /// **'Radio Group'**
  String get uiRadioGroupTitle;

  /// No description provided for @uiRadioGroupDescription.
  ///
  /// In en, this message translates to:
  /// **'Radio Group component demo'**
  String get uiRadioGroupDescription;

  /// No description provided for @uiResizableTitle.
  ///
  /// In en, this message translates to:
  /// **'Resizable'**
  String get uiResizableTitle;

  /// No description provided for @uiResizableDescription.
  ///
  /// In en, this message translates to:
  /// **'Resizable component demo'**
  String get uiResizableDescription;

  /// No description provided for @uiScrollAreaTitle.
  ///
  /// In en, this message translates to:
  /// **'Scroll Area'**
  String get uiScrollAreaTitle;

  /// No description provided for @uiScrollAreaDescription.
  ///
  /// In en, this message translates to:
  /// **'Scroll Area component demo'**
  String get uiScrollAreaDescription;

  /// No description provided for @uiScrollToBottomButtonTitle.
  ///
  /// In en, this message translates to:
  /// **'Scroll To Bottom Button'**
  String get uiScrollToBottomButtonTitle;

  /// No description provided for @uiScrollToBottomButtonDescription.
  ///
  /// In en, this message translates to:
  /// **'Scroll To Bottom Button component demo'**
  String get uiScrollToBottomButtonDescription;

  /// No description provided for @uiSelectTitle.
  ///
  /// In en, this message translates to:
  /// **'Select'**
  String get uiSelectTitle;

  /// No description provided for @uiSelectDescription.
  ///
  /// In en, this message translates to:
  /// **'Select component demo'**
  String get uiSelectDescription;

  /// No description provided for @uiSeparatorTitle.
  ///
  /// In en, this message translates to:
  /// **'Separator'**
  String get uiSeparatorTitle;

  /// No description provided for @uiSeparatorDescription.
  ///
  /// In en, this message translates to:
  /// **'Separator component demo'**
  String get uiSeparatorDescription;

  /// No description provided for @uiSheetTitle.
  ///
  /// In en, this message translates to:
  /// **'Sheet'**
  String get uiSheetTitle;

  /// No description provided for @uiSheetDescription.
  ///
  /// In en, this message translates to:
  /// **'Sheet component demo'**
  String get uiSheetDescription;

  /// No description provided for @uiSkeletonTitle.
  ///
  /// In en, this message translates to:
  /// **'Skeleton'**
  String get uiSkeletonTitle;

  /// No description provided for @uiSkeletonDescription.
  ///
  /// In en, this message translates to:
  /// **'Skeleton component demo'**
  String get uiSkeletonDescription;

  /// No description provided for @uiSliderTitle.
  ///
  /// In en, this message translates to:
  /// **'Slider'**
  String get uiSliderTitle;

  /// No description provided for @uiSliderDescription.
  ///
  /// In en, this message translates to:
  /// **'Slider component demo'**
  String get uiSliderDescription;

  /// No description provided for @uiSpinnerTitle.
  ///
  /// In en, this message translates to:
  /// **'Spinner'**
  String get uiSpinnerTitle;

  /// No description provided for @uiSpinnerDescription.
  ///
  /// In en, this message translates to:
  /// **'Spinner component demo'**
  String get uiSpinnerDescription;

  /// No description provided for @uiSwitchTitle.
  ///
  /// In en, this message translates to:
  /// **'Switch'**
  String get uiSwitchTitle;

  /// No description provided for @uiSwitchDescription.
  ///
  /// In en, this message translates to:
  /// **'Switch component demo'**
  String get uiSwitchDescription;

  /// No description provided for @uiTabsTitle.
  ///
  /// In en, this message translates to:
  /// **'Tabs'**
  String get uiTabsTitle;

  /// No description provided for @uiTabsDescription.
  ///
  /// In en, this message translates to:
  /// **'Tabs component demo'**
  String get uiTabsDescription;

  /// No description provided for @uiTextareaTitle.
  ///
  /// In en, this message translates to:
  /// **'Textarea'**
  String get uiTextareaTitle;

  /// No description provided for @uiTextareaDescription.
  ///
  /// In en, this message translates to:
  /// **'Textarea component demo'**
  String get uiTextareaDescription;

  /// No description provided for @uiTimeInputTitle.
  ///
  /// In en, this message translates to:
  /// **'Time Input'**
  String get uiTimeInputTitle;

  /// No description provided for @uiTimeInputDescription.
  ///
  /// In en, this message translates to:
  /// **'Time input component with dropdown selectors and timezone support'**
  String get uiTimeInputDescription;

  /// No description provided for @uiToastTitle.
  ///
  /// In en, this message translates to:
  /// **'Toast'**
  String get uiToastTitle;

  /// No description provided for @uiToastDescription.
  ///
  /// In en, this message translates to:
  /// **'Toast component demo'**
  String get uiToastDescription;

  /// No description provided for @uiToggleTitle.
  ///
  /// In en, this message translates to:
  /// **'Toggle'**
  String get uiToggleTitle;

  /// No description provided for @uiToggleDescription.
  ///
  /// In en, this message translates to:
  /// **'Toggle component demo'**
  String get uiToggleDescription;

  /// No description provided for @uiToggleGroupTitle.
  ///
  /// In en, this message translates to:
  /// **'Toggle Group'**
  String get uiToggleGroupTitle;

  /// No description provided for @uiToggleGroupDescription.
  ///
  /// In en, this message translates to:
  /// **'Toggle Group component demo'**
  String get uiToggleGroupDescription;

  /// No description provided for @uiTooltipTitle.
  ///
  /// In en, this message translates to:
  /// **'Tooltip'**
  String get uiTooltipTitle;

  /// No description provided for @uiTooltipDescription.
  ///
  /// In en, this message translates to:
  /// **'Tooltip component demo'**
  String get uiTooltipDescription;

  /// No description provided for @uiTypographyTitle.
  ///
  /// In en, this message translates to:
  /// **'Typography'**
  String get uiTypographyTitle;

  /// No description provided for @uiTypographyDescription.
  ///
  /// In en, this message translates to:
  /// **'Typography component demo'**
  String get uiTypographyDescription;

  /// No description provided for @uiFormFieldInfoTitle.
  ///
  /// In en, this message translates to:
  /// **'Form Field Info'**
  String get uiFormFieldInfoTitle;

  /// No description provided for @uiFormFieldInfoDescription.
  ///
  /// In en, this message translates to:
  /// **'Error text and validating spinner for form fields'**
  String get uiFormFieldInfoDescription;

  /// No description provided for @uiFormErrorBannerTitle.
  ///
  /// In en, this message translates to:
  /// **'Form Error Banner'**
  String get uiFormErrorBannerTitle;

  /// No description provided for @uiFormErrorBannerDescription.
  ///
  /// In en, this message translates to:
  /// **'Dismissable inline error alert for form-level errors'**
  String get uiFormErrorBannerDescription;

  /// No description provided for @uiStepIndicatorTitle.
  ///
  /// In en, this message translates to:
  /// **'Step Indicator'**
  String get uiStepIndicatorTitle;

  /// No description provided for @uiStepIndicatorDescription.
  ///
  /// In en, this message translates to:
  /// **'Multi-step wizard progress indicator'**
  String get uiStepIndicatorDescription;

  /// No description provided for @usersTitle.
  ///
  /// In en, this message translates to:
  /// **'Users'**
  String get usersTitle;

  /// No description provided for @usersTapToView.
  ///
  /// In en, this message translates to:
  /// **'Tap a row to view details.'**
  String get usersTapToView;

  /// No description provided for @usersLoading.
  ///
  /// In en, this message translates to:
  /// **'Loading users...'**
  String get usersLoading;

  /// No description provided for @usersUserNotFound.
  ///
  /// In en, this message translates to:
  /// **'User not found'**
  String get usersUserNotFound;

  /// No description provided for @usersBackToUsers.
  ///
  /// In en, this message translates to:
  /// **'Back to Users'**
  String get usersBackToUsers;

  /// No description provided for @usersName.
  ///
  /// In en, this message translates to:
  /// **'Name'**
  String get usersName;

  /// No description provided for @usersEmail.
  ///
  /// In en, this message translates to:
  /// **'Email'**
  String get usersEmail;

  /// No description provided for @usersRole.
  ///
  /// In en, this message translates to:
  /// **'Role'**
  String get usersRole;

  /// No description provided for @usersSwipeBack.
  ///
  /// In en, this message translates to:
  /// **'Swipe left to go back...'**
  String get usersSwipeBack;

  /// No description provided for @v1Greeting.
  ///
  /// In en, this message translates to:
  /// **'Welcome to v1'**
  String get v1Greeting;

  /// No description provided for @v1ShellBrand.
  ///
  /// In en, this message translates to:
  /// **'v1'**
  String get v1ShellBrand;

  /// No description provided for @v1ShellNavHome.
  ///
  /// In en, this message translates to:
  /// **'Home'**
  String get v1ShellNavHome;

  /// No description provided for @v1ShellNavUsers.
  ///
  /// In en, this message translates to:
  /// **'Users'**
  String get v1ShellNavUsers;

  /// No description provided for @v1ShellNavChatRoom.
  ///
  /// In en, this message translates to:
  /// **'Chat Room'**
  String get v1ShellNavChatRoom;

  /// No description provided for @v1ShellNavMessages.
  ///
  /// In en, this message translates to:
  /// **'Messages'**
  String get v1ShellNavMessages;

  /// No description provided for @v1ShellNavFindFriends.
  ///
  /// In en, this message translates to:
  /// **'Find Friends'**
  String get v1ShellNavFindFriends;

  /// No description provided for @v1ShellNavUiComponents.
  ///
  /// In en, this message translates to:
  /// **'UI Components'**
  String get v1ShellNavUiComponents;

  /// No description provided for @v1ShellNavForms.
  ///
  /// In en, this message translates to:
  /// **'Forms'**
  String get v1ShellNavForms;

  /// No description provided for @v1ShellNavErrorTest.
  ///
  /// In en, this message translates to:
  /// **'Error Test'**
  String get v1ShellNavErrorTest;

  /// No description provided for @v1ShellNavNotFound.
  ///
  /// In en, this message translates to:
  /// **'Not Found'**
  String get v1ShellNavNotFound;

  /// No description provided for @v1ShellSwipeLeftToClose.
  ///
  /// In en, this message translates to:
  /// **'Swipe left to close'**
  String get v1ShellSwipeLeftToClose;

  /// No description provided for @v1ShellInbox.
  ///
  /// In en, this message translates to:
  /// **'Messages'**
  String get v1ShellInbox;

  /// No description provided for @v1ShellNoUnread.
  ///
  /// In en, this message translates to:
  /// **'No unread messages'**
  String get v1ShellNoUnread;

  /// No description provided for @v1ShellViewAll.
  ///
  /// In en, this message translates to:
  /// **'View all messages'**
  String get v1ShellViewAll;

  /// No description provided for @v1ShellSignOut.
  ///
  /// In en, this message translates to:
  /// **'Sign Out'**
  String get v1ShellSignOut;

  /// No description provided for @v1ShellSignIn.
  ///
  /// In en, this message translates to:
  /// **'Sign In'**
  String get v1ShellSignIn;

  /// No description provided for @v1ShellAccount.
  ///
  /// In en, this message translates to:
  /// **'Account'**
  String get v1ShellAccount;

  /// No description provided for @v1ShellClose.
  ///
  /// In en, this message translates to:
  /// **'Close'**
  String get v1ShellClose;

  /// No description provided for @v1ShellAuthLoading.
  ///
  /// In en, this message translates to:
  /// **'Auth...'**
  String get v1ShellAuthLoading;

  /// No description provided for @v1ShellToggleSidebar.
  ///
  /// In en, this message translates to:
  /// **'Toggle sidebar'**
  String get v1ShellToggleSidebar;

  /// No description provided for @v1ShellSettingsLink.
  ///
  /// In en, this message translates to:
  /// **'Settings'**
  String get v1ShellSettingsLink;

  /// No description provided for @v1ShellNavSettings.
  ///
  /// In en, this message translates to:
  /// **'Settings'**
  String get v1ShellNavSettings;

  /// No description provided for @v1ShellNavFeed.
  ///
  /// In en, this message translates to:
  /// **'Feed'**
  String get v1ShellNavFeed;

  /// No description provided for @v1ShellNavShare.
  ///
  /// In en, this message translates to:
  /// **'Share'**
  String get v1ShellNavShare;

  /// No description provided for @v1ShellNavPremium.
  ///
  /// In en, this message translates to:
  /// **'Premium'**
  String get v1ShellNavPremium;

  /// No description provided for @v1ShellNavAdmin.
  ///
  /// In en, this message translates to:
  /// **'Admin'**
  String get v1ShellNavAdmin;

  /// No description provided for @v1ShellNavAuditLog.
  ///
  /// In en, this message translates to:
  /// **'Audit Log'**
  String get v1ShellNavAuditLog;

  /// No description provided for @v1ShellSkipToContent.
  ///
  /// In en, this message translates to:
  /// **'Skip to content'**
  String get v1ShellSkipToContent;
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
