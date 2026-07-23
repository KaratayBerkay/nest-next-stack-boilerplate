import 'package:flutter/material.dart';

import '../../../constants/theme.dart';

class AuditLogsFilters extends StatefulWidget {
  final String actionFilter;
  final String levelFilter;
  final String entityFilter;
  final ValueChanged<String> onActionChanged;
  final ValueChanged<String> onLevelChanged;
  final ValueChanged<String> onEntityChanged;
  final VoidCallback onApply;

  const AuditLogsFilters({
    super.key,
    this.actionFilter = '',
    this.levelFilter = '',
    this.entityFilter = '',
    required this.onActionChanged,
    required this.onLevelChanged,
    required this.onEntityChanged,
    required this.onApply,
  });

  @override
  State<AuditLogsFilters> createState() => _AuditLogsFiltersState();
}

class _AuditLogsFiltersState extends State<AuditLogsFilters> {
  late TextEditingController _entityController;

  @override
  void initState() {
    super.initState();
    _entityController = TextEditingController(text: widget.entityFilter);
  }

  @override
  void didUpdateWidget(AuditLogsFilters oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.entityFilter != oldWidget.entityFilter && _entityController.text != widget.entityFilter) {
      _entityController.text = widget.entityFilter;
    }
  }

  @override
  void dispose() {
    _entityController.dispose();
    super.dispose();
  }

  static const _actions = ['', 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'SET_TIER', 'API_KEY'];
  static const _levels = ['', 'TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'];

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: colors.surfaceAlt,
        border: Border(bottom: BorderSide(color: colors.border)),
      ),
      child: Wrap(
        spacing: 8,
        runSpacing: 8,
        crossAxisAlignment: WrapCrossAlignment.center,
        children: [
          DropdownButton<String>(
            value: widget.actionFilter,
            underline: const SizedBox(),
            items: _actions.map((a) => DropdownMenuItem(
              value: a,
              child: Text(a.isEmpty ? 'All actions' : a, style: const TextStyle(fontSize: 13)),
            ),).toList(),
            onChanged: (v) {
              if (v == null) return;
              widget.onActionChanged(v);
            },
          ),
          DropdownButton<String>(
            value: widget.levelFilter,
            underline: const SizedBox(),
            items: _levels.map((l) => DropdownMenuItem(
              value: l,
              child: Text(l.isEmpty ? 'All levels' : l, style: const TextStyle(fontSize: 13)),
            ),).toList(),
            onChanged: (v) {
              if (v == null) return;
              widget.onLevelChanged(v);
            },
          ),
          SizedBox(
            width: 160,
            child: TextField(
              controller: _entityController,
              decoration: InputDecoration(
                hintText: 'Entity type...',
                prefixIcon: const Icon(Icons.search, size: 18),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                isDense: true,
                contentPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
              ),
              onChanged: (_) => widget.onEntityChanged(_entityController.text.trim()),
            ),
          ),
          IconButton(
            icon: Icon(Icons.search, color: colors.brand),
            onPressed: widget.onApply,
            tooltip: 'Apply filters',
          ),
        ],
      ),
    );
  }
}
