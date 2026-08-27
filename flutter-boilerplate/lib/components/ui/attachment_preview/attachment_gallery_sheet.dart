import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/theme.dart';
import '../../../l10n/app_localizations.dart';
import '../../../types/messages/gallery_attachment.dart';
import 'attachment_preview.dart';

/// Mirrors web's `AttachmentGallerySheet.tsx`/`RoomAttachmentGallerySheet.tsx`
/// — one shared implementation for both messages and chat-room, parameterized
/// by [fetchPage] instead of duplicating the sheet per source. Scoped down
/// from web's version for this pass: day-grouping + load-more are here;
/// search/date-range filtering is not (the feature existing at all was the
/// actual gap — filters are a reasonable follow-up, not the core ask).
class AttachmentGallerySheet extends ConsumerStatefulWidget {
  final Future<GalleryAttachmentsPage> Function({String? before, int take})
      fetchPage;

  const AttachmentGallerySheet({super.key, required this.fetchPage});

  static void show(
    BuildContext context, {
    required Future<GalleryAttachmentsPage> Function({
      String? before,
      int take,
    }) fetchPage,
  }) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (_) => DraggableScrollableSheet(
        initialChildSize: 0.85,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        expand: false,
        builder: (context, scrollController) => AttachmentGallerySheet(
          fetchPage: fetchPage,
        ),
      ),
    );
  }

  @override
  ConsumerState<AttachmentGallerySheet> createState() =>
      _AttachmentGallerySheetState();
}

class _DayGroup {
  final DateTime day;
  final List<GalleryAttachment> attachments;
  _DayGroup(this.day, this.attachments);
}

class _AttachmentGallerySheetState
    extends ConsumerState<AttachmentGallerySheet> {
  final List<GalleryAttachment> _items = [];
  bool _loading = true;
  bool _loadingMore = false;
  bool _hasMore = false;
  bool _error = false;

  @override
  void initState() {
    super.initState();
    _loadFirstPage();
  }

  Future<void> _loadFirstPage() async {
    setState(() {
      _loading = true;
      _error = false;
    });
    try {
      final page = await widget.fetchPage(take: 30);
      if (!mounted) return;
      setState(() {
        _items
          ..clear()
          ..addAll(page.attachments);
        _hasMore = page.hasMore;
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _error = true;
        _loading = false;
      });
    }
  }

  Future<void> _loadMore() async {
    if (_loadingMore || !_hasMore || _items.isEmpty) return;
    setState(() => _loadingMore = true);
    try {
      final page = await widget.fetchPage(
        before: _items.last.createdAt.toIso8601String(),
        take: 30,
      );
      if (!mounted) return;
      setState(() {
        _items.addAll(page.attachments);
        _hasMore = page.hasMore;
        _loadingMore = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _loadingMore = false);
    }
  }

  List<_DayGroup> _groupByDay(List<GalleryAttachment> items) {
    final groups = <_DayGroup>[];
    for (final att in items) {
      final day =
          DateTime(att.createdAt.year, att.createdAt.month, att.createdAt.day);
      if (groups.isNotEmpty && groups.last.day == day) {
        groups.last.attachments.add(att);
      } else {
        groups.add(_DayGroup(day, [att]));
      }
    }
    return groups;
  }

  bool _isToday(DateTime day) {
    final now = DateTime.now();
    return day.year == now.year && day.month == now.month && day.day == now.day;
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final t = AppLocalizations.of(context);
    final groups = _groupByDay(_items);

    return SafeArea(
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 8, 8),
            child: Row(
              children: [
                Text(
                  t.allUploadsTitle,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const Spacer(),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ],
            ),
          ),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _error
                    ? Center(
                        child: Text(
                          t.allUploadsFailedToLoad,
                          style: TextStyle(color: colors.danger),
                        ),
                      )
                    : groups.isEmpty
                        ? Center(
                            child: Text(
                              t.allUploadsEmpty,
                              style: TextStyle(color: colors.fgMuted),
                            ),
                          )
                        : ListView.builder(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 16,
                            ),
                            itemCount: groups.length + (_hasMore ? 1 : 0),
                            itemBuilder: (context, index) {
                              if (index == groups.length) {
                                return Padding(
                                  padding: const EdgeInsets.symmetric(
                                    vertical: 12,
                                  ),
                                  child: Center(
                                    child: _loadingMore
                                        ? const CircularProgressIndicator()
                                        : TextButton(
                                            onPressed: _loadMore,
                                            child: Text(t.notificationLoadMore),
                                          ),
                                  ),
                                );
                              }
                              final group = groups[index];
                              return Padding(
                                padding: const EdgeInsets.only(bottom: 16),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      _isToday(group.day)
                                          ? 'Today'
                                          : '${group.day.year}-${group.day.month.toString().padLeft(2, '0')}-${group.day.day.toString().padLeft(2, '0')}',
                                      style: TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w600,
                                        color: colors.fgMuted,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      '${group.attachments.length} ${t.files}',
                                      style: TextStyle(
                                        fontSize: 11,
                                        color: colors.fgMuted,
                                      ),
                                    ),
                                    const SizedBox(height: 8),
                                    ...group.attachments.map(
                                      (att) => Padding(
                                        padding: const EdgeInsets.only(
                                          bottom: 8,
                                        ),
                                        child: AttachmentPreview(
                                          url: att.url,
                                          type: att.type,
                                          name: att.name,
                                          thumbnailUrl: att.thumbnailUrl,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            },
                          ),
          ),
        ],
      ),
    );
  }
}
