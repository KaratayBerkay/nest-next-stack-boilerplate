import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/lib/riverpod_compat.dart';

import '../../../api/client/admin/query.dart';
import '../../../constants/theme.dart';
import '../../../types/admin/audit_types.dart';

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
    case 'ERROR':
    case 'FATAL':
      return colors.danger;
    case 'WARN':
      return colors.warning;
    case 'INFO':
      return colors.info;
    case 'DEBUG':
    case 'TRACE':
      return colors.fgMuted;
    default:
      return colors.fgMuted;
  }
}

class AdminAuditLogsPageContent extends ConsumerStatefulWidget {
  final String lang;

  const AdminAuditLogsPageContent({super.key, required this.lang});

  @override
  ConsumerState<AdminAuditLogsPageContent> createState() =>
      _AdminAuditLogsPageContentState();
}

class _AdminAuditLogsPageContentState
    extends ConsumerState<AdminAuditLogsPageContent> {
  String _actionFilter = '';
  String _levelFilter = '';
  final _entityController = TextEditingController();
  int _page = 0;
  String? _expandedId;

  static const _pageSize = 50;
  static const _actions = [
    '',
    'CREATE',
    'UPDATE',
    'DELETE',
    'LOGIN',
    'LOGOUT',
    'SET_TIER',
    'API_KEY',
  ];
  static const _levels = [
    '',
    'TRACE',
    'DEBUG',
    'INFO',
    'WARN',
    'ERROR',
    'FATAL',
  ];

  AuditLogParams _buildParams() {
    return AuditLogParams(
      skip: _page * _pageSize,
      action: _actionFilter.isEmpty ? null : _actionFilter,
      level: _levelFilter.isEmpty ? null : _levelFilter,
      entityType:
          _entityController.text.isEmpty ? null : _entityController.text.trim(),
    );
  }

  void _onFilterChanged() {
    setState(() => _page = 0);
    ref.invalidate(auditLogsProvider);
  }

  @override
  void dispose() {
    _entityController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final params = _buildParams();
    final logsAsync = ref.watch(auditLogsProvider(params));

    return Scaffold(
      appBar: AppBar(title: const Text('Audit Logs')),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: colors.surfaceAlt,
              border: Border(bottom: BorderSide(color: colors.border)),
            ),
            child: Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                DropdownButton<String>(
                  value: _actionFilter,
                  underline: const SizedBox(),
                  items: _actions
                      .map(
                        (a) => DropdownMenuItem(
                          value: a,
                          child: Text(
                            a.isEmpty ? 'All actions' : a,
                            style: const TextStyle(fontSize: 13),
                          ),
                        ),
                      )
                      .toList(),
                  onChanged: (v) {
                    if (v == null) return;
                    setState(() => _actionFilter = v);
                    _onFilterChanged();
                  },
                ),
                DropdownButton<String>(
                  value: _levelFilter,
                  underline: const SizedBox(),
                  items: _levels
                      .map(
                        (l) => DropdownMenuItem(
                          value: l,
                          child: Text(
                            l.isEmpty ? 'All levels' : l,
                            style: const TextStyle(fontSize: 13),
                          ),
                        ),
                      )
                      .toList(),
                  onChanged: (v) {
                    if (v == null) return;
                    setState(() => _levelFilter = v);
                    _onFilterChanged();
                  },
                ),
                SizedBox(
                  width: 160,
                  child: TextField(
                    controller: _entityController,
                    onChanged: (_) => _onFilterChanged(),
                    decoration: InputDecoration(
                      hintText: 'Entity type...',
                      prefixIcon: const Icon(Icons.search, size: 18),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      isDense: true,
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 8,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: logsAsync.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (_, __) => Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.error_outline, size: 48, color: colors.danger),
                    const SizedBox(height: 8),
                    const Text('Failed to load logs'),
                    const SizedBox(height: 8),
                    ElevatedButton(
                      onPressed: () => ref.invalidate(auditLogsProvider),
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              ),
              data: (response) {
                if (response.items.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.history, size: 48, color: colors.fgMuted),
                        const SizedBox(height: 8),
                        Text(
                          'No audit logs',
                          style: TextStyle(color: colors.fgMuted),
                        ),
                      ],
                    ),
                  );
                }

                final totalPages = (response.total / _pageSize).ceil();

                return Column(
                  children: [
                    Expanded(
                      child: ListView.separated(
                        padding: const EdgeInsets.all(8),
                        itemCount: response.items.length + 1,
                        separatorBuilder: (_, __) =>
                            Divider(height: 1, color: colors.border),
                        itemBuilder: (_, i) {
                          if (i == response.items.length) {
                            return const SizedBox(height: 56);
                          }
                          final log = response.items[i];
                          final isExpanded = _expandedId == log.id;
                          return _AuditLogRow(
                            log: log,
                            isExpanded: isExpanded,
                            onToggle: () {
                              setState(
                                () => _expandedId = isExpanded ? null : log.id,
                              );
                            },
                          );
                        },
                      ),
                    ),
                    if (totalPages > 1)
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 8,
                        ),
                        decoration: BoxDecoration(
                          color: colors.surfaceAlt,
                          border: Border(top: BorderSide(color: colors.border)),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            IconButton(
                              icon: const Icon(Icons.chevron_left),
                              onPressed: _page > 0
                                  ? () {
                                      setState(() => _page--);
                                    }
                                  : null,
                            ),
                            Text(
                              'Page ${_page + 1} of $totalPages',
                              style: const TextStyle(fontSize: 13),
                            ),
                            IconButton(
                              icon: const Icon(Icons.chevron_right),
                              onPressed: _page < totalPages - 1
                                  ? () {
                                      setState(() => _page++);
                                    }
                                  : null,
                            ),
                          ],
                        ),
                      ),
                  ],
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _AuditLogRow extends StatelessWidget {
  final AuditLogEntry log;
  final bool isExpanded;
  final VoidCallback onToggle;

  const _AuditLogRow({
    required this.log,
    required this.isExpanded,
    required this.onToggle,
  });

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
                  padding:
                      const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color:
                        _levelColor(log.level, colors).withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    log.level,
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                      color: _levelColor(log.level, colors),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        log.action,
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      if (log.actor != null)
                        Text(
                          'by ${log.actor!.name}',
                          style: TextStyle(fontSize: 11, color: colors.fgMuted),
                        ),
                    ],
                  ),
                ),
                if (log.entityType.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 6,
                        vertical: 2,
                      ),
                      decoration: BoxDecoration(
                        border: Border.all(color: colors.border),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        log.entityType,
                        style: TextStyle(fontSize: 10, color: colors.fgMuted),
                      ),
                    ),
                  ),
                Text(
                  _formatDate(log.createdAt),
                  style: TextStyle(fontSize: 11, color: colors.fgMuted),
                ),
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
        if (isExpanded) _AuditLogDetail(log: log),
      ],
    );
  }
}

