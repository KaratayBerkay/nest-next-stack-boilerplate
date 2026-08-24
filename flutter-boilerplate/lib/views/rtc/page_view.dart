import 'package:flutter/material.dart' hide Badge;
import 'package:go_router/go_router.dart';

import '../../components/ui/badge/badge.dart';
import '../../components/ui/card/card.dart';
import '../../components/ui/card/card_content.dart';
import '../../components/ui/card/card_description.dart';
import '../../components/ui/card/card_header.dart';
import '../../components/ui/card/card_title.dart';
import '../../l10n/app_localizations.dart';

// RTC's tier differences are purely numeric caps (call/meeting duration,
// participant count) plus one binary go-live gate — not full different page
// layouts — so this hub, unlike Feed/Messages, is not composed of
// free/basic/medium/premium page views via TierGate.
class RtcPageContent extends StatelessWidget {
  final String lang;

  const RtcPageContent({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    final sections = [
      (
        Icons.call_outlined,
        t.rtcCallsTitle,
        t.rtcCallsDescription,
        '/v1/$lang/rtc/calls',
      ),
      (
        Icons.groups_outlined,
        t.rtcMeetingsTitle,
        t.rtcMeetingsDescription,
        null
      ),
      (Icons.podcasts_outlined, t.rtcLiveTitle, t.rtcLiveDescription, null),
    ];

    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(t.rtcTitle, style: Theme.of(context).textTheme.headlineSmall),
          const SizedBox(height: 4),
          Text(
            t.rtcSubtitle,
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: 16),
          for (final (icon, title, description, route) in sections)
            Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: InkWell(
                onTap: route != null ? () => context.push(route) : null,
                child: CardWidget(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      CardHeader(
                        child: Row(
                          children: [
                            Icon(icon),
                            const SizedBox(width: 8),
                            CardTitle(text: title),
                          ],
                        ),
                      ),
                      CardContent(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            CardDescription(text: description),
                            if (route == null) ...[
                              const SizedBox(height: 8),
                              Badge(text: t.rtcComingSoon),
                            ],
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
