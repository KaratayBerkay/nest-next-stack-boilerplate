import 'package:flutter/material.dart';

import '../../../constants/theme.dart';
import '../../../api/server/admin/audit_logs.dart';
import 'audit_logs_diff_view.dart';

String _formatDate(DateTime d) {
  final now = DateTime.now();
  final diff = now.difference(d);
  if (diff.inMinutes < 1) return 'just now';
  if (diff.inHours < 1) return '${diff.inMinutes}m ago';
  if (diff.inDays < 1) return '${diff.inHours}h ago';
  return '${d.day}/${d.month}/${d.year} ${d.hour.toString().padLeft(2, '0')}:${d.minute.toString().padLeft(2, '0')}';
}

Color _levelColor(String level, AppColors colors) {
  switch (level.toUpperCase()) {
    case 'ERROR': case 'FATAL': return colors.danger;
    case 'WARN': return colors.warning;
    case 'INFO': return colors.info;
    case 'DEBUG': case 'TRACE': return colors.fgMuted;
    default: return colors.fgMuted;
  }
}

class AuditLogsTable extends StatefulWidget {
  final List<AuditLogEntry> items;
  final int currentPage;
  final int totalPages;
  final VoidCallback? onPreviousPage;
  final VoidCallback? onNextPage;

  const AuditLogsTable({
    super.key,
    required this.items,
    this.currentPage = 0,
    this.totalPages = 1,
    this.onPreviousPage,
    this.onNextPage,
  });

  @override
  State<AuditLogsTable> createState() => _AuditLogsTableState();
}

class _AuditLogsTableState extends State<AuditLogsTable> {
  String? _expandedId;

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    if (widget.items.isEmpty) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.history, size: 48, color: colors.fgMuted),
            const SizedBox(height: 8),
            Text('No audit logs', style: TextStyle(color: colors.fgMuted)),
          ],
        ),
      );
    }

    return Column(
      children: [
        Expanded(
          child: ListView.separated(
            padding: const EdgeInsets.all(8),
            itemCount: widget.items.length + 1,
            separatorBuilder: (_, __) => Divider(height: 1, color: colors.border),
            itemBuilder: (_, i) {
              if (i == widget.items.length) {
                return const SizedBox(height: 56);
              }
              final log = widget.items[i];
              final isExpanded = _expandedId == log.id;
              return _AuditLogTableRow(
                log: log,
                isExpanded: isExpanded,
                onToggle: () {
                  setState(() => _expandedId = isExpanded ? null : log.id);
                },
              );
            },
          ),
        ),
        if (widget.totalPages > 1)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: colors.surfaceAlt,
              border: Border(top: BorderSide(color: colors.border)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                IconButton(
                  icon: const Icon(Icons.chevron_left),
                  onPressed: widget.currentPage > 0 ? widget.onPreviousPage : null,
                ),
                Text('Page ${widget.currentPage + 1} of ${widget.totalPages}', style: const TextStyle(fontSize: 13)),
                IconButton(
                  icon: const Icon(Icons.chevron_right),
                  onPressed: widget.currentPage < widget.totalPages - 1 ? widget.onNextPage : null,
                ),
              ],
            ),
          ),
      ],
    );
  }
}

class _AuditLogTableRow extends StatelessWidget {
  final AuditLogEntry log;
  final bool isExpanded;
  final VoidCallback onToggle;

  const _AuditLogTableRow({required this.log, required this.isExpanded, required this.onToggle});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Column(
      children: [
        InkWell(
          onTap: onToggle,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: _levelColor(log.level, colors).withOpacity(0.15),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(log.level, style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                    color: _levelColor(log.level, colors),
                  )),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(log.action, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                      if (log.actor != null)
                        Text('by ${log.actor!.name}', style: TextStyle(fontSize: 11, color: colors.fgMuted)),
                    ],
                  ),
                ),
                if (log.entityType.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        border: Border.all(color: colors.border),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(log.entityType, style: TextStyle(fontSize: 10, color: colors.fgMuted)),
                    ),
                  ),
                Text(_formatDate(log.createdAt), style: TextStyle(fontSize: 11, color: colors.fgMuted)),
                const SizedBox(width: 4),
                Icon(
                  isExpanded ? Icons.expand_less : Icons.expand_more,
                  size: 18,
                  color: colors.fgMuted,
                ),
              ],
            ),
          ),
        ),
        if (isExpanded) _AuditLogTableDetail(log: log),
      ],
    );
  }
}

class _AuditLogTableDetail extends StatelessWidget {
  final AuditLogEntry log;

  const _AuditLogTableDetail({required this.log});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Container(
      padding: const EdgeInsets.all(12),
      margin: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: colors.surfaceAlt,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (log.actor != null) ...[
            _DetailRow(label: 'Actor', value: '${log.actor!.name} (${log.actor!.email})'),
            const SizedBox(height: 4),
          ],
          if (log.summary != null) ...[
            _DetailRow(label: 'Summary', value: log.summary!),
            const SizedBox(height: 4),
          ],
          if (log.ip != null) ...[
            _DetailRow(label: 'IP', value: log.ip!),
            const SizedBox(height: 4),
          ],
          if (log.requestId != null) ...[
            _DetailRow(label: 'Request ID', value: log.requestId!),
            const SizedBox(height: 4),
          ],
          if (log.details != null) ...[
            _DetailRow(label: 'Details', value: log.details!),
            const SizedBox(height: 4),
          ],
          if (log.before != null || log.after != null) ...[
            const SizedBox(height: 8),
            AuditLogsDiffView(before: log.before, after: log.after),
          ],
        ],
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  final String label;
  final String value;

  const _DetailRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 80,
          child: Text(label, style: TextStyle(fontSize: 11, color: colors.fgMuted, fontWeight: FontWeight.w500)),
        ),
        Expanded(child: Text(value, style: const TextStyle(fontSize: 11))),
      ],
    );
  }
}
