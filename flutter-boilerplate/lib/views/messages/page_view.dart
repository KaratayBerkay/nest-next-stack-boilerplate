import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/lib/tier_view.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../hooks/use_messages_page.dart';
import 'basic_page_view.dart';
import 'free_page_view.dart';
import 'medium_page_view.dart';
import 'premium_page_view.dart';

class MessagesPageContent extends ConsumerStatefulWidget {
  final String lang;
  // Deep-link target, e.g. from a direct-message push notification
  // (PushNotificationService.navigateFromData) — mirrors the web's
  // `?user=` query param (useMessagesPage's `initialUser`).
  final String? initialUser;

  const MessagesPageContent({
    super.key,
    required this.lang,
    this.initialUser,
  });

  @override
  ConsumerState<MessagesPageContent> createState() =>
      _MessagesPageContentState();
}

class _MessagesPageContentState extends ConsumerState<MessagesPageContent> {
  @override
  void initState() {
    super.initState();
    _applyInitialUser();
  }

  @override
  void didUpdateWidget(MessagesPageContent oldWidget) {
    super.didUpdateWidget(oldWidget);
    // GoRouter reuses this State across a query-param-only change (e.g.
    // tapping a second, different message notification without leaving the
    // page), so a plain initState-only check would miss it.
    if (widget.initialUser != oldWidget.initialUser) _applyInitialUser();
  }

  void _applyInitialUser() {
    final userId = widget.initialUser;
    if (userId == null || userId.isEmpty) return;
    // Riverpod forbids modifying a provider synchronously from initState /
    // didUpdateWidget (this crashed every deep link from a message push
    // notification with "Tried to modify a provider while the widget tree
    // was building") — defer to after the current frame finishes building.
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      // ChatView's own initState marks the conversation read once it mounts
      // for this id — no need to duplicate that call here.
      ref.read(selectedConversationUserIdProvider.notifier).state = userId;
    });
  }

  @override
  Widget build(BuildContext context) {
    return TierGate(
      freeWidget: FreeMessagesPage(lang: widget.lang),
      basicWidget: BasicMessagesPage(lang: widget.lang),
      mediumWidget: MediumMessagesPage(lang: widget.lang),
      premiumWidget: PremiumMessagesPage(lang: widget.lang),
    );
  }
}
