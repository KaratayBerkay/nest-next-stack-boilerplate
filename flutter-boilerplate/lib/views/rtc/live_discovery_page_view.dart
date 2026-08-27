import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../api/client/rtc/streams_query.dart';
import '../../components/ui/avatar/avatar.dart';
import '../../l10n/app_localizations.dart';

class RtcLiveDiscoveryPageContent extends ConsumerWidget {
  final String lang;

  const RtcLiveDiscoveryPageContent({super.key, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = AppLocalizations.of(context);
    final streams = ref.watch(liveStreamsProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(t.rtcLiveTitle),
        actions: [
          IconButton(
            icon: const Icon(Icons.videocam_outlined),
            tooltip: t.rtcGoLive,
            onPressed: () => context.push('/v1/$lang/rtc/live/go-live'),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.refresh(liveStreamsProvider.future),
        child: streams.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (e, _) => Center(child: Text(t.errorSomethingWentWrong)),
          data: (list) => list.isEmpty
              // Scrollable even when empty so pull-to-refresh still works —
              // a live list goes stale the moment someone starts a stream.
              ? ListView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  children: [
                    SizedBox(
                      height: 320,
                      child: Center(child: Text(t.rtcNoLiveStreams)),
                    ),
                  ],
                )
              : ListView.builder(
                  physics: const AlwaysScrollableScrollPhysics(),
                  itemCount: list.length,
                  itemBuilder: (context, index) {
                    final stream = list[index];
                    return ListTile(
                      leading: Avatar(name: stream.broadcaster.name ?? ''),
                      title: Text(stream.title),
                      subtitle: Text(stream.broadcaster.name ?? ''),
                      trailing: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.visibility_outlined, size: 16),
                          const SizedBox(width: 4),
                          Text('${stream.viewerCount}'),
                        ],
                      ),
                      onTap: () =>
                          context.push('/v1/$lang/rtc/live/${stream.slug}'),
                    );
                  },
                ),
        ),
      ),
    );
  }
}
