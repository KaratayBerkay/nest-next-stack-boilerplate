import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/lib/date_time.dart';
import 'package:flutter_boilerplate/lib/rtc/rtc_call_provider.dart';
import 'package:flutter_boilerplate/lib/rtc/rtc_call_state.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../api/client/rtc/calls_actions.dart';
import '../../api/client/rtc/query.dart';
import '../../components/rtc/rtc_report_dialog.dart';
import '../../components/ui/avatar/avatar.dart';
import '../../constants/theme.dart';
import '../../l10n/app_localizations.dart';
import '../../types/rtc/call_history_entry.dart';

class RtcCallsPageContent extends ConsumerWidget {
  const RtcCallsPageContent({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = AppLocalizations.of(context);
    final state = ref.watch(callHistoryProvider);

    return Scaffold(
      appBar: AppBar(title: Text(t.rtcHistoryTitle)),
      body: state.isInitialLoading
          ? const Center(child: CircularProgressIndicator())
          : state.items.isEmpty
              ? Center(child: Text(t.rtcNoCallHistory))
              : ListView.builder(
                  itemCount: state.items.length + (state.hasMore ? 1 : 0),
                  itemBuilder: (context, index) {
                    if (index == state.items.length) {
                      return Padding(
                        padding: const EdgeInsets.all(16),
                        child: Center(
                          child: state.isLoadingMore
                              ? const CircularProgressIndicator()
                              : TextButton(
                                  onPressed: () => ref
                                      .read(callHistoryProvider.notifier)
                                      .loadMore(),
                                  child: Text(t.rtcLoadMore),
                                ),
                        ),
                      );
                    }
                    return _CallHistoryTile(call: state.items[index]);
                  },
                ),
    );
  }
}

class _CallHistoryTile extends ConsumerWidget {
  final CallHistoryEntry call;

  const _CallHistoryTile({required this.call});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = AppLocalizations.of(context);
    final colors = AppColors.of(context);
    final rtcState = ref.watch(rtcCallProvider);
    final stateLabel = switch (call.state) {
      'ENDED' => t.rtcStateEnded,
      'REJECTED' => t.rtcStateRejected,
      'CANCELLED' => t.rtcStateCancelled,
      'MISSED' => t.rtcStateMissed,
      'FAILED' => t.rtcStateFailed,
      _ => call.state,
    };
    final isMissed = call.state == 'MISSED' && call.direction == 'incoming';
    final rowColor = isMissed ? colors.danger : colors.fgMuted;

    return ListTile(
      leading: Avatar(imageUrl: call.peer.avatarUrl, name: call.peer.name),
      title: Text(
        call.peer.name,
        style: isMissed ? TextStyle(color: colors.danger) : null,
      ),
      subtitle: Row(
        children: [
          Icon(
            call.direction == 'incoming'
                ? Icons.call_received
                : Icons.call_made,
            size: 14,
            color: rowColor,
          ),
          if (call.hasVideo) ...[
            const SizedBox(width: 4),
            Icon(Icons.videocam, size: 14, color: rowColor),
          ],
          const SizedBox(width: 6),
          Text(
            '$stateLabel · ${DateTimeHelper.relative(call.ringingAt)}',
            style: TextStyle(color: rowColor, fontSize: 12),
          ),
        ],
      ),
      trailing: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          IconButton(
            icon: const Icon(Icons.flag_outlined, size: 20),
            tooltip: t.rtcReportTitle,
            onPressed: () => showDialog<void>(
              context: context,
              builder: (context) => RtcReportDialog(
                onSubmit: (reason, details) => ref
                    .read(callActionsProvider)
                    .report(call.id, reason, details: details),
              ),
            ),
          ),
          IconButton(
            icon: Icon(call.hasVideo ? Icons.videocam : Icons.call),
            onPressed: rtcState.phase == RtcCallPhase.idle
                ? () => ref.read(rtcCallProvider.notifier).startCall(
                      RtcCallPeer(
                        id: call.peer.id,
                        name: call.peer.name,
                        avatarUrl: call.peer.avatarUrl,
                      ),
                      call.hasVideo,
                    )
                : null,
          ),
        ],
      ),
    );
  }
}
