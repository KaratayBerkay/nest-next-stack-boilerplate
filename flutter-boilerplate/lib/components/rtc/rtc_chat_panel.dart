import 'package:flutter/material.dart';

import '../../l10n/app_localizations.dart';

/// The minimal shape every RTC chat renders — meetings and streams share
/// the exact frame type server-side (RtcChatWsGateway), so their messages
/// are structurally identical; call sites map their typed lists here.
typedef RtcChatEntry = ({String senderName, String text});

/// Shared chat panel for the RTC rooms (meeting room, go-live broadcaster,
/// live viewer) — one message list + composer row instead of the three
/// verbatim copies those pages used to carry.
class RtcChatPanel extends StatelessWidget {
  final List<RtcChatEntry> messages;
  final TextEditingController controller;
  final VoidCallback onSend;

  const RtcChatPanel({
    super.key,
    required this.messages,
    required this.controller,
    required this.onSend,
  });

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);

    return Column(
      children: [
        Expanded(
          child: messages.isEmpty
              ? Center(child: Text(t.rtcNoChatMessages))
              : ListView.builder(
                  itemCount: messages.length,
                  itemBuilder: (context, index) {
                    final m = messages[index];
                    return Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 2,
                      ),
                      child: RichText(
                        text: TextSpan(
                          style: DefaultTextStyle.of(context).style,
                          children: [
                            TextSpan(
                              text: '${m.senderName}: ',
                              style: const TextStyle(
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            TextSpan(text: m.text),
                          ],
                        ),
                      ),
                    );
                  },
                ),
        ),
        Padding(
          padding: const EdgeInsets.all(8),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: controller,
                  decoration: InputDecoration(hintText: t.rtcChatPlaceholder),
                  onSubmitted: (_) => onSend(),
                ),
              ),
              IconButton(icon: const Icon(Icons.send), onPressed: onSend),
            ],
          ),
        ),
      ],
    );
  }
}