class _AuditLogDetail extends StatelessWidget {
  final AuditLogEntry log;

  const _AuditLogDetail({required this.log});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final hasDiff = log.before != null || log.after != null;

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
            _DetailRow(
              label: 'Actor',
              value: '${log.actor!.name} (${log.actor!.email})',
            ),
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
          if (hasDiff) ...[
            const SizedBox(height: 8),
            const Text(
              'Changes',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 4),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (log.before != null)
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: colors.surface,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Before',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w600,
                              color: colors.danger,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            _prettyJson(log.before!),
                            style: TextStyle(
                              fontSize: 10,
                              color: colors.fg,
                              fontFamily: 'monospace',
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                if (log.before != null && log.after != null)
                  const SizedBox(width: 8),
                if (log.after != null)
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: colors.surface,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'After',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w600,
                              color: colors.success,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            _prettyJson(log.after!),
                            style: TextStyle(
                              fontSize: 10,
                              color: colors.fg,
                              fontFamily: 'monospace',
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  String _prettyJson(Map<String, dynamic> json) {
    try {
      return json.entries.map((e) => '${e.key}: ${e.value}').join('\n');
    } catch (_) {
      return json.toString();
    }
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
          child: Text(
            label,
            style: TextStyle(
              fontSize: 11,
              color: colors.fgMuted,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
        Expanded(child: Text(value, style: const TextStyle(fontSize: 11))),
      ],
    );
  }
}
