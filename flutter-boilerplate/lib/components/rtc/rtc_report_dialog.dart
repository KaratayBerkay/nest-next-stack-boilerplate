import 'package:flutter/material.dart';

import '../../l10n/app_localizations.dart';

/// Minimal report submission — a reason + optional free-text details,
/// persisted server-side. No review UI reads this yet (Phase 5 scope).
/// Reused across meeting room, live viewer, and call history — mirrors
/// web's RtcReportDialog.tsx.
class RtcReportDialog extends StatefulWidget {
  final Future<void> Function(String reason, String? details) onSubmit;

  const RtcReportDialog({super.key, required this.onSubmit});

  @override
  State<RtcReportDialog> createState() => _RtcReportDialogState();
}

class _RtcReportDialogState extends State<RtcReportDialog> {
  String _reason = 'HARASSMENT';
  final _detailsController = TextEditingController();
  bool _submitting = false;
  bool _done = false;

  Future<void> _submit() async {
    setState(() => _submitting = true);
    try {
      final details = _detailsController.text.trim();
      await widget.onSubmit(_reason, details.isEmpty ? null : details);
      if (mounted) setState(() => _done = true);
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  void dispose() {
    _detailsController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);

    if (_done) {
      return AlertDialog(
        title: Text(t.rtcReportTitle),
        content: Text(t.rtcReportSubmitted),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: Text(t.rtcClose),
          ),
        ],
      );
    }

    return AlertDialog(
      title: Text(t.rtcReportTitle),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          DropdownButtonFormField<String>(
            initialValue: _reason,
            items: [
              DropdownMenuItem(
                value: 'HARASSMENT',
                child: Text(t.rtcReportReasonHarassment),
              ),
              DropdownMenuItem(
                value: 'SPAM',
                child: Text(t.rtcReportReasonSpam),
              ),
              DropdownMenuItem(
                value: 'INAPPROPRIATE_CONTENT',
                child: Text(t.rtcReportReasonInappropriate),
              ),
              DropdownMenuItem(
                value: 'OTHER',
                child: Text(t.rtcReportReasonOther),
              ),
            ],
            onChanged: (value) => setState(() => _reason = value ?? _reason),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _detailsController,
            maxLines: 3,
            decoration:
                InputDecoration(hintText: t.rtcReportDetailsPlaceholder),
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: Text(t.rtcCancel),
        ),
        FilledButton(
          onPressed: _submitting ? null : _submit,
          child: Text(t.rtcReportSubmit),
        ),
      ],
    );
  }
}
