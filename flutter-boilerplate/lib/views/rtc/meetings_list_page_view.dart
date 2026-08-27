import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../api/client/rtc/meetings_actions.dart';
import '../../api/client/rtc/meetings_query.dart';
import '../../app_config.dart';
import '../../constants/theme.dart';
import '../../l10n/app_localizations.dart';
import '../../types/rtc/meeting.dart';

class RtcMeetingsListPageContent extends ConsumerWidget {
  final String lang;

  const RtcMeetingsListPageContent({super.key, required this.lang});

  Future<void> _showCreateDialog(BuildContext context, WidgetRef ref) async {
    final t = AppLocalizations.of(context);
    final controller = TextEditingController();
    final title = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(t.rtcNewMeetingTitle),
        content: TextField(
          controller: controller,
          decoration: InputDecoration(hintText: t.rtcMeetingTitlePlaceholder),
          autofocus: true,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: Text(t.rtcCancel),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(controller.text),
            child: Text(t.rtcCreate),
          ),
        ],
      ),
    );
    controller.dispose();
    if (title == null || title.trim().isEmpty || !context.mounted) return;

    try {
      final meeting =
          await ref.read(meetingActionsProvider).create(title.trim());
      ref.invalidate(myMeetingsProvider);
      if (context.mounted) {
        context.push('/v1/$lang/rtc/meetings/${meeting.slug}');
      }
    } catch (e) {
      if (context.mounted) {
        final message = e is DioException && (e.message?.isNotEmpty ?? false)
            ? e.message!
            : t.rtcCreateMeetingFailed;
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(message)));
      }
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = AppLocalizations.of(context);
    final colors = AppColors.of(context);
    final meetings = ref.watch(myMeetingsProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(t.rtcMyMeetingsTitle),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            tooltip: t.rtcNewMeeting,
            onPressed: () => _showCreateDialog(context, ref),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.refresh(myMeetingsProvider.future),
        child: meetings.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (e, _) => Center(child: Text(t.errorSomethingWentWrong)),
          data: (list) => list.isEmpty
              ? ListView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  children: [
                    SizedBox(
                      height: 320,
                      child: Center(child: Text(t.rtcNoMeetings)),
                    ),
                  ],
                )
              : ListView.builder(
                  physics: const AlwaysScrollableScrollPhysics(),
                  itemCount: list.length,
                  itemBuilder: (context, index) {
                    final meeting = list[index];
                    final isActive = meeting.room.state == 'ACTIVE';
                    return ListTile(
                      leading: const Icon(Icons.groups_outlined),
                      title: Text(meeting.title),
                      subtitle: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 6,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: isActive
                                  ? colors.success.withValues(alpha: 0.15)
                                  : colors.fgMuted.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              isActive
                                  ? t.rtcMeetingActiveLabel
                                  : t.rtcMeetingEndedLabel,
                              style: TextStyle(
                                fontSize: 11,
                                color:
                                    isActive ? colors.success : colors.fgMuted,
                              ),
                            ),
                          ),
                        ],
                      ),
                      trailing: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          IconButton(
                            icon: const Icon(Icons.copy_outlined, size: 20),
                            tooltip: t.rtcCopyLink,
                            onPressed: () => _copyLink(context, meeting),
                          ),
                          if (isActive)
                            TextButton(
                              onPressed: () => context.push(
                                '/v1/$lang/rtc/meetings/${meeting.slug}',
                              ),
                              child: Text(t.rtcJoin),
                            ),
                        ],
                      ),
                    );
                  },
                ),
        ),
      ),
    );
  }

  void _copyLink(BuildContext context, Meeting meeting) {
    final t = AppLocalizations.of(context);
    // An absolute web-app URL — a bare in-app path is useless to the invitee
    // (web copies `${window.location.origin}/…` for the same reason).
    Clipboard.setData(
      ClipboardData(
        text: '${AppConfig.webBaseUrl}/v1/$lang/rtc/meetings/${meeting.slug}',
      ),
    );
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(t.rtcLinkCopied)));
  }
}
