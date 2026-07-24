// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get accordionTitle => 'Accordion';

  @override
  String get accordionIntro =>
      'A vertically stacked set of interactive headings with expandable content.';

  @override
  String get accordionSingleState => 'Single State Accordion';

  @override
  String get accordionSingleStateDesc =>
      'When a new accordion opens, the other open one closes.';

  @override
  String get accordionMultiState => 'Multi State Accordion';

  @override
  String get accordionMultiStateDesc =>
      'When a new accordion opens, the other open ones don\'t close.';

  @override
  String get accordionRichItems => 'Rich Items';

  @override
  String get accordionRichItemsDesc =>
      'AccordionItemComplex with flexible slots for avatars, badges, and rich content.';

  @override
  String get accordionDefault => 'Default';

  @override
  String get accordionMultipleOpen => 'Multiple Open';

  @override
  String get accordionFaqWithIcons => 'FAQ with Icons';

  @override
  String get accordionUserProfiles => 'User Profiles';

  @override
  String get accordionAccessibleQ => 'Is it accessible?';

  @override
  String get accordionAccessibleA =>
      'Yes. It adheres to WAI-ARIA standards and is fully keyboard navigable.';

  @override
  String get accordionStyledQ => 'Is it styled?';

  @override
  String get accordionStyledA =>
      'Yes. It comes with default styles that integrate seamlessly with your design system.';

  @override
  String get accordionAnimatedQ => 'Is it animated?';

  @override
  String get accordionAnimatedA =>
      'Yes. It features smooth expand/collapse animations with cubic-bezier easing.';

  @override
  String get accordionFaq1Title => 'What is this component?';

  @override
  String get accordionFaq1Desc => 'Learn about our accordion system';

  @override
  String get accordionFaq1Content1 =>
      'An accordion component that organizes content into expandable sections.';

  @override
  String get accordionFaq1Content2 =>
      'Click on any trigger to reveal the associated content panel.';

  @override
  String get accordionFaq2Title => 'How do I customize it?';

  @override
  String get accordionFaq2Desc => 'Theme and variant options';

  @override
  String get accordionFaq2Content1 =>
      'Use the global theme switcher in the navbar to change the accordion variant.';

  @override
  String get accordionFaq2Content2 =>
      'All accordion components will update automatically to match the selected theme.';

  @override
  String get accordionFaq3Title => 'Can I use it with multiple sections open?';

  @override
  String get accordionFaq3Desc => 'Single vs multiple expand modes';

  @override
  String get accordionFaq3Content1 =>
      'Yes, set the type prop to \"multiple\" on the Accordion to allow multiple items open simultaneously.';

  @override
  String get accordionFaq3Content2 =>
      'For single-expand behavior, use type=\"single\" with the collapsible prop.';

  @override
  String get accordionCategoryGeneral => 'General';

  @override
  String get accordionCategoryCustomization => 'Customization';

  @override
  String get accordionCategoryBehavior => 'Behavior';

  @override
  String get accordionSarahName => 'Sarah Johnson';

  @override
  String get accordionSarahRole => 'Product Designer';

  @override
  String get accordionSarahBio =>
      'Sarah is a product designer with 5+ years of experience in creating user-centered digital experiences.';

  @override
  String get accordionMikeName => 'Mike Chen';

  @override
  String get accordionMikeRole => 'Senior Engineer';

  @override
  String get accordionMikeBio =>
      'Mike is a full-stack engineer specializing in React, Node.js, and cloud infrastructure.';

  @override
  String get accordionStatusActive => 'Active';

  @override
  String get accordionSkillFigma => 'Figma';

  @override
  String get accordionSkillPrototyping => 'Prototyping';

  @override
  String get accordionSkillUserResearch => 'User Research';

  @override
  String get accordionSkillReact => 'React';

  @override
  String get accordionSkillTypeScript => 'TypeScript';

  @override
  String get accordionSkillAWS => 'AWS';

  @override
  String get adminTitle => 'Admin';

  @override
  String get adminSearchPlaceholder => 'Search users by name or email...';

  @override
  String get adminSearching => 'Searching...';

  @override
  String get adminNoUsersFound => 'No users found';

  @override
  String get adminAuditLogTitle => 'Audit Log';

  @override
  String get adminAllActions => 'All actions';

  @override
  String get adminAllLevels => 'All levels';

  @override
  String get adminEntityType => 'Entity type...';

  @override
  String get adminLoading => 'Loading...';

  @override
  String get adminNoEntriesFound => 'No audit log entries found.';

  @override
  String get adminTime => 'Time';

  @override
  String get adminAction => 'Action';

  @override
  String get adminLevel => 'Level';

  @override
  String get adminActor => 'Actor';

  @override
  String get adminEntity => 'Entity';

  @override
  String get adminSummary => 'Summary';

  @override
  String get adminIp => 'IP';

  @override
  String get adminHide => 'Hide';

  @override
  String get adminDiff => 'Diff';

  @override
  String adminTotalEntries(Object total) {
    return '$total total entries';
  }

  @override
  String get adminPrev => 'Prev';

  @override
  String adminPageOf(Object page, Object totalPages) {
    return 'Page $page of $totalPages';
  }

  @override
  String get adminNext => 'Next';

  @override
  String get adminChangeDetails => 'Change Details';

  @override
  String get adminBefore => 'Before';

  @override
  String get adminAfter => 'After';

  @override
  String get adminSystem => 'system';

  @override
  String get adminAccessDenied => 'You do not have admin access.';

  @override
  String get apiKeysErrorsNameExists =>
      'An API key with this name already exists';

  @override
  String get authFormLoginTitle => 'Sign In';

  @override
  String get authFormLoginHeading => 'Sign in to your account';

  @override
  String get authFormLoginEmailLabel => 'Email address';

  @override
  String get authFormLoginEmailPlaceholder => 'you@example.com';

  @override
  String get authFormLoginPasswordLabel => 'Password';

  @override
  String get authFormLoginPasswordPlaceholder => 'Enter your password';

  @override
  String get authFormLoginRememberMe => 'Remember me';

  @override
  String get authFormLoginForgotPassword => 'Forgot password?';

  @override
  String get authFormLoginSubmit => 'Sign In';

  @override
  String get authFormLoginSubmitting => 'Signing in...';

  @override
  String get authFormLoginNoAccount => 'Don\'t have an account?';

  @override
  String get authFormLoginRegisterLink => 'Sign up';

  @override
  String get authFormLoginMfaTitle => 'Two-Factor Authentication';

  @override
  String get authFormLoginMfaCodeLabel => 'Authentication code';

  @override
  String get authFormLoginMfaVerify => 'Verify';

  @override
  String get authFormLoginMfaVerifying => 'Verifying...';

  @override
  String get authFormRegisterTitle => 'Create your account';

  @override
  String get authFormRegisterHeading => 'Create your account';

  @override
  String get authFormRegisterSubheading =>
      'Fill in your details to get started.';

  @override
  String get authFormRegisterNameLabel => 'Name';

  @override
  String get authFormRegisterNamePlaceholder => 'John Doe';

  @override
  String get authFormRegisterFirstNameLabel => 'First name';

  @override
  String get authFormRegisterFirstNamePlaceholder => 'John';

  @override
  String get authFormRegisterLastNameLabel => 'Last name';

  @override
  String get authFormRegisterLastNamePlaceholder => 'Doe';

  @override
  String get authFormRegisterEmailLabel => 'Email address';

  @override
  String get authFormRegisterEmailPlaceholder => 'you@example.com';

  @override
  String get authFormRegisterPasswordLabel => 'Password';

  @override
  String get authFormRegisterPasswordPlaceholder => 'At least 8 characters';

  @override
  String get authFormRegisterConfirmPasswordLabel => 'Confirm password';

  @override
  String get authFormRegisterConfirmPasswordPlaceholder =>
      'Re-enter your password';

  @override
  String get authFormRegisterSubmit => 'Create account';

  @override
  String get authFormRegisterSubmitting => 'Creating account...';

  @override
  String get authFormRegisterHasAccount => 'Already have an account?';

  @override
  String get authFormRegisterLoginLink => 'Sign in';

  @override
  String get authFormResetPasswordTitle => 'Set New Password';

  @override
  String get authFormResetPasswordPasswordLabel => 'New Password';

  @override
  String get authFormResetPasswordConfirmPasswordLabel => 'Confirm Password';

  @override
  String get authFormResetPasswordSubmit => 'Set Password';

  @override
  String get authFormResetPasswordSubmitting => 'Setting password...';

  @override
  String get authFormResetPasswordSuccess =>
      'Your password has been set. You can now sign in.';

  @override
  String get authFormResetPasswordLoginLink => 'Sign In';

  @override
  String get authFormForgotPasswordTitle => 'Forgot Password';

  @override
  String get authFormForgotPasswordEmailLabel => 'Email address';

  @override
  String get authFormForgotPasswordEmailPlaceholder => 'you@example.com';

  @override
  String get authFormForgotPasswordSubmit => 'Send Reset Link';

  @override
  String get authFormForgotPasswordSubmitting => 'Sending...';

  @override
  String get authFormForgotPasswordSuccess =>
      'If an account exists with this email, you will receive a password reset link.';

  @override
  String get authFormForgotPasswordLoginLink => 'Back to Sign In';

  @override
  String get authFormVerifyEmailTitle => 'Verify Email';

  @override
  String get authFormVerifyEmailVerifying => 'Verifying your email...';

  @override
  String get authFormVerifyEmailSuccess =>
      'Your email has been verified. You can now sign in.';

  @override
  String get authFormVerifyEmailLoginLink => 'Sign In';

  @override
  String get authSocialContinueWith => 'Or continue with';

  @override
  String get authLoading => 'Loading...';

  @override
  String authSignedInAs(Object email) {
    return 'Signed in as $email';
  }

  @override
  String get authRole => 'Role:';

  @override
  String get authStatus => 'Status:';

  @override
  String get authErrorsEmailRequired => 'Email is required';

  @override
  String get authErrorsEmailInvalid => 'Invalid email address';

  @override
  String get authErrorsPasswordRequired => 'Password is required';

  @override
  String get authErrorsPasswordMin => 'Password must be at least 8 characters';

  @override
  String get authErrorsPasswordMax => 'Password must be at most 128 characters';

  @override
  String get authErrorsPasswordMin6 => 'Password must be at least 6 characters';

  @override
  String get authErrorsFirstNameRequired => 'First name is required';

  @override
  String get authErrorsLastNameRequired => 'Last name is required';

  @override
  String get authErrorsConfirmPasswordRequired =>
      'Please confirm your password';

  @override
  String get authErrorsPasswordsMustMatch => 'Passwords do not match';

  @override
  String get authErrorsLoginFailed => 'Invalid credentials. Please try again.';

  @override
  String get authErrorsRegisterFailed =>
      'Registration failed. Please try again.';

  @override
  String get authErrorsEmailTaken => 'This email is already registered';

  @override
  String get authErrorsResetPasswordTokenMissing =>
      'Reset password token is missing';

  @override
  String get authErrorsResetPasswordFailed => 'Password reset failed';

  @override
  String get authErrorsVerifyEmailTokenMissing =>
      'Verification token is missing';

  @override
  String get authErrorsVerifyEmailFailed => 'Email verification failed';

  @override
  String get chatRoomTitle => 'Chat Rooms';

  @override
  String get chatRoomConnected => 'Connected';

  @override
  String get chatRoomConnecting => 'Connecting...';

  @override
  String get chatRoomDisconnected => 'Disconnected';

  @override
  String get chatRoomRooms => 'Rooms';

  @override
  String chatRoomOnline(Object count) {
    return 'Online ($count)';
  }

  @override
  String get chatRoomNoOneHere => 'No one here yet';

  @override
  String get chatRoomNoMessages => 'No messages yet. Start the conversation!';

  @override
  String get chatRoomSend => 'Send';

  @override
  String chatRoomMessagePlaceholder(Object room) {
    return 'Message #$room';
  }

  @override
  String get chatRoomOpenRooms => 'Open rooms';

  @override
  String chatRoomCountOnline(Object count) {
    return '$count online';
  }

  @override
  String get chatRoomSignInRequired => 'Sign in to join chat rooms';

  @override
  String get chatRoomRoomMembers => 'Members';

  @override
  String get chatRoomLoadEarlier => 'Load earlier messages';

  @override
  String get checkoutSignInToUpgrade => 'Sign in to upgrade your plan';

  @override
  String get checkoutUpgrade => 'Upgrade';

  @override
  String get checkoutChangePlan => 'Change plan';

  @override
  String get checkoutCheckout => 'Checkout';

  @override
  String get checkoutEnterCardDetails => 'Enter your card details to upgrade.';

  @override
  String get checkoutChangedImmediately =>
      'Your plan will be changed immediately.';

  @override
  String get checkoutAlreadyOnPlan => 'You are already on this plan.';

  @override
  String get checkoutUpgradeSuccess => 'Upgrade successful!';

  @override
  String get checkoutPlanChanged => 'Plan changed!';

  @override
  String get checkoutRedirecting => 'Redirecting to pricing...';

  @override
  String checkoutConfirmDowngrade(Object tier) {
    return 'Confirm downgrade to $tier';
  }

  @override
  String get checkoutViewPlans => 'View plans';

  @override
  String get checkoutUpgradeToView =>
      'Upgrade to view premium features and stats.';

  @override
  String get checkoutCardNumberRequired => 'Card number is required';

  @override
  String get checkoutInvalidCardNumber => 'Invalid card number';

  @override
  String get checkoutExpiryRequired => 'Expiry is required';

  @override
  String get checkoutInvalidExpiry => 'Invalid expiry';

  @override
  String get checkoutCardExpired => 'Card has expired';

  @override
  String get checkoutCvcRequired => 'CVC is required';

  @override
  String get checkoutInvalidCvc => 'Invalid CVC';

  @override
  String get checkoutNameRequired => 'Cardholder name is required';

  @override
  String get checkoutProcessing => 'Processing...';

  @override
  String checkoutSubscribeTo(Object tier) {
    return 'Subscribe to $tier';
  }

  @override
  String get checkoutCardNumber => 'Card number';

  @override
  String get checkoutMm => 'MM';

  @override
  String get checkoutYy => 'YY';

  @override
  String get checkoutCvc => 'CVC';

  @override
  String get checkoutCardholderName => 'Cardholder name';

  @override
  String get checkoutTestCards => 'Test cards:';

  @override
  String get checkoutMonth => 'Month';

  @override
  String get checkoutYear => 'Year';

  @override
  String get checkoutPaymentFailedGeneric =>
      'Payment failed. Please try again.';

  @override
  String get errorNotFound => 'Not found';

  @override
  String get errorPageNotFound => 'This page could not be found.';

  @override
  String get errorV1NotFound => 'This v1 resource does not exist.';

  @override
  String get errorRoutingNotFound => 'This routing resource does not exist.';

  @override
  String get errorBackHome => 'Go home';

  @override
  String get errorBackToV1 => 'Back to v1 home';

  @override
  String get errorSomethingWentWrong => 'Something went wrong';

  @override
  String get errorSomethingWentWrongV1 => 'Something went wrong in v1';

  @override
  String get errorReference => 'Reference:';

  @override
  String get errorTryAgain => 'Try again';

  @override
  String get errorFailedToLoad => 'Failed to load messages';

  @override
  String get errorLoadingMessages => 'Loading messages...';

  @override
  String get errorAccessDenied => 'Access denied. Admins only.';

  @override
  String get errorLoadingTheSlowRoute => 'Loading the slow route…';

  @override
  String get errorConnectionLost => 'Connection lost';

  @override
  String get errorTryingToReconnect =>
      'Trying to reconnect. Some features may be unavailable.';

  @override
  String get errorTabLocked => 'Already connected in another tab';

  @override
  String get errorTabLockedDescription =>
      'This browser already has an active connection. Close the other tab or this one to continue.';

  @override
  String get feedFeed => 'Feed';

  @override
  String get feedShare => 'Share';

  @override
  String get feedSearchPlaceholder => 'Search posts...';

  @override
  String get feedNoPostsYet => 'No posts yet.';

  @override
  String get feedBeFirstToShare => 'Be the first to share';

  @override
  String get feedNewPostsAvailable => 'New posts available — tap to load';

  @override
  String get feedLoadingMore => 'Loading more...';

  @override
  String get feedAllCaughtUp => 'All caught up';

  @override
  String get feedYourPostStats => 'Your Post Stats';

  @override
  String get feedLoadStats => 'Load stats';

  @override
  String get feedLoading => 'Loading...';

  @override
  String get feedPosts => 'Posts';

  @override
  String get feedReactions => 'Reactions';

  @override
  String get feedAvgPerPost => 'Avg/Post';

  @override
  String get feedFailedToLoadStats => 'Failed to load stats';

  @override
  String get feedFailedToLoadPosts => 'Failed to load posts';

  @override
  String get feedNetworkError => 'Network error';

  @override
  String get findFriendsTitle => 'Find Friends';

  @override
  String get findFriendsAddFriends => 'Add Friends';

  @override
  String get findFriendsPendingRequests => 'Pending Requests';

  @override
  String get findFriendsSearchHint => 'Type at least 3 characters to search...';

  @override
  String get findFriendsSearching => 'Searching...';

  @override
  String get findFriendsNoUsersFound => 'No users found.';

  @override
  String get findFriendsPending => 'Pending';

  @override
  String get findFriendsAddFriend => 'Add Friend';

  @override
  String get findFriendsPrev => 'Prev';

  @override
  String get findFriendsNext => 'Next';

  @override
  String get findFriendsNoRequests => 'No pending friend requests.';

  @override
  String get findFriendsAccept => 'Accept';

  @override
  String get findFriendsDecline => 'Decline';

  @override
  String get findFriendsAwaiting => 'Awaiting response';

  @override
  String get findFriendsSentByYou => '(sent by you)';

  @override
  String findFriendsUsersFound(Object count) {
    return '$count users found';
  }

  @override
  String get findFriendsSuggestedFriends => 'Suggested Friends';

  @override
  String get findFriendsSuggestedFriendsDesc => 'People you may know';

  @override
  String get findFriendsLoadSuggestions => 'Load suggestions';

  @override
  String get findFriendsLoadingSuggestions => 'Loading...';

  @override
  String get findFriendsNoSuggestions => 'No suggestions yet';

  @override
  String findFriendsMutualFriends(Object count) {
    return '$count mutual friends';
  }

  @override
  String get findFriendsFailedToLoadSuggestions => 'Failed to load suggestions';

  @override
  String get findFriendsSignInRequired => 'Sign in to find friends';

  @override
  String get formsGalleryPageTitle => 'Forms Demo';

  @override
  String get formsGalleryPageDescription =>
      'Real-world form patterns built with TanStack Form';

  @override
  String get formsGalleryBack => 'Back';

  @override
  String get formsGalleryBreadcrumbLabel => 'Forms';

  @override
  String get formsGalleryTitle => 'Forms Demo';

  @override
  String get formsGalleryDescription =>
      'Real-world form patterns built with TanStack Form';

  @override
  String get formsBadgeReal => 'Real';

  @override
  String get formsBadgeSimulated => 'Simulated';

  @override
  String get formsBadgeMixed => 'Mixed';

  @override
  String get formsBadgeNone => 'Demo';

  @override
  String get formsExamplesProfileTitle => 'User Profile';

  @override
  String get formsExamplesProfileDescription =>
      'Every input type + real field-level server error';

  @override
  String get formsExamplesTeamInviteTitle => 'Team Invite';

  @override
  String get formsExamplesTeamInviteDescription =>
      'Multi-step wizard with server actions';

  @override
  String get formsExamplesApiKeyTitle => 'API Key Manager';

  @override
  String get formsExamplesApiKeyDescription =>
      'Real mutations, optimistic list, reveal-once secret';

  @override
  String get formsExamplesBillingTitle => 'Billing';

  @override
  String get formsExamplesBillingDescription =>
      'Dependent fields with auto-save and coupon validation';

  @override
  String get formsExamplesFiltersTitle => 'Filters';

  @override
  String get formsExamplesFiltersDescription =>
      'URL-synced filter panel with debounced search';

  @override
  String get formsExamplesFieldStatesTitle => 'Field States & Validation';

  @override
  String get formsExamplesFieldStatesDescription =>
      'All field states and validation modes reference';

  @override
  String get formsExamplesUploadsTitle => 'File Uploads';

  @override
  String get formsExamplesUploadsDescription =>
      'Real avatar/gallery uploads with progress bars';

  @override
  String get formsExamplesErrorLabTitle => 'Error Lab';

  @override
  String get formsExamplesErrorLabDescription =>
      'Test every error surface and locale combination';

  @override
  String get formsExamplesCheckoutTitle => 'Checkout & Addresses';

  @override
  String get formsExamplesCheckoutDescription =>
      'Reusable address field groups with linked fields';

  @override
  String get formsExamplesContentEditorTitle => 'Content Editor';

  @override
  String get formsExamplesContentEditorDescription =>
      'Submit intents, drafts, and unsaved-changes guard';

  @override
  String get formsExamplesFormBuilderTitle => 'Form Builder';

  @override
  String get formsExamplesFormBuilderDescription =>
      'Schema-driven dynamic form generation';

  @override
  String get formsExamplesEditableTableTitle => 'Editable Table';

  @override
  String get formsExamplesEditableTableDescription =>
      'Inline row editing with per-row persistence';

  @override
  String get formsExamplesAdvancedTitle => 'Advanced Patterns';

  @override
  String get formsExamplesAdvancedDescription =>
      'Conditional fields, server error mapping, array sub-forms';

  @override
  String get formsExamplesElementsTitle => 'Form Elements';

  @override
  String get formsExamplesElementsDescription =>
      'Input groups, selects, textareas, checkboxes, radios, toggles, and validation states';

  @override
  String get formsExamplesLayoutsTitle => 'Form Layouts';

  @override
  String get formsExamplesLayoutsDescription =>
      'Basic stacked, grid, icon-prefixed, and sectioned card form patterns';

  @override
  String get formsProfileHeading => 'User Profile';

  @override
  String get formsProfileFirstName => 'First Name';

  @override
  String get formsProfileLastName => 'Last Name';

  @override
  String get formsProfileUsername => 'Username';

  @override
  String get formsProfileEmail => 'Email';

  @override
  String get formsProfileBio => 'Bio';

  @override
  String get formsProfileCountry => 'Country';

  @override
  String get formsProfileLanguage => 'Language';

  @override
  String get formsProfileNewsletter => 'Subscribe to newsletter';

  @override
  String get formsProfileInterests => 'Interests';

  @override
  String get formsProfileRole => 'Role';

  @override
  String get formsProfileBirthDate => 'Birth Date';

  @override
  String get formsProfileMeetingTime => 'Meeting Time';

  @override
  String get formsProfileNotificationPrefs => 'Notification Preferences';

  @override
  String get formsProfileSave => 'Save Profile';

  @override
  String get formsProfileSaving => 'Saving...';

  @override
  String get formsProfileSaveSuccess => 'Profile updated successfully';

  @override
  String get formsProfileDemoOnlyFields =>
      'The following fields are demo-only and not persisted';

  @override
  String get formsProfileUsernameChecking => 'Checking availability…';

  @override
  String get formsProfileUsernameAvailable => 'Available';

  @override
  String get formsProfileUsernameTaken => 'Already taken';

  @override
  String get formsProfileFirstNameRequired => 'First name is required';

  @override
  String get formsProfileLastNameRequired => 'Last name is required';

  @override
  String get formsProfileUsernameMin =>
      'Username must be at least 2 characters';

  @override
  String get formsProfileEmailInvalid => 'Invalid email';

  @override
  String get formsProfileUsernameHint =>
      '3–30 characters: lowercase letters, numbers, and _ only';

  @override
  String get formsProfileBioHint => 'Up to 500 characters';

  @override
  String get formsTeamInviteHeading => 'Invite Team Members';

  @override
  String get formsTeamInviteStepEmails => 'Email Addresses';

  @override
  String get formsTeamInviteStepRole => 'Role & Permissions';

  @override
  String get formsTeamInviteStepMessage => 'Optional Message';

  @override
  String get formsTeamInviteStepReview => 'Review & Send';

  @override
  String get formsTeamInviteNext => 'Next';

  @override
  String get formsTeamInviteBack => 'Back';

  @override
  String get formsTeamInviteSend => 'Send Invites';

  @override
  String get formsTeamInviteSending => 'Sending...';

  @override
  String get formsTeamInviteEmailPlaceholder => 'Enter email and press Enter';

  @override
  String get formsTeamInviteEmailDuplicate => 'Duplicate email address';

  @override
  String get formsTeamInviteRoleLabel => 'Role';

  @override
  String get formsTeamInviteMessageLabel => 'Personal Message (optional)';

  @override
  String get formsTeamInviteMessagePlaceholder => 'Add a personal note...';

  @override
  String get formsTeamInviteInviteSent => 'Invites sent successfully';

  @override
  String get formsTeamInviteInviteFailed => 'Failed to send invites';

  @override
  String get formsTeamInviteEmailRequired => 'At least one email is required';

  @override
  String get formsTeamInviteEmailInvalid => 'Invalid email format';

  @override
  String get formsTeamInviteRoleRequired => 'Please select a role';

  @override
  String get formsTeamInviteQuotaTitle => 'Upgrade Required';

  @override
  String get formsTeamInviteQuotaBody =>
      'You can invite up to 5 team members on your current plan.';

  @override
  String get formsTeamInviteEmails => 'Emails';

  @override
  String get formsTeamInviteRole => 'Role';

  @override
  String get formsTeamInviteMessage => 'Message';

  @override
  String get formsTeamInviteEmailChipRemove => 'Remove email';

  @override
  String get formsApiKeyHeading => 'API Key Manager';

  @override
  String get formsApiKeyNameLabel => 'Key Name';

  @override
  String get formsApiKeyNamePlaceholder => 'e.g. CI/CD, Development';

  @override
  String get formsApiKeyExpiresLabel => 'Expiry';

  @override
  String get formsApiKeyExpires30 => '30 Days';

  @override
  String get formsApiKeyExpires60 => '60 Days';

  @override
  String get formsApiKeyExpires90 => '90 Days';

  @override
  String get formsApiKeyExpiresNever => 'No Expiry';

  @override
  String get formsApiKeyPermissionsLabel => 'Permissions';

  @override
  String get formsApiKeySelectAll => 'Select All';

  @override
  String get formsApiKeyIpWhitelistLabel => 'IP Whitelist (optional)';

  @override
  String get formsApiKeyIpPlaceholder =>
      'e.g. 203.0.113.42 — one address per line';

  @override
  String get formsApiKeyCreate => 'Create API Key';

  @override
  String get formsApiKeyCreating => 'Creating...';

  @override
  String get formsApiKeyCreated => 'API key created — copy it now';

  @override
  String get formsApiKeyCopied => 'Copied to clipboard';

  @override
  String get formsApiKeyRevoke => 'Revoke';

  @override
  String get formsApiKeyRevokeConfirm =>
      'Revoke this API key? This cannot be undone.';

  @override
  String get formsApiKeyRevokeConfirmDescription =>
      'This will permanently revoke the key and all associated tokens.';

  @override
  String get formsApiKeyRevoked => 'API key revoked';

  @override
  String get formsApiKeyRevealSecret => 'Your API Key';

  @override
  String get formsApiKeySecretNote => 'You won\'t see this again';

  @override
  String get formsApiKeyEmpty => 'No API keys yet';

  @override
  String get formsApiKeyLoadFailed => 'Failed to load API keys';

  @override
  String get formsApiKeyReveal => 'Reveal';

  @override
  String get formsApiKeyCopy => 'Copy';

  @override
  String get formsApiKeyDismiss => 'Dismiss';

  @override
  String get formsApiKeyCancel => 'Cancel';

  @override
  String get formsApiKeyNewKey => 'New Key';

  @override
  String get formsApiKeyNameRequired => 'Key name is required';

  @override
  String get formsApiKeyNameTooLong =>
      'Key name must be 60 characters or fewer';

  @override
  String get formsApiKeyNameExists => 'You already have a key with this name';

  @override
  String get formsApiKeyAddIp => 'Add';

  @override
  String get formsApiKeyIpInvalid =>
      'Enter a valid IPv4 address, e.g. 203.0.113.42';

  @override
  String get formsApiKeyRemoveIp => 'Remove IP address';

  @override
  String get formsBillingHeading => 'Billing & Plan';

  @override
  String get formsBillingPlan => 'Plan';

  @override
  String get formsBillingBillingPeriod => 'Billing Period';

  @override
  String get formsBillingMonthly => 'Monthly';

  @override
  String get formsBillingYearly => 'Yearly (Save 20%)';

  @override
  String get formsBillingPaymentMethod => 'Payment Method';

  @override
  String get formsBillingCouponCode => 'Coupon Code';

  @override
  String get formsBillingCouponPlaceholder => 'Enter coupon code';

  @override
  String get formsBillingCouponChecking => 'Checking coupon...';

  @override
  String get formsBillingCouponApplied => 'Coupon applied';

  @override
  String get formsBillingCouponOff => 'off';

  @override
  String get formsBillingTaxId => 'Tax ID (VAT only)';

  @override
  String get formsBillingTaxIdPlaceholder => 'Enter tax ID';

  @override
  String get formsBillingPriceSummary => 'Price Summary';

  @override
  String get formsBillingSubtotal => 'Subtotal';

  @override
  String get formsBillingDiscount => 'Discount';

  @override
  String get formsBillingTotal => 'Total';

  @override
  String get formsBillingAutoSave => 'Auto-saved';

  @override
  String get formsBillingAutoSaveFailed => 'Auto-save failed';

  @override
  String get formsBillingSaveSuccess => 'Billing updated';

  @override
  String get formsBillingUnsaved => 'Unsaved changes';

  @override
  String get formsBillingUpdateButton => 'Update Billing';

  @override
  String get formsBillingPlanRequired => 'Please select a plan';

  @override
  String get formsBillingPeriodRequired => 'Please select a billing period';

  @override
  String get formsBillingTaxIdInvalid =>
      'Tax ID format looks wrong — expect a 2-letter country code followed by 2–13 digits/letters';

  @override
  String get formsBillingCouponHint =>
      'Case-insensitive — try SAVE10 or WELCOME20';

  @override
  String get formsBillingTaxIdHint =>
      '2-letter country code + 2–13 digits/letters, e.g. GB123456789';

  @override
  String get formsFiltersHeading => 'Filters';

  @override
  String get formsFiltersSearch => 'Search';

  @override
  String get formsFiltersSearchPlaceholder => 'Search...';

  @override
  String get formsFiltersCategory => 'Category';

  @override
  String get formsFiltersCategoryPlaceholder => 'Select categories';

  @override
  String get formsFiltersTags => 'Tags';

  @override
  String get formsFiltersTagsPlaceholder => 'Type to add tags';

  @override
  String get formsFiltersDateRange => 'Date Range';

  @override
  String get formsFiltersSortBy => 'Sort By';

  @override
  String get formsFiltersSortOrder => 'Order';

  @override
  String get formsFiltersAsc => 'Ascending';

  @override
  String get formsFiltersDesc => 'Descending';

  @override
  String get formsFiltersPageSize => 'Per Page';

  @override
  String get formsFiltersStatus => 'Status';

  @override
  String get formsFiltersReset => 'Reset Filters';

  @override
  String get formsFiltersResults => 'Showing resolved state';

  @override
  String get formsFieldStatesHeading => 'Field States & Validation Modes';

  @override
  String get formsFieldStatesDefault => 'Default';

  @override
  String get formsFieldStatesFilled => 'Filled';

  @override
  String get formsFieldStatesError => 'Error';

  @override
  String get formsFieldStatesWarning => 'Warning';

  @override
  String get formsFieldStatesDisabled => 'Disabled';

  @override
  String get formsFieldStatesLoading => 'Loading';

  @override
  String get formsFieldStatesReadOnly => 'Read Only';

  @override
  String get formsFieldStatesRequired => 'Required';

  @override
  String get formsFieldStatesValidationModes => 'Validation Modes';

  @override
  String get formsFieldStatesEager => 'Eager (onChange)';

  @override
  String get formsFieldStatesClassic => 'Classic (onBlur)';

  @override
  String get formsFieldStatesDynamic => 'Dynamic (reward early, punish late)';

  @override
  String get formsFieldStatesLinkedFields => 'Linked Fields';

  @override
  String get formsFieldStatesConfirmPassword => 'Confirm Password';

  @override
  String get formsFieldStatesPassword => 'Password';

  @override
  String get formsFieldStatesNameMin => 'Name must be at least 2 characters';

  @override
  String get formsFieldStatesEmailInvalid => 'Invalid email address';

  @override
  String get formsFieldStatesRoleRequired => 'Please select a role';

  @override
  String get formsFieldStatesAsyncChecked => 'Async (onBlur + server)';

  @override
  String get formsUploadsHeading => 'File Uploads & Attachments';

  @override
  String get formsUploadsAvatar => 'Avatar';

  @override
  String get formsUploadsGallery => 'Gallery';

  @override
  String get formsUploadsDocuments => 'Documents';

  @override
  String get formsUploadsUploadLabel => 'Upload files';

  @override
  String get formsUploadsSimulatedNote =>
      'This section uses simulated backend — real file upload would 415';

  @override
  String get formsUploadsAvatarDescription =>
      'Single image, 5 MB max, uploaded on selection';

  @override
  String get formsUploadsGalleryDescription =>
      'Up to 6 images, parallel XHR uploads with real progress';

  @override
  String get formsUploadsDocumentsDescription =>
      'Simulated — the backend only accepts images (JPEG, PNG, WebP, GIF, AVIF). This section shows where a real generic-file route would go.';

  @override
  String get formsUploadsLabelsDropzoneIdle =>
      'Drop images here or click to browse';

  @override
  String get formsUploadsLabelsDropzoneActive => 'Drop images here';

  @override
  String get formsUploadsLabelsUploaded => 'Uploaded';

  @override
  String get formsUploadsLabelsUploadFailed => 'Upload failed';

  @override
  String get formsUploadsLabelsUploading => 'Uploading...';

  @override
  String formsUploadsLabelsRemove(Object file) {
    return 'Remove $file';
  }

  @override
  String get formsUploadsLabelsDocDropzoneIdle => 'Drag PDF/DOCX here';

  @override
  String get formsUploadsLabelsDocDropzoneActive => 'Drop files here';

  @override
  String formsUploadsLabelsInvalidType(Object accepted, Object file) {
    return 'Only $accepted files are allowed — got $file';
  }

  @override
  String get formsUploadsLabelsAcceptedImages => 'Images';

  @override
  String get formsUploadsLabelsAcceptedPdfWord => 'PDF, Word';

  @override
  String formsUploadsLabelsMaxSize(Object max) {
    return 'Max $max per file';
  }

  @override
  String get formsUploadsInvalidFileType => 'Invalid file type';

  @override
  String get formsErrorLabHeading => 'Error & Async States Lab';

  @override
  String get formsErrorLabScenario => 'Error Scenario';

  @override
  String get formsErrorLabLocale => 'Locale';

  @override
  String get formsErrorLabNetwork => 'Network Condition';

  @override
  String get formsErrorLabInstant => 'Instant';

  @override
  String get formsErrorLabDelayed => 'Delayed (800ms)';

  @override
  String get formsErrorLabTimeout => 'Timeout (5s)';

  @override
  String get formsErrorLabOffline => 'Offline';

  @override
  String get formsErrorLabRandomFail => 'Random Failure (30%)';

  @override
  String get formsErrorLabTrigger => 'Trigger Error';

  @override
  String get formsErrorLabPayloadInspector => 'Raw Payload';

  @override
  String get formsErrorLabEn => 'English';

  @override
  String get formsErrorLabTr => 'Turkish';

  @override
  String get formsErrorLabSubheading =>
      'Test every error surface and locale combination';

  @override
  String get formsErrorLabScenarioLabel => 'Error Scenario';

  @override
  String get formsErrorLabLocaleLabel => 'Locale';

  @override
  String get formsErrorLabNetworkLabel => 'Network Condition';

  @override
  String get formsErrorLabTriggering => 'Triggering...';

  @override
  String get formsErrorLabRawPayload => 'Raw Payload';

  @override
  String get formsCheckoutTabHeading => 'Checkout';

  @override
  String get formsCheckoutTabShippingAddress => 'Shipping Address';

  @override
  String get formsCheckoutTabBillingAddress => 'Billing Address';

  @override
  String get formsCheckoutTabBillingSameAsShipping => 'Same as shipping';

  @override
  String get formsCheckoutTabStreet => 'Street';

  @override
  String get formsCheckoutTabCity => 'City';

  @override
  String get formsCheckoutTabProvince => 'Province / State';

  @override
  String get formsCheckoutTabPostalCode => 'Postal Code';

  @override
  String get formsCheckoutTabCountry => 'Country';

  @override
  String get formsCheckoutTabPhone => 'Phone';

  @override
  String get formsCheckoutTabEmail => 'Email';

  @override
  String get formsCheckoutTabConfirmEmail => 'Confirm Email';

  @override
  String get formsCheckoutTabOrderSummary => 'Order Summary';

  @override
  String get formsCheckoutTabPlaceOrder => 'Place Order';

  @override
  String get formsCheckoutTabPaymentMethod => 'Payment Method';

  @override
  String get formsCheckoutTabAddPaymentMethod => 'Add Payment Method';

  @override
  String get formsCheckoutTabStripeSetup => 'Add card via Stripe';

  @override
  String get formsCheckoutTabPaymentDeclined => 'Payment declined';

  @override
  String get formsCheckoutTabOrderPlaced => 'Order placed successfully';

  @override
  String get formsCheckoutTabStreetRequired => 'Street is required';

  @override
  String get formsCheckoutTabCityRequired => 'City is required';

  @override
  String get formsCheckoutTabProvinceRequired => 'Province is required';

  @override
  String get formsCheckoutTabPostalCodeInvalid => 'Invalid postal code';

  @override
  String get formsCheckoutTabEmailInvalid => 'Invalid email';

  @override
  String get formsCheckoutTabEmailMismatch => 'Emails must match';

  @override
  String get formsCheckoutTabPaymentMethodRequired =>
      'Payment method is required';

  @override
  String get formsCheckoutTabOrderFailed => 'Order failed. Please try again.';

  @override
  String get formsCheckoutTabPlacing => 'Placing Order...';

  @override
  String get formsCheckoutTabPhoneInvalid => 'Enter a valid phone number';

  @override
  String get formsCheckoutTabPhoneHint =>
      'Include your country code, e.g. +1 555 123 4567';

  @override
  String get formsCheckoutTabPostalCodeHint =>
      'Format depends on the country selected above';

  @override
  String get formsContentEditorHeading => 'Content Editor';

  @override
  String get formsContentEditorTitle => 'Title';

  @override
  String get formsContentEditorTitlePlaceholder => 'Enter title...';

  @override
  String get formsContentEditorSlug => 'Slug';

  @override
  String get formsContentEditorTags => 'Tags';

  @override
  String get formsContentEditorTagsPlaceholder => 'Add tags...';

  @override
  String get formsContentEditorCoverImage => 'Cover Image';

  @override
  String get formsContentEditorBody => 'Body';

  @override
  String get formsContentEditorBodyPlaceholder => 'Write your content...';

  @override
  String get formsContentEditorPreview => 'Preview';

  @override
  String get formsContentEditorEdit => 'Edit';

  @override
  String get formsContentEditorSaveDraft => 'Save Draft';

  @override
  String get formsContentEditorPublish => 'Publish';

  @override
  String get formsContentEditorSchedule => 'Schedule';

  @override
  String get formsContentEditorPublished => 'Published!';

  @override
  String get formsContentEditorScheduled => 'Scheduled!';

  @override
  String get formsContentEditorDraftSaved => 'Draft saved';

  @override
  String formsContentEditorDraftRestored(Object time) {
    return 'Draft restored from $time';
  }

  @override
  String get formsContentEditorDraftRestore => 'Restore';

  @override
  String get formsContentEditorDraftDiscard => 'Discard';

  @override
  String get formsContentEditorDraftDiscardConfirm =>
      'This draft will be permanently discarded.';

  @override
  String get formsContentEditorSimulateFailure => 'Simulate failure';

  @override
  String get formsContentEditorUnsavedChanges => 'You have unsaved changes';

  @override
  String get formsContentEditorUnsavedDescription =>
      'Your changes may not be saved';

  @override
  String get formsContentEditorStay => 'Stay';

  @override
  String get formsContentEditorLeave => 'Leave';

  @override
  String get formsContentEditorTitleRequired => 'Title is required';

  @override
  String get formsContentEditorSlugInvalid =>
      'Only lowercase letters, numbers, and hyphens allowed';

  @override
  String get formsContentEditorScheduleDateRequired =>
      'Schedule date is required';

  @override
  String get formsContentEditorPublishing => 'Publishing...';

  @override
  String get formsContentEditorScheduling => 'Scheduling...';

  @override
  String get formsContentEditorUntitled => 'Untitled';

  @override
  String get formsContentEditorTime => 'Time';

  @override
  String get formsContentEditorSlugHint =>
      'Auto-generated from the title — edit here to customize the URL';

  @override
  String get formsFormBuilderHeading => 'Form Builder';

  @override
  String get formsFormBuilderBuilder => 'Builder';

  @override
  String get formsFormBuilderPreview => 'Preview';

  @override
  String get formsFormBuilderAddField => 'Add Field';

  @override
  String get formsFormBuilderFieldType => 'Type';

  @override
  String get formsFormBuilderFieldLabel => 'Label';

  @override
  String get formsFormBuilderFieldRequired => 'Required';

  @override
  String get formsFormBuilderFieldOptions => 'Options';

  @override
  String get formsFormBuilderText => 'Text';

  @override
  String get formsFormBuilderSelect => 'Select';

  @override
  String get formsFormBuilderCheckbox => 'Checkbox';

  @override
  String get formsFormBuilderDate => 'Date';

  @override
  String get formsFormBuilderMoveUp => 'Move Up';

  @override
  String get formsFormBuilderMoveDown => 'Move Down';

  @override
  String get formsFormBuilderRemoveField => 'Remove';

  @override
  String get formsFormBuilderExportConfig => 'Export Config';

  @override
  String get formsFormBuilderSubmitPreview => 'Submit';

  @override
  String get formsFormBuilderConfigCopied => 'Config copied to clipboard';

  @override
  String get formsFormBuilderFieldNamesLabel => 'Field names:';

  @override
  String get formsFormBuilderUntitledField => 'Untitled';

  @override
  String get formsFormBuilderOptionsPlaceholder => 'Comma-separated';

  @override
  String get formsEditableTableHeading => 'Editable Table';

  @override
  String get formsEditableTableDescription => 'Description';

  @override
  String get formsEditableTableQuantity => 'Qty';

  @override
  String get formsEditableTableUnitPrice => 'Unit Price';

  @override
  String get formsEditableTableTaxClass => 'Tax Class';

  @override
  String get formsEditableTableAddRow => 'Add Row';

  @override
  String get formsEditableTableDuplicateRow => 'Duplicate';

  @override
  String get formsEditableTableRemoveRow => 'Remove';

  @override
  String get formsEditableTableRemoveRowConfirm =>
      'This row will be permanently deleted.';

  @override
  String get formsEditableTableMoveUp => 'Move Up';

  @override
  String get formsEditableTableMoveDown => 'Move Down';

  @override
  String get formsEditableTableTotal => 'Total';

  @override
  String get formsEditableTableSubtotal => 'Subtotal';

  @override
  String get formsEditableTableTax => 'Tax';

  @override
  String get formsEditableTableSaveAll => 'Save All';

  @override
  String get formsEditableTableSaving => 'Saving...';

  @override
  String get formsEditableTableRowError => 'Row rejected';

  @override
  String get formsEditableTableSaveSuccess => 'All rows saved';

  @override
  String get formsEditableTableSaveFailed => 'Some rows failed';

  @override
  String get formsEditableTableDescRequired => 'Description is required';

  @override
  String get formsEditableTableQtyMin => 'Minimum quantity is 1';

  @override
  String get formsEditableTablePricePositive => 'Price must be positive';

  @override
  String get formsEditableTableTaxClassRequired => 'Select a tax class';

  @override
  String get formsEditableTableNet => 'Net';

  @override
  String get formsEditableTableSavedBadge => 'Saved';

  @override
  String get formsEditableTableSaveRow => 'Save row';

  @override
  String get formsEditableTableQuantityHint => 'Whole numbers, 1 or more';

  @override
  String get formsEditableTableUnitPriceHint =>
      'Enter as a decimal, e.g. 19.99';

  @override
  String get formsAdvancedHeading => 'Advanced Form Patterns';

  @override
  String get formsAdvancedAccountType => 'Account Type';

  @override
  String get formsAdvancedPersonal => 'Personal';

  @override
  String get formsAdvancedBusiness => 'Business';

  @override
  String get formsAdvancedFullName => 'Full Name';

  @override
  String get formsAdvancedEmail => 'Email';

  @override
  String get formsAdvancedPassword => 'Password';

  @override
  String get formsAdvancedCompanyName => 'Company Name';

  @override
  String get formsAdvancedTaxId => 'Tax ID';

  @override
  String get formsAdvancedIndustry => 'Industry';

  @override
  String get formsAdvancedTeamMembers => 'Team Members';

  @override
  String get formsAdvancedAddMember => 'Add Member';

  @override
  String get formsAdvancedRemoveMember => 'Remove';

  @override
  String get formsAdvancedMemberName => 'Name';

  @override
  String get formsAdvancedMemberEmail => 'Email';

  @override
  String get formsAdvancedMemberRole => 'Role';

  @override
  String get formsAdvancedSubmit => 'Submit Registration';

  @override
  String get formsAdvancedSubmitting => 'Submitting...';

  @override
  String get formsAdvancedSubmitSuccess =>
      'Registration submitted successfully';

  @override
  String get formsAdvancedSubmitFailed =>
      'Registration failed — check the errors below';

  @override
  String get formsAdvancedFullNameMin =>
      'Full name must be at least 2 characters';

  @override
  String get formsAdvancedEmailInvalid => 'Invalid email address';

  @override
  String get formsAdvancedPasswordMin =>
      'Password must be at least 8 characters';

  @override
  String get formsAdvancedCompanyNameRequired => 'Company name is required';

  @override
  String get formsAdvancedTaxIdInvalid =>
      'Format: XX1234567890 (2 letters + 2-13 alphanumeric)';

  @override
  String get formsAdvancedIndustryRequired => 'Select an industry';

  @override
  String get formsAdvancedMemberNameRequired => 'Name is required';

  @override
  String get formsAdvancedMemberEmailInvalid => 'Invalid email address';

  @override
  String get formsAdvancedMemberRoleRequired => 'Select a role';

  @override
  String get formsAdvancedFullNamePlaceholder => 'John Doe';

  @override
  String get formsAdvancedFullNameInfo =>
      'Enter your full name — must be at least 2 characters';

  @override
  String get formsAdvancedEmailPlaceholder => 'john@example.com';

  @override
  String get formsAdvancedEmailInfo =>
      'You must provide a valid email address in the format user@example.com';

  @override
  String get formsAdvancedPasswordPlaceholder => 'Create a strong password';

  @override
  String get formsAdvancedPasswordInfo =>
      'Create a strong password with at least 8 characters including a number';

  @override
  String get formsAdvancedCompanyNamePlaceholder => 'Acme Inc.';

  @override
  String get formsAdvancedCompanyNameInfo =>
      'Enter your registered business or company name';

  @override
  String get formsAdvancedTaxIdPlaceholder => 'XX1234567890';

  @override
  String get formsAdvancedTaxIdInfo =>
      'Tax identification number — format: 2 letters followed by 2-13 alphanumeric characters';

  @override
  String get formsAdvancedIndustryPlaceholder => 'Select industry';

  @override
  String get formsAdvancedIndustryInfo =>
      'Choose the industry your business operates in';

  @override
  String get formsAdvancedMemberNamePlaceholder => 'Jane Smith';

  @override
  String get formsAdvancedMemberNameInfo =>
      'Enter the team member\'s full name';

  @override
  String get formsAdvancedMemberEmailPlaceholder => 'jane@company.com';

  @override
  String get formsAdvancedMemberEmailInfo =>
      'Enter the team member\'s email address';

  @override
  String get formsAdvancedMemberRolePlaceholder => 'Select role';

  @override
  String get formsAdvancedMemberRoleInfo =>
      'Choose the role and permissions for this team member';

  @override
  String get formsAdvancedAccountTypeInfo =>
      'Select whether this is a personal or business account — business accounts require additional information';

  @override
  String get formsAdvancedTeamMembersInfo =>
      'Add team members who will have access to this account';

  @override
  String get formsAdvancedRoleDeveloper => 'Developer';

  @override
  String get formsAdvancedRoleDesigner => 'Designer';

  @override
  String get formsAdvancedRoleManager => 'Manager';

  @override
  String get formsAdvancedRoleViewer => 'Viewer';

  @override
  String get formsAdvancedIndustryTechnology => 'Technology';

  @override
  String get formsAdvancedIndustryFinance => 'Finance';

  @override
  String get formsAdvancedIndustryHealthcare => 'Healthcare';

  @override
  String get formsAdvancedIndustryEducation => 'Education';

  @override
  String get formsAdvancedIndustryEcommerce => 'E-Commerce';

  @override
  String get formsAdvancedIndustryOther => 'Other';

  @override
  String get formsAdvancedEmailAlreadyMember =>
      'This email is already registered';

  @override
  String get formsAdvancedFormErrors =>
      'Please fix the errors below before submitting';

  @override
  String get formsElementsHeading => 'Form Elements';

  @override
  String get formsElementsDescription =>
      'Input groups, selects, textareas, checkboxes, radios, toggles, and validation states';

  @override
  String get formsElementsSection_defaultInputs => 'Default Inputs';

  @override
  String get formsElementsSection_inputGroups => 'Input Groups';

  @override
  String get formsElementsSection_selectInputs => 'Select Inputs';

  @override
  String get formsElementsSection_textarea => 'Textarea Input Field';

  @override
  String get formsElementsSection_inputStates => 'Input States';

  @override
  String get formsElementsSection_fileInput => 'File Input';

  @override
  String get formsElementsSection_dropzone => 'Dropzone';

  @override
  String get formsElementsSection_checkboxes => 'Checkboxes';

  @override
  String get formsElementsSection_radioButtons => 'Radio Buttons';

  @override
  String get formsElementsSection_toggleSwitches => 'Toggle Switches';

  @override
  String get formsElementsSection_dateTimePickers => 'Date & Time Pickers';

  @override
  String get formsElementsSection_formValidation => 'Form with Validation';

  @override
  String get formsElementsInput_label => 'Input';

  @override
  String get formsElementsInput_placeholder => 'Simple input field';

  @override
  String get formsElementsInput_info =>
      'A standard text input for entering any type of information';

  @override
  String get formsElementsInputWithPlaceholder_label => 'With Placeholder';

  @override
  String get formsElementsInputWithPlaceholder_placeholder =>
      'Placeholder text';

  @override
  String get formsElementsInputWithPlaceholder_info =>
      'Shows placeholder text when empty, demonstrating user guidance';

  @override
  String get formsElementsSelectInput_label => 'Select Input';

  @override
  String get formsElementsSelectInput_info =>
      'A dropdown menu for choosing a single option from a list';

  @override
  String get formsElementsPasswordInput_label => 'Password Input';

  @override
  String get formsElementsPasswordInput_placeholder => '••••••••';

  @override
  String get formsElementsPasswordInput_info =>
      'Masks characters for secure password entry';

  @override
  String get formsElementsDatePicker_label => 'Date Picker';

  @override
  String get formsElementsDatePicker_info =>
      'Opens a native date picker for selecting a calendar date';

  @override
  String get formsElementsTimeSelect_label => 'Time Select';

  @override
  String get formsElementsTimeSelect_info =>
      'Native time picker for selecting hours and minutes';

  @override
  String get formsElementsEmailGroup_label => 'Email';

  @override
  String get formsElementsEmailGroup_placeholder => 'your@email.com';

  @override
  String get formsElementsEmailGroup_info =>
      'Enter a valid email address in the format user@example.com';

  @override
  String get formsElementsPhoneGroup_label => 'Phone';

  @override
  String get formsElementsPhoneGroup_placeholder => '555-0123';

  @override
  String get formsElementsPhoneGroup_info =>
      'Phone number with country code prefix selector';

  @override
  String get formsElementsCardNumberGroup_label => 'Card Number';

  @override
  String get formsElementsCardNumberGroup_placeholder => '4242 4242 4242 4242';

  @override
  String get formsElementsCardNumberGroup_info =>
      'Credit card number with card type icon indicator';

  @override
  String get formsElementsWebsiteGroup_label => 'Website';

  @override
  String get formsElementsWebsiteGroup_placeholder => 'example.com';

  @override
  String get formsElementsWebsiteGroup_info =>
      'Website URL with automatic http:// protocol prefix';

  @override
  String get formsElementsReferralGroup_label => 'Referral Code';

  @override
  String get formsElementsReferralGroup_placeholder => 'REF-XXXX';

  @override
  String get formsElementsReferralGroup_info =>
      'A referral code with one-click copy button';

  @override
  String get formsElementsAmountGroup_label => 'Amount';

  @override
  String get formsElementsAmountGroup_placeholder => '0.00';

  @override
  String get formsElementsAmountGroup_info =>
      'Currency amount input with \$ prefix and USD suffix';

  @override
  String get formsElementsCountryOption_us => 'US +1';

  @override
  String get formsElementsCountryOption_gb => 'GB +44';

  @override
  String get formsElementsCountryOption_ca => 'CA +1';

  @override
  String get formsElementsCountryOption_au => 'AU +61';

  @override
  String get formsElementsCountryOption_tr => 'TR +90';

  @override
  String get formsElementsSingleSelect_label => 'Single Select';

  @override
  String get formsElementsSingleSelect_placeholder => 'Select an option';

  @override
  String get formsElementsSingleSelect_info =>
      'A native dropdown for selecting a single option';

  @override
  String get formsElementsSingleSelect_option1 => 'Marketing';

  @override
  String get formsElementsSingleSelect_option2 => 'Template';

  @override
  String get formsElementsSingleSelect_option3 => 'Development';

  @override
  String get formsElementsMultiSelect_label => 'Multi Select';

  @override
  String get formsElementsMultiSelect_placeholder => 'Select options';

  @override
  String get formsElementsMultiSelect_info =>
      'Select multiple options from a list — each selection appears as a removable chip';

  @override
  String get formsElementsMultiSelect_option1 => 'React';

  @override
  String get formsElementsMultiSelect_option2 => 'Vue';

  @override
  String get formsElementsMultiSelect_option3 => 'Angular';

  @override
  String get formsElementsMultiSelect_chipAdd => '+ Add';

  @override
  String get formsElementsTextareaDefault_label => 'Default';

  @override
  String get formsElementsTextareaDefault_placeholder =>
      'Write your message here...';

  @override
  String get formsElementsTextareaDefault_info =>
      'A standard multi-line text area for longer content';

  @override
  String get formsElementsTextareaCharCount_label => 'With Char Count';

  @override
  String get formsElementsTextareaCharCount_placeholder => 'Max 100 chars...';

  @override
  String get formsElementsTextareaCharCount_info =>
      'Shows a live character counter that changes color as you approach the limit';

  @override
  String get formsElementsTextareaDisabled_label => 'Disabled';

  @override
  String get formsElementsTextareaDisabled_placeholder => 'Cannot edit';

  @override
  String get formsElementsTextareaDisabled_info =>
      'A read-only textarea that cannot be modified';

  @override
  String get formsElementsErrorState_label => 'Error';

  @override
  String get formsElementsErrorState_placeholder => 'Invalid value';

  @override
  String get formsElementsErrorState_info =>
      'Demonstrates the error visual state with a validation message';

  @override
  String get formsElementsErrorState_message => 'This field has an error';

  @override
  String get formsElementsSuccessState_label => 'Success';

  @override
  String get formsElementsSuccessState_placeholder => 'Valid value';

  @override
  String get formsElementsSuccessState_info =>
      'Demonstrates the success visual state with a validation message';

  @override
  String get formsElementsSuccessState_message => 'Looks good!';

  @override
  String get formsElementsFileInput_label => 'Upload File';

  @override
  String get formsElementsFileInput_info =>
      'A file picker that opens the system file browser';

  @override
  String get formsElementsFileInput_buttonLabel => 'Choose File';

  @override
  String get formsElementsDropzone_info =>
      'Drag and drop files or click to browse — supports multiple file uploads';

  @override
  String get formsElementsDropzone_text =>
      'Drag & drop your files here or click to browse';

  @override
  String get formsElementsDropzone_formats =>
      'Accepted formats: JPEG, PNG, WebP, GIF, AVIF — max 5 MB per file';

  @override
  String get formsElementsCheckboxDefault_label => 'Default';

  @override
  String get formsElementsCheckboxDefault_info =>
      'An unchecked checkbox in its default state';

  @override
  String get formsElementsCheckboxChecked_label => 'Checked';

  @override
  String get formsElementsCheckboxChecked_info =>
      'A checkbox in its checked/selected state';

  @override
  String get formsElementsCheckboxIndeterminate_label => 'Indeterminate';

  @override
  String get formsElementsCheckboxIndeterminate_info =>
      'A checkbox in an indeterminate (partial) state, used for group selection';

  @override
  String get formsElementsRadioSelected_label => 'Selected';

  @override
  String get formsElementsRadioSelected_info =>
      'A radio button in its selected state';

  @override
  String get formsElementsRadioUnselected_label => 'Unselected';

  @override
  String get formsElementsRadioUnselected_info =>
      'A radio button in its unselected/default state';

  @override
  String get formsElementsRadioDisabled_label => 'Disabled';

  @override
  String get formsElementsRadioDisabled_info =>
      'A disabled radio button that cannot be interacted with';

  @override
  String get formsElementsToggleDefault_label => 'Default';

  @override
  String get formsElementsToggleDefault_info =>
      'A toggle switch in its off/default state';

  @override
  String get formsElementsToggleChecked_label => 'Checked';

  @override
  String get formsElementsToggleChecked_info =>
      'A toggle switch in its on/checked state';

  @override
  String get formsElementsDateTimeDate_label => 'Date Picker';

  @override
  String get formsElementsDateTimeDate_info =>
      'Select a date using the native browser date picker';

  @override
  String get formsElementsDateTimeTime_label => 'Time Picker';

  @override
  String get formsElementsDateTimeTime_info =>
      'Select a time using the native browser time picker';

  @override
  String get formsElementsValidation_heading => 'Form with Validation';

  @override
  String get formsElementsValidation_info =>
      'TanStack Form fields with onChange Zod validation';

  @override
  String get formsElementsValidationFullName_label => 'Full Name';

  @override
  String get formsElementsValidationFullName_placeholder => 'John Doe';

  @override
  String get formsElementsValidationFullName_info =>
      'Enter your full name — must be at least 2 characters';

  @override
  String get formsElementsValidationEmail_label => 'Email';

  @override
  String get formsElementsValidationEmail_placeholder => 'john@example.com';

  @override
  String get formsElementsValidationEmail_info =>
      'You must provide a valid email address in the format user@example.com';

  @override
  String get formsElementsValidationPassword_label => 'Password';

  @override
  String get formsElementsValidationPassword_placeholder => 'Create a password';

  @override
  String get formsElementsValidationPassword_info =>
      'Create a strong password with at least 8 characters including a number';

  @override
  String get formsElementsValidationBio_label => 'Bio';

  @override
  String get formsElementsValidationBio_placeholder => 'Tell us about yourself';

  @override
  String get formsElementsValidationBio_info =>
      'A short biography describing yourself, up to 200 characters';

  @override
  String get formsLayoutsHeading => 'Form Layouts';

  @override
  String get formsLayoutsDescription =>
      'Basic stacked, two-column grid, icon-prefixed, and sectioned card form patterns';

  @override
  String get formsLayoutsContact_label => 'Contact Form';

  @override
  String get formsLayoutsContact_description =>
      'Basic single-column form with name, email, subject, and message';

  @override
  String get formsLayoutsContactFullName_label => 'Full Name';

  @override
  String get formsLayoutsContactFullName_placeholder => 'John Doe';

  @override
  String get formsLayoutsContactFullName_info =>
      'Enter your full name as it appears on official documents';

  @override
  String get formsLayoutsContactEmail_label => 'Email';

  @override
  String get formsLayoutsContactEmail_placeholder => 'john@example.com';

  @override
  String get formsLayoutsContactEmail_info =>
      'You must provide a valid email address in the format user@example.com';

  @override
  String get formsLayoutsContactSubject_label => 'Subject';

  @override
  String get formsLayoutsContactSubject_info =>
      'Select the category that best describes your inquiry';

  @override
  String get formsLayoutsContactSubject_placeholder => 'Select Subject';

  @override
  String get formsLayoutsContactSubject_general => 'General Inquiry';

  @override
  String get formsLayoutsContactSubject_support => 'Support';

  @override
  String get formsLayoutsContactSubject_feedback => 'Feedback';

  @override
  String get formsLayoutsContactSubject_other => 'Other';

  @override
  String get formsLayoutsContactMessage_label => 'Message';

  @override
  String get formsLayoutsContactMessage_info =>
      'Write your message in detail so we can best assist you';

  @override
  String get formsLayoutsContactSubmit => 'Submit';

  @override
  String get formsLayoutsContactSubmitting => 'Submitting...';

  @override
  String get formsLayoutsTwoColumn_label => 'Two-Column Grid Form';

  @override
  String get formsLayoutsTwoColumn_description =>
      'Side-by-side name fields with full-width email, subject, and message';

  @override
  String get formsLayoutsTwoColumnFirstName_label => 'First Name';

  @override
  String get formsLayoutsTwoColumnFirstName_placeholder => 'John';

  @override
  String get formsLayoutsTwoColumnFirstName_info => 'Your given name';

  @override
  String get formsLayoutsTwoColumnLastName_label => 'Last Name';

  @override
  String get formsLayoutsTwoColumnLastName_placeholder => 'Doe';

  @override
  String get formsLayoutsTwoColumnLastName_info =>
      'Your family name or surname';

  @override
  String get formsLayoutsTwoColumnEmail_label => 'Email';

  @override
  String get formsLayoutsTwoColumnEmail_placeholder => 'john@example.com';

  @override
  String get formsLayoutsTwoColumnEmail_info =>
      'You must provide a valid email address in the format user@example.com';

  @override
  String get formsLayoutsTwoColumnSubject_label => 'Select Subject';

  @override
  String get formsLayoutsTwoColumnSubject_info =>
      'Choose a subject category for your message';

  @override
  String get formsLayoutsTwoColumnSubject_placeholder => 'Choose an option';

  @override
  String get formsLayoutsTwoColumnSubject_option1 => 'Option 1';

  @override
  String get formsLayoutsTwoColumnSubject_option2 => 'Option 2';

  @override
  String get formsLayoutsTwoColumnSubject_option3 => 'Option 3';

  @override
  String get formsLayoutsTwoColumnSubject_option4 => 'Option 4';

  @override
  String get formsLayoutsTwoColumnMessage_label => 'Message';

  @override
  String get formsLayoutsTwoColumnMessage_info =>
      'Your message content with a 200 character limit';

  @override
  String get formsLayoutsTwoColumnSubmit => 'Send Message';

  @override
  String get formsLayoutsTwoColumnSubmitting => 'Sending...';

  @override
  String get formsLayoutsIcon_label => 'Icon-Prefixed Inputs';

  @override
  String get formsLayoutsIcon_description =>
      'Inputs with leading SVG icons and a remember-me checkbox';

  @override
  String get formsLayoutsIconName_label => 'Name';

  @override
  String get formsLayoutsIconName_placeholder => 'Your name';

  @override
  String get formsLayoutsIconName_info =>
      'Enter your name — this field has a leading user icon';

  @override
  String get formsLayoutsIconEmail_label => 'Email';

  @override
  String get formsLayoutsIconEmail_placeholder => 'your@email.com';

  @override
  String get formsLayoutsIconEmail_info =>
      'You must provide a valid email address in the format user@example.com';

  @override
  String get formsLayoutsIconPassword_label => 'Password';

  @override
  String get formsLayoutsIconPassword_placeholder => '••••••••';

  @override
  String get formsLayoutsIconPassword_info =>
      'Enter your password — this field has a leading lock icon';

  @override
  String get formsLayoutsIconRemember_label => 'Remember me';

  @override
  String get formsLayoutsIconRemember_info =>
      'Keep me signed in on this device';

  @override
  String get formsLayoutsIconSubmit => 'Create Account';

  @override
  String get formsLayoutsSectioned_label => 'Sectioned Card Form';

  @override
  String get formsLayoutsSectioned_description =>
      'Multiple card sections for complex data entry';

  @override
  String get formsLayoutsSectioned_personalInfo => 'Personal Info';

  @override
  String get formsLayoutsSectioned_address => 'Address';

  @override
  String get formsLayoutsSectioned_membership => 'Membership';

  @override
  String get formsLayoutsSectionedFirstName_label => 'First Name';

  @override
  String get formsLayoutsSectionedFirstName_placeholder => 'John';

  @override
  String get formsLayoutsSectionedFirstName_info =>
      'Your given name for your profile';

  @override
  String get formsLayoutsSectionedLastName_label => 'Last Name';

  @override
  String get formsLayoutsSectionedLastName_placeholder => 'Doe';

  @override
  String get formsLayoutsSectionedLastName_info =>
      'Your family name for your profile';

  @override
  String get formsLayoutsSectionedEmail_label => 'Email';

  @override
  String get formsLayoutsSectionedEmail_placeholder => 'john@example.com';

  @override
  String get formsLayoutsSectionedEmail_info =>
      'You must provide a valid email address in the format user@example.com';

  @override
  String get formsLayoutsSectionedDob_label => 'Date of Birth';

  @override
  String get formsLayoutsSectionedDob_info =>
      'Select your date of birth from the date picker';

  @override
  String get formsLayoutsSectionedGender_label => 'Gender';

  @override
  String get formsLayoutsSectionedGender_info =>
      'Select your gender from the available options';

  @override
  String get formsLayoutsSectionedGender_male => 'Male';

  @override
  String get formsLayoutsSectionedGender_female => 'Female';

  @override
  String get formsLayoutsSectionedGender_other => 'Other';

  @override
  String get formsLayoutsSectionedCategory_label => 'Category';

  @override
  String get formsLayoutsSectionedCategory_info =>
      'Select the category that best describes your interests';

  @override
  String get formsLayoutsSectionedCategory_tech => 'Technology';

  @override
  String get formsLayoutsSectionedCategory_design => 'Design';

  @override
  String get formsLayoutsSectionedCategory_business => 'Business';

  @override
  String get formsLayoutsSectionedStreet_label => 'Street';

  @override
  String get formsLayoutsSectionedStreet_placeholder => '123 Main St';

  @override
  String get formsLayoutsSectionedStreet_info =>
      'Your street address including building or apartment number';

  @override
  String get formsLayoutsSectionedCity_label => 'City';

  @override
  String get formsLayoutsSectionedCity_placeholder => 'Istanbul';

  @override
  String get formsLayoutsSectionedCity_info => 'Your city of residence';

  @override
  String get formsLayoutsSectionedState_label => 'State';

  @override
  String get formsLayoutsSectionedState_placeholder => 'Kadıköy';

  @override
  String get formsLayoutsSectionedState_info =>
      'Your state, province, or district';

  @override
  String get formsLayoutsSectionedZip_label => 'Post Code';

  @override
  String get formsLayoutsSectionedZip_placeholder => '34700';

  @override
  String get formsLayoutsSectionedZip_info =>
      'Your postal or ZIP code for mail delivery';

  @override
  String get formsLayoutsSectionedCountry_label => 'Country';

  @override
  String get formsLayoutsSectionedCountry_info =>
      'Select your country of residence';

  @override
  String get formsLayoutsSectionedCountry_placeholder => '-- Select Country --';

  @override
  String get formsLayoutsSectionedCountry_us => 'USA';

  @override
  String get formsLayoutsSectionedCountry_ca => 'Canada';

  @override
  String get formsLayoutsSectionedCountry_uk => 'United Kingdom';

  @override
  String get formsLayoutsSectionedCountry_tr => 'Turkey';

  @override
  String get formsLayoutsSectionedPlan_label => 'Plan';

  @override
  String get formsLayoutsSectionedPlan_info =>
      'Choose a membership plan that suits your needs';

  @override
  String get formsLayoutsSectionedPlan_free => 'Free';

  @override
  String get formsLayoutsSectionedPlan_basic => 'Basic';

  @override
  String get formsLayoutsSectionedPlan_premium => 'Premium';

  @override
  String get formsLayoutsSectionedAgree_label =>
      'I agree to the terms and conditions';

  @override
  String get formsLayoutsSectionedAgree_info =>
      'You must accept the terms and conditions to proceed';

  @override
  String get formsLayoutsSectionedSubmit => 'Save Changes';

  @override
  String get formsLayoutsSectionedCancel => 'Cancel';

  @override
  String get formsLayoutsUnsaved => 'Unsaved changes';

  @override
  String get formsErrorsEmailAlreadyMember => 'This email is already a member';

  @override
  String get formsErrorsInviteQuotaExceeded =>
      'Invite quota exceeded — upgrade your plan';

  @override
  String get formsErrorsCouponInvalid => 'Invalid coupon code';

  @override
  String get formsErrorsCouponExpired => 'This coupon has expired';

  @override
  String get formsErrorsConnectionUnstable =>
      'Connection is unstable — check your network';

  @override
  String get formsErrorsScanFailed =>
      'Virus scan failed — this file may be unsafe';

  @override
  String get formsErrorsPostalCodeInvalid =>
      'Postal code doesn\'t match the selected country';

  @override
  String get formsErrorsPaymentDeclined => 'Payment was declined';

  @override
  String get formsErrorsRowRejected => 'This row was rejected by the server';

  @override
  String get formsErrorsUnknown => 'An unexpected error occurred';

  @override
  String get formsErrorsSlugTaken =>
      'This slug is already in use — try a different one';

  @override
  String get homeSignIn => 'Sign in';

  @override
  String get homeRegister => 'Register';

  @override
  String get homeChatRoom => 'Chat Room';

  @override
  String get homeMessages => 'Messages';

  @override
  String get homeStylingPipeline => 'Styling pipeline';

  @override
  String get i18nTitle => 'Internationalization';

  @override
  String get i18nGreeting => 'Hello!';

  @override
  String get i18nDescription =>
      'This page was rendered on the server in English from its dictionary.';

  @override
  String get messagesTitle => 'Messages';

  @override
  String get messagesConnected => 'Connected';

  @override
  String get messagesDisconnected => 'Disconnected';

  @override
  String get messagesChats => 'Chats';

  @override
  String get messagesFriends => 'Friends';

  @override
  String get messagesSearchUsers => 'Search all users...';

  @override
  String get messagesSearchFriends => 'Search friends...';

  @override
  String get messagesAdd => 'Add';

  @override
  String get messagesNoConversations => 'No conversations yet';

  @override
  String get messagesNoFriends => 'No friends yet. Find people to add!';

  @override
  String get messagesSelectConversation => 'Select a conversation';

  @override
  String get messagesNoMessages => 'No messages yet. Say hello!';

  @override
  String get messagesInputPlaceholder => 'Type a message...';

  @override
  String get messagesConnecting => 'Connecting...';

  @override
  String get messagesSend => 'Send';

  @override
  String get messagesLoading => 'Loading...';

  @override
  String get messagesFailedToLoad => 'Failed to load messages';

  @override
  String get messagesSignInRequired => 'Sign in to start messaging';

  @override
  String get notificationTitle => 'Notifications';

  @override
  String get notificationMarkAllRead => 'Mark all read';

  @override
  String get notificationNoNotifications => 'No notifications yet';

  @override
  String get notificationEnablePush => 'Enable push notifications';

  @override
  String get notificationDisablePush => 'Disable push notifications';

  @override
  String get notificationBack => 'Back';

  @override
  String get postsBack => 'Back';

  @override
  String get postsDeletePost => 'Delete post';

  @override
  String get postsDeletePostConfirm =>
      'Are you sure you want to delete this post?';

  @override
  String get postsSave => 'Save';

  @override
  String get postsCancel => 'Cancel';

  @override
  String postsComments(Object count) {
    return '$count comments';
  }

  @override
  String get postsReactionBreakdown => 'Reaction Breakdown';

  @override
  String get postsWhoReacted => 'Who Reacted';

  @override
  String get postsUnknown => 'Unknown';

  @override
  String get postsPostNotFound => 'Post not found';

  @override
  String get premiumHeading => 'Premium Dashboard';

  @override
  String get premiumSignInToView => 'Sign in to view premium';

  @override
  String get premiumUpgradeMessage =>
      'Upgrade to view premium features and stats.';

  @override
  String get premiumViewPlans => 'View plans';

  @override
  String get premiumLoadStats => 'Load premium stats';

  @override
  String get premiumLoadGrowthStats => 'Load growth stats';

  @override
  String get premiumLoading => 'Loading...';

  @override
  String get premiumTotalUsers => 'Total Users';

  @override
  String get premiumActiveUsers => 'Active Users';

  @override
  String get premiumRevenue => 'Revenue';

  @override
  String get premiumNewUsers7d => 'New Users (7d)';

  @override
  String get premiumTotalPosts => 'Total Posts';

  @override
  String get premiumTotalFriendships => 'Total Friendships';

  @override
  String get premiumExportCsv => 'Export CSV';

  @override
  String get premiumNetworkError => 'Network error';

  @override
  String get premiumLoadStatsFirst => 'Load stats first';

  @override
  String premiumErrorStatus(Object status) {
    return 'Error $status';
  }

  @override
  String get pricingHeading => 'Pricing';

  @override
  String get pricingSubtitle => 'Choose the plan that fits your needs.';

  @override
  String get pricingCurrentPlan => 'Current plan';

  @override
  String get pricingIncluded => 'Included';

  @override
  String get pricingUpgrade => 'Upgrade';

  @override
  String get pricingFeaturesBasic0 => 'Basic access';

  @override
  String get pricingFeaturesBasic1 => 'Community support';

  @override
  String get pricingFeaturesMedium0 => 'Everything in Free';

  @override
  String get pricingFeaturesMedium1 => 'Priority support';

  @override
  String get pricingFeaturesMedium2 => 'Basic analytics';

  @override
  String get pricingFeaturesPremium0 => 'Everything in Medium';

  @override
  String get pricingFeaturesPremium1 => 'Post stats & reaction breakdown';

  @override
  String get pricingFeaturesPremium2 => 'VIP room access';

  @override
  String get pricingFeaturesPremium3 => 'Suggested friends';

  @override
  String get pricingFeaturesPro0 => 'Everything in Premium';

  @override
  String get pricingFeaturesPro1 => 'Who-reacted list';

  @override
  String get pricingFeaturesPro2 => 'Export data';

  @override
  String get pricingFeaturesPro3 => 'Crown badge';

  @override
  String get pricingFeaturesPro4 => 'Dedicated support';

  @override
  String get pricingPriceFree => '\$0';

  @override
  String get pricingPriceBasic => '\$9.99/mo';

  @override
  String get pricingPriceMedium => '\$19.99/mo';

  @override
  String get pricingPricePremium => '\$49.99/mo';

  @override
  String get settingsNavGeneral => 'General';

  @override
  String get settingsNavAccount => 'Account';

  @override
  String get settingsNavPrivacy => 'Privacy';

  @override
  String get settingsNavBilling => 'Billing';

  @override
  String get settingsNavSessions => 'Sessions';

  @override
  String get settingsAccountHeading => 'Account';

  @override
  String get settingsName => 'Name';

  @override
  String get settingsUsername => 'Username';

  @override
  String get settingsUsernameChecking => 'Checking availability…';

  @override
  String get settingsUsernameAvailable => 'Available';

  @override
  String get settingsUsernameTaken => 'Already taken';

  @override
  String get settingsBio => 'Bio';

  @override
  String get settingsAvatarChange => 'Change photo';

  @override
  String get settingsSave => 'Save changes';

  @override
  String get settingsSaveSuccess => 'Profile updated';

  @override
  String get settingsGeneralHeading => 'General';

  @override
  String get settingsLanguage => 'Language';

  @override
  String get settingsTimezone => 'Timezone';

  @override
  String get settingsCurrency => 'Currency';

  @override
  String get settingsTheme => 'Theme';

  @override
  String get settingsDateDisplay => 'Date display';

  @override
  String get settingsDateDisplayLong => 'Long';

  @override
  String get settingsDateDisplayIso => 'ISO timestamp';

  @override
  String get settingsDateDisplayShort => 'Short';

  @override
  String get settingsBillingHeading => 'Billing';

  @override
  String get settingsCurrentPlan => 'Current plan';

  @override
  String get settingsUpgradePlan => 'Upgrade plan';

  @override
  String get settingsBillingHistory => 'Billing history';

  @override
  String get settingsBillingHistoryEmpty => 'No transactions yet.';

  @override
  String get settingsPlanDetails => 'Plan Details';

  @override
  String get settingsPlanBenefits => 'Plan Benefits';

  @override
  String get settingsPaymentMethods => 'Payment Methods';

  @override
  String get settingsAddPaymentMethod => 'Add new card';

  @override
  String get settingsMakeDefault => 'Make default';

  @override
  String get settingsEditBillingInfo => 'Edit billing info';

  @override
  String get settingsBillingInfo => 'Billing Info';

  @override
  String get settingsBillingAddressEmpty => 'No billing address saved.';

  @override
  String get settingsCancelSubscription => 'Cancel subscription';

  @override
  String get settingsCancelSubscriptionConfirm =>
      'Are you sure you want to cancel your subscription? You\'ll lose access to premium features at the end of the current billing period.';

  @override
  String get settingsCancelSubscriptionSuccess =>
      'Subscription will cancel at the end of the billing period';

  @override
  String get settingsCancelSubscriptionFailed =>
      'Failed to cancel subscription';

  @override
  String get settingsInvoices => 'Invoices';

  @override
  String settingsInvoiceNumber(Object number) {
    return 'Invoice $number';
  }

  @override
  String get settingsDownloadInvoice => 'Download';

  @override
  String get settingsViewInvoice => 'View';

  @override
  String get settingsPaid => 'Paid';

  @override
  String get settingsUnpaid => 'Unpaid';

  @override
  String settingsShowingXofY(Object x, Object y, Object z) {
    return 'Showing $x–$y of $z';
  }

  @override
  String get settingsPrevious => 'Previous';

  @override
  String get settingsNext => 'Next';

  @override
  String get settingsStreet => 'Street';

  @override
  String get settingsCity => 'City';

  @override
  String get settingsState => 'State';

  @override
  String get settingsCountry => 'Country';

  @override
  String get settingsZipCode => 'Zip / Postal Code';

  @override
  String get settingsVatNumber => 'VAT Number';

  @override
  String get settingsNoPaymentMethods => 'No payment methods saved.';

  @override
  String get settingsPrice => 'Price';

  @override
  String get settingsRenewalDate => 'Renewal Date';

  @override
  String get settingsCancelsOn => 'Cancels on';

  @override
  String get settingsEditAddress => 'Edit';

  @override
  String get settingsUpdateAddress => 'Update Address';

  @override
  String get settingsNameLabel => 'Name';

  @override
  String get settingsExpires => 'Expires';

  @override
  String get settingsDate => 'Date';

  @override
  String get settingsStatus => 'Status';

  @override
  String get settingsPlanBenefitsEmpty =>
      'No benefits available for this tier.';

  @override
  String get settingsPrivacyHeading => 'Privacy';

  @override
  String get settingsPrivacySessionsNote =>
      'Manage where you\'re signed in from the Sessions tab.';

  @override
  String get settingsPrivacyHideProfilePicture =>
      'Don\'t show my profile picture';

  @override
  String get settingsPrivacyHideProfilePictureDesc =>
      'Your avatar will be hidden from other users';

  @override
  String get settingsPrivacyNickname => 'Go to chat rooms with nickname';

  @override
  String get settingsPrivacyNicknameDesc =>
      'Use a nickname instead of your real name in chat rooms';

  @override
  String get settingsPrivacyNicknamePlaceholder => 'Enter your nickname';

  @override
  String get settingsPrivacyTwoFactor => 'Two-factor authentication (2FA)';

  @override
  String get settingsPrivacyTwoFactorDesc =>
      'Add an extra layer of security to your account';

  @override
  String get settingsSettingsLink => 'Settings';

  @override
  String get settingsNavSettings => 'Settings';

  @override
  String get settingsSettingsSectionLabel => 'Settings';

  @override
  String get settingsSaving => 'Saving…';

  @override
  String get settingsSaveFailed => 'Failed to save';

  @override
  String get settingsUploadFailed => 'Upload failed';

  @override
  String get settingsInvalidFileType =>
      'Only JPEG, PNG, WebP, and GIF images are allowed';

  @override
  String get settingsFileTooLarge => 'File must be under 5 MB';

  @override
  String get settingsLoading => 'Loading…';

  @override
  String get settingsNavApiKeys => 'API Keys';

  @override
  String get settingsApiKeysHeading => 'API Keys';

  @override
  String get settingsApiKeysDescription =>
      'API keys allow programmatic access to your account. Treat them like passwords.';

  @override
  String get settingsApiKeysEmpty =>
      'No API keys yet. Create one to get started.';

  @override
  String get settingsApiKeysCreate => 'New API key';

  @override
  String get settingsApiKeysCreateHeading => 'Create new API key';

  @override
  String get settingsApiKeysNameLabel => 'Key name';

  @override
  String get settingsApiKeysNamePlaceholder =>
      'e.g. \'CI/CD\', \'Development\'';

  @override
  String get settingsApiKeysExpiryLabel => 'Expiry';

  @override
  String get settingsApiKeysNoExpiry => 'No expiry';

  @override
  String get settingsApiKeysCreated =>
      'Key created — copy it now. You won\'t see it again.';

  @override
  String get settingsApiKeysCopied => 'Copied to clipboard';

  @override
  String settingsApiKeysRevokeConfirm(Object name) {
    return 'Revoke API key \"$name\"? This cannot be undone.';
  }

  @override
  String get settingsApiKeysRevoked => 'API key revoked';

  @override
  String get settingsApiKeysActive => 'Active';

  @override
  String get settingsApiKeysDisabled => 'Disabled';

  @override
  String settingsApiKeysCreatedDate(Object date) {
    return 'Created $date';
  }

  @override
  String settingsApiKeysLastUsed(Object date) {
    return 'Last used $date';
  }

  @override
  String settingsApiKeysExpires(Object date) {
    return 'Expires $date';
  }

  @override
  String get settingsApiKeysLoadFailed => 'Failed to load API keys';

  @override
  String get settingsApiKeysCreateFailed => 'Failed to create API key';

  @override
  String get settingsApiKeysRevokeFailed => 'Failed to revoke API key';

  @override
  String get settingsSignInToManageSettings => 'Sign in to manage settings';

  @override
  String get settingsSignInToManageBilling => 'Sign in to manage billing';

  @override
  String get settingsSignInToManageAccount => 'Sign in to manage your account';

  @override
  String get settingsSignInToManageSessions => 'Sign in to manage sessions';

  @override
  String get settingsSessionsHeading => 'Sessions & Devices';

  @override
  String get settingsLogOutAllOtherSessions => 'Log out all other sessions';

  @override
  String get settingsLoadingSessions => 'Loading sessions...';

  @override
  String get settingsNoSessions => 'No active sessions found.';

  @override
  String get settingsCurrentSession => 'Current';

  @override
  String get settingsUnknownDevice => 'Unknown device';

  @override
  String get settingsMoreDeviceInfo => 'More Device Info';

  @override
  String get settingsDeviceId => 'Device ID:';

  @override
  String get settingsUserAgent => 'User-Agent:';

  @override
  String get settingsRevoke => 'Revoke';

  @override
  String get settingsErrorsUsernameTaken => 'Username is already taken';

  @override
  String get shareShareSomething => 'Share something';

  @override
  String get shareTitle => 'Title';

  @override
  String get shareTitlePlaceholder => 'What\'s on your mind?';

  @override
  String get shareContent => 'Content';

  @override
  String get shareContentPlaceholder => 'Write something...';

  @override
  String get shareImageOptional => 'Image (optional)';

  @override
  String get sharePreview => 'Preview';

  @override
  String get shareUploading => 'Uploading...';

  @override
  String get shareImageUploadFailed => 'Image couldn\'t be uploaded.';

  @override
  String get shareRemove => 'Remove';

  @override
  String get shareRetry => 'Retry';

  @override
  String get shareSharing => 'Sharing...';

  @override
  String get shareShare => 'Share';

  @override
  String get shareFailedToCreatePost => 'Failed to create post';

  @override
  String get sharedLocaleSwitcherSwitchLabel => 'Choose a language';

  @override
  String get uiPageTitle => 'UI Components';

  @override
  String get uiPageDescription =>
      'Browse and inspect all custom UI components.';

  @override
  String get uiBack => 'Back';

  @override
  String get uiBreadcrumbLabel => 'UI Components';

  @override
  String get uiBreadcrumbPattern => '/v1/:lang/ui/:component';

  @override
  String get uiAccordionTitle => 'Accordion - Single State';

  @override
  String get uiAccordionDescription =>
      'When a new accordion opens, the other open one closes.';

  @override
  String get uiAccordionText =>
      'When a new accordion opens, the other open one closes.';

  @override
  String get uiAccordionVariantsTitle => 'Accordion - Multi State';

  @override
  String get uiAccordionVariantsDescription =>
      'When a new accordion opens, the other open ones don\'t close.';

  @override
  String get uiAccordionVariantsText =>
      'When a new accordion opens, the other open ones don\'t close.';

  @override
  String get uiAccordionRichItemsTitle => 'Accordion - Rich Items';

  @override
  String get uiAccordionRichItemsDescription =>
      'AccordionItemComplex with flexible slots for avatars, badges, and rich content.';

  @override
  String get uiAccordionRichItemsText =>
      'AccordionItemComplex with flexible slots for avatars, badges, and rich content.';

  @override
  String get uiAlertTitle => 'Alert';

  @override
  String get uiAlertDescription => 'Alert component demo';

  @override
  String get uiAlertDialogTitle => 'Alert Dialog';

  @override
  String get uiAlertDialogDescription => 'Alert Dialog component demo';

  @override
  String get uiAspectRatioTitle => 'Aspect Ratio';

  @override
  String get uiAspectRatioDescription => 'Aspect Ratio component demo';

  @override
  String get uiAvatarTitle => 'Avatar';

  @override
  String get uiAvatarDescription => 'Avatar component demo';

  @override
  String get uiBadgeTitle => 'Badge';

  @override
  String get uiBadgeDescription => 'Badge component demo';

  @override
  String get uiBreadcrumbTitle => 'Breadcrumb';

  @override
  String get uiBreadcrumbDescription => 'Breadcrumb component demo';

  @override
  String get uiButtonTitle => 'Button';

  @override
  String get uiButtonDescription => 'Button component demo';

  @override
  String get uiCalendarTitle => 'Calendar';

  @override
  String get uiCalendarDescription => 'Calendar component demo';

  @override
  String get uiCardTitle => 'Card';

  @override
  String get uiCardDescription => 'Card component demo';

  @override
  String get uiCarouselTitle => 'Carousel';

  @override
  String get uiCarouselDescription => 'Carousel component demo';

  @override
  String get uiCheckboxTitle => 'Checkbox';

  @override
  String get uiCheckboxDescription => 'Checkbox component demo';

  @override
  String get uiCollapsibleTitle => 'Collapsible';

  @override
  String get uiCollapsibleDescription => 'Collapsible component demo';

  @override
  String get uiComboboxTitle => 'Combobox';

  @override
  String get uiComboboxDescription => 'Combobox component demo';

  @override
  String get uiCommandTitle => 'Command';

  @override
  String get uiCommandDescription => 'Command component demo';

  @override
  String get uiConfirmDialogTitle => 'Confirm Dialog';

  @override
  String get uiConfirmDialogDescription => 'Confirm Dialog component demo';

  @override
  String get uiContextMenuTitle => 'Context Menu';

  @override
  String get uiContextMenuDescription => 'Context Menu component demo';

  @override
  String get uiCounterTitle => 'Counter';

  @override
  String get uiCounterDescription => 'Counter component demo';

  @override
  String get uiDatePickerTitle => 'Date Picker';

  @override
  String get uiDatePickerDescription => 'Date Picker component demo';

  @override
  String get uiDialogTitle => 'Dialog';

  @override
  String get uiDialogDescription => 'Dialog component demo';

  @override
  String get uiDrawerTitle => 'Drawer';

  @override
  String get uiDrawerDescription => 'Drawer component demo';

  @override
  String get uiDropdownTitle => 'Dropdown';

  @override
  String get uiDropdownDescription => 'Dropdown component demo';

  @override
  String get uiDropdownMenuTitle => 'Dropdown Menu';

  @override
  String get uiDropdownMenuDescription => 'Dropdown Menu component demo';

  @override
  String get uiEmptyTitle => 'Empty';

  @override
  String get uiEmptyDescription => 'Empty component demo';

  @override
  String get uiErrorBoundaryTitle => 'Error Boundary';

  @override
  String get uiErrorBoundaryDescription => 'Error Boundary component demo';

  @override
  String get uiFileUploadTitle => 'File Upload';

  @override
  String get uiFileUploadDescription => 'File upload component demo';

  @override
  String get uiHoverCardTitle => 'Hover Card';

  @override
  String get uiHoverCardDescription => 'Hover Card component demo';

  @override
  String get uiImageUploadTitle => 'Image Upload';

  @override
  String get uiImageUploadDescription => 'Image upload component demo';

  @override
  String get uiInputGroupTitle => 'Input Group';

  @override
  String get uiInputGroupDescription => 'Input Group component demo';

  @override
  String get uiInputOtpTitle => 'Input OTP';

  @override
  String get uiInputOtpDescription => 'Input OTP component demo';

  @override
  String get uiKbdTitle => 'Kbd';

  @override
  String get uiKbdDescription => 'Kbd component demo';

  @override
  String get uiLabelTitle => 'Label';

  @override
  String get uiLabelDescription => 'Label component demo';

  @override
  String get uiLogoSpinnerTitle => 'Logo Spinner';

  @override
  String get uiLogoSpinnerDescription => 'Logo Spinner component demo';

  @override
  String get uiMenubarTitle => 'Menubar';

  @override
  String get uiMenubarDescription => 'Menubar component demo';

  @override
  String get uiNativeSelectTitle => 'Native Select';

  @override
  String get uiNativeSelectDescription => 'Native Select component demo';

  @override
  String get uiNavigationMenuTitle => 'Navigation Menu';

  @override
  String get uiNavigationMenuDescription => 'Navigation Menu component demo';

  @override
  String get uiPaginationTitle => 'Pagination';

  @override
  String get uiPaginationDescription => 'Pagination component demo';

  @override
  String get uiPopoverTitle => 'Popover';

  @override
  String get uiPopoverDescription => 'Popover component demo';

  @override
  String get uiProgressTitle => 'Progress';

  @override
  String get uiProgressDescription => 'Progress component demo';

  @override
  String get uiRadioGroupTitle => 'Radio Group';

  @override
  String get uiRadioGroupDescription => 'Radio Group component demo';

  @override
  String get uiResizableTitle => 'Resizable';

  @override
  String get uiResizableDescription => 'Resizable component demo';

  @override
  String get uiScrollAreaTitle => 'Scroll Area';

  @override
  String get uiScrollAreaDescription => 'Scroll Area component demo';

  @override
  String get uiScrollToBottomButtonTitle => 'Scroll To Bottom Button';

  @override
  String get uiScrollToBottomButtonDescription =>
      'Scroll To Bottom Button component demo';

  @override
  String get uiSelectTitle => 'Select';

  @override
  String get uiSelectDescription => 'Select component demo';

  @override
  String get uiSeparatorTitle => 'Separator';

  @override
  String get uiSeparatorDescription => 'Separator component demo';

  @override
  String get uiSheetTitle => 'Sheet';

  @override
  String get uiSheetDescription => 'Sheet component demo';

  @override
  String get uiSkeletonTitle => 'Skeleton';

  @override
  String get uiSkeletonDescription => 'Skeleton component demo';

  @override
  String get uiSliderTitle => 'Slider';

  @override
  String get uiSliderDescription => 'Slider component demo';

  @override
  String get uiSpinnerTitle => 'Spinner';

  @override
  String get uiSpinnerDescription => 'Spinner component demo';

  @override
  String get uiSwitchTitle => 'Switch';

  @override
  String get uiSwitchDescription => 'Switch component demo';

  @override
  String get uiTabsTitle => 'Tabs';

  @override
  String get uiTabsDescription => 'Tabs component demo';

  @override
  String get uiTextareaTitle => 'Textarea';

  @override
  String get uiTextareaDescription => 'Textarea component demo';

  @override
  String get uiTimeInputTitle => 'Time Input';

  @override
  String get uiTimeInputDescription =>
      'Time input component with dropdown selectors and timezone support';

  @override
  String get uiToastTitle => 'Toast';

  @override
  String get uiToastDescription => 'Toast component demo';

  @override
  String get uiToggleTitle => 'Toggle';

  @override
  String get uiToggleDescription => 'Toggle component demo';

  @override
  String get uiToggleGroupTitle => 'Toggle Group';

  @override
  String get uiToggleGroupDescription => 'Toggle Group component demo';

  @override
  String get uiTooltipTitle => 'Tooltip';

  @override
  String get uiTooltipDescription => 'Tooltip component demo';

  @override
  String get uiTypographyTitle => 'Typography';

  @override
  String get uiTypographyDescription => 'Typography component demo';

  @override
  String get uiFormFieldInfoTitle => 'Form Field Info';

  @override
  String get uiFormFieldInfoDescription =>
      'Error text and validating spinner for form fields';

  @override
  String get uiFormErrorBannerTitle => 'Form Error Banner';

  @override
  String get uiFormErrorBannerDescription =>
      'Dismissable inline error alert for form-level errors';

  @override
  String get uiStepIndicatorTitle => 'Step Indicator';

  @override
  String get uiStepIndicatorDescription =>
      'Multi-step wizard progress indicator';

  @override
  String get usersTitle => 'Users';

  @override
  String get usersTapToView => 'Tap a row to view details.';

  @override
  String get usersLoading => 'Loading users...';

  @override
  String get usersUserNotFound => 'User not found';

  @override
  String get usersBackToUsers => 'Back to Users';

  @override
  String get usersName => 'Name';

  @override
  String get usersEmail => 'Email';

  @override
  String get usersRole => 'Role';

  @override
  String get usersSwipeBack => 'Swipe left to go back...';

  @override
  String get v1Greeting => 'Welcome to v1';

  @override
  String get v1ShellBrand => 'v1';

  @override
  String get v1ShellNavHome => 'Home';

  @override
  String get v1ShellNavUsers => 'Users';

  @override
  String get v1ShellNavChatRoom => 'Chat Room';

  @override
  String get v1ShellNavMessages => 'Messages';

  @override
  String get v1ShellNavFindFriends => 'Find Friends';

  @override
  String get v1ShellNavUiComponents => 'UI Components';

  @override
  String get v1ShellNavForms => 'Forms';

  @override
  String get v1ShellNavErrorTest => 'Error Test';

  @override
  String get v1ShellNavNotFound => 'Not Found';

  @override
  String get v1ShellSwipeLeftToClose => 'Swipe left to close';

  @override
  String get v1ShellInbox => 'Messages';

  @override
  String get v1ShellNoUnread => 'No unread messages';

  @override
  String get v1ShellViewAll => 'View all messages';

  @override
  String get v1ShellSignOut => 'Sign Out';

  @override
  String get v1ShellSignIn => 'Sign In';

  @override
  String get v1ShellAccount => 'Account';

  @override
  String get v1ShellClose => 'Close';

  @override
  String get v1ShellAuthLoading => 'Auth...';

  @override
  String get v1ShellToggleSidebar => 'Toggle sidebar';

  @override
  String get v1ShellSettingsLink => 'Settings';

  @override
  String get v1ShellNavSettings => 'Settings';

  @override
  String get v1ShellNavFeed => 'Feed';

  @override
  String get v1ShellNavShare => 'Share';

  @override
  String get v1ShellNavPremium => 'Premium';

  @override
  String get v1ShellNavAdmin => 'Admin';

  @override
  String get v1ShellNavAuditLog => 'Audit Log';

  @override
  String get v1ShellSkipToContent => 'Skip to content';
}
