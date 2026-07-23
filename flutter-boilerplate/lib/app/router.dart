import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../hooks/use_auth.dart';
import '../views/auth/login/page_content.dart';
import '../views/auth/register/page_content.dart';
import '../views/auth/forgot_password/page_content.dart';
import '../views/auth/reset_password/page_content.dart';
import '../views/auth/verify_email/page_content.dart';
import '../views/auth/mfa/page_content.dart';
import '../views/home/page_content.dart';
import '../views/about/page_content.dart';
import '../views/pricing/page_content.dart';
import '../views/v1/v1_shell.dart';
import '../views/v1/home/page_content.dart' as v1_home;
import '../views/v1/missing_page.dart';
import '../views/feed/page_view.dart';
import '../views/messages/page_view.dart';
import '../views/notification/page_view.dart';
import '../views/plans/page_content.dart';
import '../views/settings/page_view.dart';
import '../views/settings/account/page_view.dart';
import '../views/settings/billing/page_view.dart';
import '../views/settings/general/page_view.dart';
import '../views/settings/privacy/page_view.dart';
import '../views/settings/sessions/page_view.dart';
import '../views/settings/api_keys/page_content.dart';
import '../views/posts/page_view.dart';
import '../views/posts/detail_page_view.dart';
import '../views/posts/create_page_view.dart';
import '../views/find_friends/page_view.dart';
import '../views/find_friends/requests_page.dart';
import '../views/checkout/page_content.dart';
import '../views/chat_room/page_view.dart';
import '../views/admin/page_view.dart';
import '../views/admin/audit_logs/page_view.dart';
import '../views/users/list/page_view.dart';
import '../views/users/detail/page_view.dart';
import '../views/users/page_view.dart';
import '../views/security/page_view.dart';
import '../views/forms/advanced/page_content.dart';
import '../views/forms/api_key/page_content.dart';
import '../views/forms/billing/page_content.dart';
import '../views/forms/checkout/page_content.dart';
import '../views/forms/content_editor/page_content.dart';
import '../views/forms/editable_table/page_content.dart';
import '../views/forms/elements/page_content.dart';
import '../views/forms/error_lab/page_content.dart';
import '../views/forms/field_states/page_content.dart';
import '../views/forms/filters/page_content.dart';
import '../views/forms/form_builder/page_content.dart';
import '../views/forms/layouts/page_content.dart';
import '../views/forms/page_content.dart';
import '../views/forms/profile/page_content.dart';
import '../views/forms/team_invite/page_content.dart';
import '../views/forms/uploads/page_content.dart';
import '../views/demos/page_view.dart';
import '../views/ui/accordion/page_content.dart';
import '../views/ui/alert/page_content.dart';
import '../views/ui/alert_dialog/page_content.dart';
import '../views/ui/aspect_ratio/page_content.dart';
import '../views/ui/avatar/page_content.dart';
import '../views/ui/badge/page_content.dart';
import '../views/ui/breadcrumb/page_content.dart';
import '../views/ui/button/page_content.dart';
import '../views/ui/calendar/page_content.dart';
import '../views/ui/card/page_content.dart';
import '../views/ui/carousel/page_content.dart';
import '../views/ui/checkbox/page_content.dart';
import '../views/ui/collapsible/page_content.dart';
import '../views/ui/combobox/page_content.dart';
import '../views/ui/command/page_content.dart';
import '../views/ui/confirm_dialog/page_content.dart';
import '../views/ui/context_menu/page_content.dart';
import '../views/ui/counter/page_content.dart';
import '../views/ui/date_picker/page_content.dart';
import '../views/ui/dialog/page_content.dart';
import '../views/ui/drawer/page_content.dart';
import '../views/ui/dropdown/page_content.dart';
import '../views/ui/dropdown_menu/page_content.dart';
import '../views/ui/empty/page_content.dart';
import '../views/ui/error_boundary/page_content.dart';
import '../views/ui/file_upload/page_content.dart';
import '../views/ui/form_error_banner/page_content.dart';
import '../views/ui/form_field_info/page_content.dart';
import '../views/ui/hover_card/page_content.dart';
import '../views/ui/image_upload/page_content.dart';
import '../views/ui/input_group/page_content.dart';
import '../views/ui/input_otp/page_content.dart';
import '../views/ui/kbd/page_content.dart';
import '../views/ui/label/page_content.dart';
import '../views/ui/logo_spinner/page_content.dart';
import '../views/ui/menubar/page_content.dart';
import '../views/ui/native_select/page_content.dart';
import '../views/ui/navigation_menu/page_content.dart';
import '../views/ui/pagination/page_content.dart';
import '../views/ui/popover/page_content.dart';
import '../views/ui/progress/page_content.dart';
import '../views/ui/radio_group/page_content.dart';
import '../views/ui/resizable/page_content.dart';
import '../views/ui/scroll_area/page_content.dart';
import '../views/ui/scroll_to_bottom_button/page_content.dart';
import '../views/ui/select/page_content.dart';
import '../views/ui/separator/page_content.dart';
import '../views/ui/sheet/page_content.dart';
import '../views/ui/skeleton/page_content.dart';
import '../views/ui/slider/page_content.dart';
import '../views/ui/spinner/page_content.dart';
import '../views/ui/step_indicator/page_content.dart';
import '../views/ui/switch/page_content.dart';
import '../views/ui/tabs/page_content.dart';
import '../views/ui/textarea/page_content.dart';
import '../views/ui/time_input/page_content.dart';
import '../views/ui/toast/page_content.dart';
import '../views/ui/toggle/page_content.dart';
import '../views/ui/toggle_group/page_content.dart';
import '../views/ui/tooltip/page_content.dart';
import '../views/ui/typography/page_content.dart';
import '../views/premium/page_view.dart';
import '../views/share/page_content.dart';
import '../views/boom/page_content.dart';
import '../views/dashboard/dashboard_shell.dart';
import '../views/gallery/gallery_page.dart';
import '../views/gallery/photo_detail.dart';
import '../views/routing/slug_page.dart';
import '../views/routing/item_content.dart';
import '../views/routing/post_page.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    initialLocation: '/',
    debugLogDiagnostics: true,
    redirect: (context, state) {
      final isLoggedIn = authState.asData?.value != null;
      final isAuthRoute = state.matchedLocation.startsWith('/auth');
      final isV1Route = state.matchedLocation.startsWith('/v1');

      if (!isLoggedIn && isV1Route) return '/auth/login';
      if (isLoggedIn && isAuthRoute) return '/v1/en/feed';
      return null;
    },
    routes: [
      GoRoute(
        path: '/',
        name: 'home',
        builder: (_, __) => const HomePageContent(),
      ),
      GoRoute(
        path: '/pricing',
        name: 'pricing',
        builder: (_, __) => const PricingPageContent(),
      ),
      GoRoute(
        path: '/about',
        name: 'about',
        builder: (_, __) => const AboutPageContent(),
      ),
      GoRoute(
        path: '/dashboard',
        name: 'dashboard',
        builder: (_, __) => const DashboardShell(),
      ),
      GoRoute(
        path: '/gallery',
        name: 'gallery',
        builder: (_, __) => const GalleryPage(),
      ),
      GoRoute(
        path: '/gallery/:id',
        name: 'galleryDetail',
        builder: (_, state) => PhotoDetailPage(
          id: state.pathParameters['id'] ?? '',
        ),
      ),
      GoRoute(
        path: '/routing/slug/:slug',
        name: 'routingSlug',
        builder: (_, state) => SlugPage(
          slug: state.pathParameters['slug'] ?? '',
        ),
      ),
      GoRoute(
        path: '/routing/item/:itemId',
        name: 'routingItem',
        builder: (_, state) => ItemContentPage(
          itemId: state.pathParameters['itemId'] ?? '',
        ),
      ),
      GoRoute(
        path: '/routing/post/:postId',
        name: 'routingPost',
        builder: (_, state) => PostPage(
          postId: state.pathParameters['postId'] ?? '',
          category: state.uri.queryParameters['category'],
        ),
      ),

      // Auth routes
      GoRoute(
        path: '/auth/login',
        name: 'login',
        builder: (_, __) => const LoginPageContent(),
      ),
      GoRoute(
        path: '/auth/register',
        name: 'register',
        builder: (_, __) => const RegisterPageContent(),
      ),
      GoRoute(
        path: '/auth/forgot-password',
        name: 'forgotPassword',
        builder: (_, __) => const ForgotPasswordPageContent(),
      ),
      GoRoute(
        path: '/auth/reset-password',
        name: 'resetPassword',
        builder: (_, __) => const ResetPasswordPageContent(),
      ),
      GoRoute(
        path: '/auth/verify-email',
        name: 'verifyEmail',
        builder: (_, __) => const VerifyEmailPageContent(),
      ),
      GoRoute(
        path: '/auth/mfa',
        name: 'mfa',
        builder: (_, __) => const MfaPageContent(),
      ),

      // V1 authenticated shell
      ShellRoute(
        builder: (_, state, child) {
          final lang = state.pathParameters['lang'] ?? 'en';
          return V1Shell(lang: lang, child: child);
        },
        routes: [
          GoRoute(
            path: '/v1/:lang',
            name: 'v1Home',
            builder: (_, state) => v1_home.V1HomeContent(
              lang: state.pathParameters['lang'] ?? 'en',
            ),
          ),
          GoRoute(
            path: '/v1/:lang/missing',
            name: 'v1Missing',
            builder: (_, state) => MissingPage(lang: state.pathParameters['lang'] ?? 'en'),
          ),
          GoRoute(
            path: '/v1/:lang/feed',
            name: 'v1Feed',
            builder: (_, state) => FeedPageContent(
              lang: state.pathParameters['lang'] ?? 'en',
            ),
          ),
          GoRoute(
            path: '/v1/:lang/messages',
            name: 'v1Messages',
            builder: (_, state) => MessagesPageContent(
              lang: state.pathParameters['lang'] ?? 'en',
            ),
          ),
          GoRoute(
            path: '/v1/:lang/notification',
            name: 'v1Notification',
            builder: (_, state) => NotificationPageContent(
              lang: state.pathParameters['lang'] ?? 'en',
            ),
          ),
          GoRoute(
            path: '/v1/:lang/plans',
            name: 'v1Plans',
            builder: (_, state) => PlansPageContent(
              lang: state.pathParameters['lang'] ?? 'en',
            ),
          ),
          GoRoute(
            path: '/v1/:lang/premium',
            name: 'v1Premium',
            builder: (_, state) => PremiumPageContent(
              lang: state.pathParameters['lang'] ?? 'en',
            ),
          ),
          GoRoute(
            path: '/v1/:lang/share',
            name: 'v1Share',
            builder: (_, state) => SharePageContent(
              lang: state.pathParameters['lang'] ?? 'en',
            ),
          ),
          GoRoute(
            path: '/v1/:lang/settings',
            name: 'v1Settings',
            builder: (_, state) => SettingsPageContent(
              lang: state.pathParameters['lang'] ?? 'en',
            ),
          ),
          GoRoute(
            path: '/v1/:lang/boom',
            name: 'v1Boom',
            builder: (_, state) => BoomPageContent(
              lang: state.pathParameters['lang'] ?? 'en',
            ),
          ),
          // Settings sub-routes
          GoRoute(
            path: '/v1/:lang/settings/account',
            name: 'v1SettingsAccount',
            builder: (_, state) => SettingsAccountPageContent(
              lang: state.pathParameters['lang'] ?? 'en',
            ),
          ),
          GoRoute(
            path: '/v1/:lang/settings/billing',
            name: 'v1SettingsBilling',
            builder: (_, state) => SettingsBillingPageContent(
              lang: state.pathParameters['lang'] ?? 'en',
            ),
          ),
          GoRoute(
            path: '/v1/:lang/settings/general',
            name: 'v1SettingsGeneral',
            builder: (_, state) => SettingsGeneralPageContent(
              lang: state.pathParameters['lang'] ?? 'en',
            ),
          ),
          GoRoute(
            path: '/v1/:lang/settings/privacy',
            name: 'v1SettingsPrivacy',
            builder: (_, state) => SettingsPrivacyPageContent(
              lang: state.pathParameters['lang'] ?? 'en',
            ),
          ),
          GoRoute(
            path: '/v1/:lang/settings/sessions',
            name: 'v1SettingsSessions',
            builder: (_, state) => SettingsSessionsPageContent(
              lang: state.pathParameters['lang'] ?? 'en',
            ),
          ),
          GoRoute(
            path: '/v1/:lang/settings/api-keys',
            name: 'v1SettingsApiKeys',
            builder: (_, state) => SettingsApiKeysPageContent(
              lang: state.pathParameters['lang'] ?? 'en',
            ),
          ),
          // Posts routes
          GoRoute(
            path: '/v1/:lang/posts',
            name: 'v1Posts',
            builder: (_, state) => PostsPageContent(
              lang: state.pathParameters['lang'] ?? 'en',
            ),
          ),
          GoRoute(
            path: '/v1/:lang/posts/create',
            name: 'v1PostsCreate',
            builder: (_, state) => PostCreatePageContent(
              lang: state.pathParameters['lang'] ?? 'en',
            ),
          ),
          GoRoute(
            path: '/v1/:lang/posts/:postId',
            name: 'v1PostDetail',
            builder: (_, state) => PostDetailPageContent(
              lang: state.pathParameters['lang'] ?? 'en',
              postId: state.pathParameters['postId'] ?? '',
            ),
          ),
          // Find Friends
          GoRoute(
            path: '/v1/:lang/find-friends',
            name: 'v1FindFriends',
            builder: (_, state) => FindFriendsPageContent(
              lang: state.pathParameters['lang'] ?? 'en',
            ),
          ),
          GoRoute(
            path: '/v1/:lang/find-friends/requests',
            name: 'v1FindFriendsRequests',
            builder: (_, state) => FindFriendsRequestsPage(
              lang: state.pathParameters['lang'] ?? 'en',
            ),
          ),
          // Checkout
          GoRoute(
            path: '/v1/:lang/checkout/:plan',
            name: 'v1Checkout',
            builder: (_, state) => CheckoutPageContent(
              lang: state.pathParameters['lang'] ?? 'en',
              plan: state.pathParameters['plan'],
            ),
          ),
          // Chat Room
          GoRoute(
            path: '/v1/:lang/chat/:conversationId',
            name: 'v1ChatRoom',
            builder: (_, state) => ChatRoomPageContent(
              lang: state.pathParameters['lang'] ?? 'en',
              conversationId: state.pathParameters['conversationId'],
            ),
          ),
          // Admin
          GoRoute(
            path: '/v1/:lang/admin',
            name: 'v1Admin',
            builder: (_, state) => AdminPageContent(
              lang: state.pathParameters['lang'] ?? 'en',
            ),
          ),
          GoRoute(
            path: '/v1/:lang/admin/audit-logs',
            name: 'v1AdminAuditLogs',
            builder: (_, state) => AdminAuditLogsPageContent(
              lang: state.pathParameters['lang'] ?? 'en',
            ),
          ),
          // Users
          GoRoute(
            path: '/v1/:lang/users',
            name: 'v1Users',
            builder: (_, state) => UsersPageContent(
              lang: state.pathParameters['lang'] ?? 'en',
            ),
          ),
          GoRoute(
            path: '/v1/:lang/users/list',
            name: 'v1UsersList',
            builder: (_, state) => UsersListPageContent(
              lang: state.pathParameters['lang'] ?? 'en',
            ),
          ),
          GoRoute(
            path: '/v1/:lang/users/:userId',
            name: 'v1UserDetail',
            builder: (_, state) => UserDetailPageContent(
              lang: state.pathParameters['lang'] ?? 'en',
              userId: state.pathParameters['userId'] ?? '',
            ),
          ),
          // Security
          GoRoute(
            path: '/v1/:lang/security',
            name: 'v1Security',
            builder: (_, state) => SecurityPageContent(
              lang: state.pathParameters['lang'] ?? 'en',
            ),
          ),
          // Forms
          GoRoute(
            path: '/v1/:lang/forms',
            name: 'v1Forms',
            builder: (_, state) => FormsPageContent(
              lang: state.pathParameters['lang'] ?? 'en',
            ),
          ),
          GoRoute(
            path: '/v1/:lang/forms/advanced',
            name: 'v1FormsAdvanced',
            builder: (_, state) => FormsAdvancedPageContent(
              lang: state.pathParameters['lang'] ?? 'en',
            ),
          ),
          GoRoute(
            path: '/v1/:lang/forms/api-key',
            name: 'v1FormsApiKey',
            builder: (_, state) => FormsApiKeyPageContent(
              lang: state.pathParameters['lang'] ?? 'en',
            ),
          ),
          GoRoute(
            path: '/v1/:lang/forms/billing',
            name: 'v1FormsBilling',
            builder: (_, state) => FormsBillingPageContent(
              lang: state.pathParameters['lang'] ?? 'en',
            ),
          ),
          GoRoute(
            path: '/v1/:lang/forms/checkout',
            name: 'v1FormsCheckout',
            builder: (_, state) => FormsCheckoutPageContent(
              lang: state.pathParameters['lang'] ?? 'en',
            ),
          ),
          GoRoute(
            path: '/v1/:lang/forms/content-editor',
            name: 'v1FormsContentEditor',
            builder: (_, state) => FormsContentEditorPageContent(
              lang: state.pathParameters['lang'] ?? 'en',
            ),
          ),
          GoRoute(
            path: '/v1/:lang/forms/editable-table',
            name: 'v1FormsEditableTable',
            builder: (_, state) => FormsEditableTablePageContent(
              lang: state.pathParameters['lang'] ?? 'en',
            ),
          ),
          GoRoute(
            path: '/v1/:lang/forms/elements',
            name: 'v1FormsElements',
            builder: (_, state) => FormsElementsPageContent(
              lang: state.pathParameters['lang'] ?? 'en',
            ),
          ),
          GoRoute(
            path: '/v1/:lang/forms/error-lab',
            name: 'v1FormsErrorLab',
            builder: (_, state) => FormsErrorLabPageContent(
              lang: state.pathParameters['lang'] ?? 'en',
            ),
          ),
          GoRoute(
            path: '/v1/:lang/forms/field-states',
            name: 'v1FormsFieldStates',
            builder: (_, state) => FormsFieldStatesPageContent(
              lang: state.pathParameters['lang'] ?? 'en',
            ),
          ),
          GoRoute(
            path: '/v1/:lang/forms/filters',
            name: 'v1FormsFilters',
            builder: (_, state) => FormsFiltersPageContent(
              lang: state.pathParameters['lang'] ?? 'en',
            ),
          ),
          GoRoute(
            path: '/v1/:lang/forms/form-builder',
            name: 'v1FormsFormBuilder',
            builder: (_, state) => FormsFormBuilderPageContent(
              lang: state.pathParameters['lang'] ?? 'en',
            ),
          ),
          GoRoute(
            path: '/v1/:lang/forms/layouts',
            name: 'v1FormsLayouts',
            builder: (_, state) => FormsLayoutsPageContent(
              lang: state.pathParameters['lang'] ?? 'en',
            ),
          ),
          GoRoute(
            path: '/v1/:lang/forms/profile',
            name: 'v1FormsProfile',
            builder: (_, state) => FormsProfilePageContent(
              lang: state.pathParameters['lang'] ?? 'en',
            ),
          ),
          GoRoute(
            path: '/v1/:lang/forms/team-invite',
            name: 'v1FormsTeamInvite',
            builder: (_, state) => FormsTeamInvitePageContent(
              lang: state.pathParameters['lang'] ?? 'en',
            ),
          ),
          GoRoute(
            path: '/v1/:lang/forms/uploads',
            name: 'v1FormsUploads',
            builder: (_, state) => FormsUploadsPageContent(
              lang: state.pathParameters['lang'] ?? 'en',
            ),
          ),
          // UI Component Demos
          GoRoute(
            path: '/v1/:lang/demos',
            name: 'v1Demos',
            builder: (_, state) => DemosPageContent(
              lang: state.pathParameters['lang'] ?? 'en',
            ),
          ),
          GoRoute(path: '/v1/:lang/ui/accordion', name: 'uiAccordion', builder: (_, state) => AccordionDemoPage(lang: state.pathParameters['lang'] ?? 'en')),
          GoRoute(path: '/v1/:lang/ui/alert', name: 'uiAlert', builder: (_, state) => AlertDemoPage(lang: state.pathParameters['lang'] ?? 'en')),
          GoRoute(path: '/v1/:lang/ui/alert-dialog', name: 'uiAlertDialog', builder: (_, state) => AlertDialogDemoPage(lang: state.pathParameters['lang'] ?? 'en')),
          GoRoute(path: '/v1/:lang/ui/aspect-ratio', name: 'uiAspectRatio', builder: (_, state) => AspectRatioDemoPage(lang: state.pathParameters['lang'] ?? 'en')),
          GoRoute(path: '/v1/:lang/ui/avatar', name: 'uiAvatar', builder: (_, state) => AvatarDemoPage(lang: state.pathParameters['lang'] ?? 'en')),
          GoRoute(path: '/v1/:lang/ui/badge', name: 'uiBadge', builder: (_, state) => BadgeDemoPage(lang: state.pathParameters['lang'] ?? 'en')),
          GoRoute(path: '/v1/:lang/ui/breadcrumb', name: 'uiBreadcrumb', builder: (_, state) => BreadcrumbDemoPage(lang: state.pathParameters['lang'] ?? 'en')),
          GoRoute(path: '/v1/:lang/ui/button', name: 'uiButton', builder: (_, state) => ButtonDemoPage(lang: state.pathParameters['lang'] ?? 'en')),
          GoRoute(path: '/v1/:lang/ui/calendar', name: 'uiCalendar', builder: (_, state) => CalendarDemoPage(lang: state.pathParameters['lang'] ?? 'en')),
          GoRoute(path: '/v1/:lang/ui/card', name: 'uiCard', builder: (_, state) => CardDemoPage(lang: state.pathParameters['lang'] ?? 'en')),
          GoRoute(path: '/v1/:lang/ui/carousel', name: 'uiCarousel', builder: (_, state) => CarouselDemoPage(lang: state.pathParameters['lang'] ?? 'en')),
          GoRoute(path: '/v1/:lang/ui/checkbox', name: 'uiCheckbox', builder: (_, state) => CheckboxDemoPage(lang: state.pathParameters['lang'] ?? 'en')),
          GoRoute(path: '/v1/:lang/ui/collapsible', name: 'uiCollapsible', builder: (_, state) => CollapsibleDemoPage(lang: state.pathParameters['lang'] ?? 'en')),
          GoRoute(path: '/v1/:lang/ui/combobox', name: 'uiCombobox', builder: (_, state) => ComboboxDemoPage(lang: state.pathParameters['lang'] ?? 'en')),
          GoRoute(path: '/v1/:lang/ui/command', name: 'uiCommand', builder: (_, state) => CommandDemoPage(lang: state.pathParameters['lang'] ?? 'en')),
          GoRoute(path: '/v1/:lang/ui/confirm-dialog', name: 'uiConfirmDialog', builder: (_, state) => ConfirmDialogDemoPage(lang: state.pathParameters['lang'] ?? 'en')),
          GoRoute(path: '/v1/:lang/ui/context-menu', name: 'uiContextMenu', builder: (_, state) => ContextMenuDemoPage(lang: state.pathParameters['lang'] ?? 'en')),
          GoRoute(path: '/v1/:lang/ui/counter', name: 'uiCounter', builder: (_, state) => CounterDemoPage(lang: state.pathParameters['lang'] ?? 'en')),
          GoRoute(path: '/v1/:lang/ui/date-picker', name: 'uiDatePicker', builder: (_, state) => DatePickerDemoPage(lang: state.pathParameters['lang'] ?? 'en')),
          GoRoute(path: '/v1/:lang/ui/dialog', name: 'uiDialog', builder: (_, state) => DialogDemoPage(lang: state.pathParameters['lang'] ?? 'en')),
          GoRoute(path: '/v1/:lang/ui/drawer', name: 'uiDrawer', builder: (_, state) => DrawerDemoPage(lang: state.pathParameters['lang'] ?? 'en')),
          GoRoute(path: '/v1/:lang/ui/dropdown', name: 'uiDropdown', builder: (_, state) => DropdownDemoPage(lang: state.pathParameters['lang'] ?? 'en')),
          GoRoute(path: '/v1/:lang/ui/dropdown-menu', name: 'uiDropdownMenu', builder: (_, state) => DropdownMenuDemoPage(lang: state.pathParameters['lang'] ?? 'en')),
          GoRoute(path: '/v1/:lang/ui/empty', name: 'uiEmpty', builder: (_, state) => EmptyDemoPage(lang: state.pathParameters['lang'] ?? 'en')),
          GoRoute(path: '/v1/:lang/ui/error-boundary', name: 'uiErrorBoundary', builder: (_, state) => ErrorBoundaryDemoPage(lang: state.pathParameters['lang'] ?? 'en')),
          GoRoute(path: '/v1/:lang/ui/file-upload', name: 'uiFileUpload', builder: (_, state) => FileUploadDemoPage(lang: state.pathParameters['lang'] ?? 'en')),
          GoRoute(path: '/v1/:lang/ui/form-error-banner', name: 'uiFormErrorBanner', builder: (_, state) => FormErrorBannerDemoPage(lang: state.pathParameters['lang'] ?? 'en')),
          GoRoute(path: '/v1/:lang/ui/form-field-info', name: 'uiFormFieldInfo', builder: (_, state) => FormFieldInfoDemoPage(lang: state.pathParameters['lang'] ?? 'en')),
          GoRoute(path: '/v1/:lang/ui/hover-card', name: 'uiHoverCard', builder: (_, state) => HoverCardDemoPage(lang: state.pathParameters['lang'] ?? 'en')),
          GoRoute(path: '/v1/:lang/ui/image-upload', name: 'uiImageUpload', builder: (_, state) => ImageUploadDemoPage(lang: state.pathParameters['lang'] ?? 'en')),
          GoRoute(path: '/v1/:lang/ui/input-group', name: 'uiInputGroup', builder: (_, state) => InputGroupDemoPage(lang: state.pathParameters['lang'] ?? 'en')),
          GoRoute(path: '/v1/:lang/ui/input-otp', name: 'uiInputOtp', builder: (_, state) => InputOtpDemoPage(lang: state.pathParameters['lang'] ?? 'en')),
          GoRoute(path: '/v1/:lang/ui/kbd', name: 'uiKbd', builder: (_, state) => KbdDemoPage(lang: state.pathParameters['lang'] ?? 'en')),
          GoRoute(path: '/v1/:lang/ui/label', name: 'uiLabel', builder: (_, state) => LabelDemoPage(lang: state.pathParameters['lang'] ?? 'en')),
          GoRoute(path: '/v1/:lang/ui/logo-spinner', name: 'uiLogoSpinner', builder: (_, state) => LogoSpinnerDemoPage(lang: state.pathParameters['lang'] ?? 'en')),
          GoRoute(path: '/v1/:lang/ui/menubar', name: 'uiMenubar', builder: (_, state) => MenubarDemoPage(lang: state.pathParameters['lang'] ?? 'en')),
          GoRoute(path: '/v1/:lang/ui/native-select', name: 'uiNativeSelect', builder: (_, state) => NativeSelectDemoPage(lang: state.pathParameters['lang'] ?? 'en')),
          GoRoute(path: '/v1/:lang/ui/navigation-menu', name: 'uiNavigationMenu', builder: (_, state) => NavigationMenuDemoPage(lang: state.pathParameters['lang'] ?? 'en')),
          GoRoute(path: '/v1/:lang/ui/pagination', name: 'uiPagination', builder: (_, state) => PaginationDemoPage(lang: state.pathParameters['lang'] ?? 'en')),
          GoRoute(path: '/v1/:lang/ui/popover', name: 'uiPopover', builder: (_, state) => PopoverDemoPage(lang: state.pathParameters['lang'] ?? 'en')),
          GoRoute(path: '/v1/:lang/ui/progress', name: 'uiProgress', builder: (_, state) => ProgressDemoPage(lang: state.pathParameters['lang'] ?? 'en')),
          GoRoute(path: '/v1/:lang/ui/radio-group', name: 'uiRadioGroup', builder: (_, state) => RadioGroupDemoPage(lang: state.pathParameters['lang'] ?? 'en')),
          GoRoute(path: '/v1/:lang/ui/resizable', name: 'uiResizable', builder: (_, state) => ResizableDemoPage(lang: state.pathParameters['lang'] ?? 'en')),
          GoRoute(path: '/v1/:lang/ui/scroll-area', name: 'uiScrollArea', builder: (_, state) => ScrollAreaDemoPage(lang: state.pathParameters['lang'] ?? 'en')),
          GoRoute(path: '/v1/:lang/ui/scroll-to-bottom-button', name: 'uiScrollToBottomButton', builder: (_, state) => ScrollToBottomButtonDemoPage(lang: state.pathParameters['lang'] ?? 'en')),
          GoRoute(path: '/v1/:lang/ui/select', name: 'uiSelect', builder: (_, state) => SelectDemoPage(lang: state.pathParameters['lang'] ?? 'en')),
          GoRoute(path: '/v1/:lang/ui/separator', name: 'uiSeparator', builder: (_, state) => SeparatorDemoPage(lang: state.pathParameters['lang'] ?? 'en')),
          GoRoute(path: '/v1/:lang/ui/sheet', name: 'uiSheet', builder: (_, state) => SheetDemoPage(lang: state.pathParameters['lang'] ?? 'en')),
          GoRoute(path: '/v1/:lang/ui/skeleton', name: 'uiSkeleton', builder: (_, state) => SkeletonDemoPage(lang: state.pathParameters['lang'] ?? 'en')),
          GoRoute(path: '/v1/:lang/ui/slider', name: 'uiSlider', builder: (_, state) => SliderDemoPage(lang: state.pathParameters['lang'] ?? 'en')),
          GoRoute(path: '/v1/:lang/ui/spinner', name: 'uiSpinner', builder: (_, state) => SpinnerDemoPage(lang: state.pathParameters['lang'] ?? 'en')),
          GoRoute(path: '/v1/:lang/ui/step-indicator', name: 'uiStepIndicator', builder: (_, state) => StepIndicatorDemoPage(lang: state.pathParameters['lang'] ?? 'en')),
          GoRoute(path: '/v1/:lang/ui/switch', name: 'uiSwitch', builder: (_, state) => SwitchDemoPage(lang: state.pathParameters['lang'] ?? 'en')),
          GoRoute(path: '/v1/:lang/ui/tabs', name: 'uiTabs', builder: (_, state) => TabsDemoPage(lang: state.pathParameters['lang'] ?? 'en')),
          GoRoute(path: '/v1/:lang/ui/textarea', name: 'uiTextarea', builder: (_, state) => TextareaDemoPage(lang: state.pathParameters['lang'] ?? 'en')),
          GoRoute(path: '/v1/:lang/ui/time-input', name: 'uiTimeInput', builder: (_, state) => TimeInputDemoPage(lang: state.pathParameters['lang'] ?? 'en')),
          GoRoute(path: '/v1/:lang/ui/toast', name: 'uiToast', builder: (_, state) => ToastDemoPage(lang: state.pathParameters['lang'] ?? 'en')),
          GoRoute(path: '/v1/:lang/ui/toggle', name: 'uiToggle', builder: (_, state) => ToggleDemoPage(lang: state.pathParameters['lang'] ?? 'en')),
          GoRoute(path: '/v1/:lang/ui/toggle-group', name: 'uiToggleGroup', builder: (_, state) => ToggleGroupDemoPage(lang: state.pathParameters['lang'] ?? 'en')),
          GoRoute(path: '/v1/:lang/ui/tooltip', name: 'uiTooltip', builder: (_, state) => TooltipDemoPage(lang: state.pathParameters['lang'] ?? 'en')),
          GoRoute(path: '/v1/:lang/ui/typography', name: 'uiTypography', builder: (_, state) => TypographyDemoPage(lang: state.pathParameters['lang'] ?? 'en')),
        ],
      ),
    ],
    errorBuilder: (_, state) => Scaffold(
      appBar: AppBar(title: const Text('404')),
      body: Center(
        child: Text('Page not found: ${state.uri}'),
      ),
    ),
  );
});



