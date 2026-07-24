import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/lib/riverpod_compat.dart';

import '../../api/client/admin/actions.dart';
import '../../api/client/admin/query.dart';
import '../../api/server/admin/search_users.dart';
import '../../constants/theme.dart';
import '../../l10n/app_localizations.dart';
import '../../types/admin/audit_types.dart';

final _adminSearchQueryProvider = StateProvider<String>((ref) => '');

class AdminPageContent extends ConsumerStatefulWidget {
  final String lang;

  const AdminPageContent({super.key, required this.lang});

  @override
  ConsumerState<AdminPageContent> createState() => _AdminPageContentState();
}

class _AdminPageContentState extends ConsumerState<AdminPageContent> {
  final _searchController = TextEditingController();
  Timer? _debounce;

  @override
  void dispose() {
    _searchController.dispose();
    _debounce?.cancel();
    super.dispose();
  }

  void _onSearchChanged(String value) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 300), () {
      ref.read(_adminSearchQueryProvider.notifier).state = value.trim();
    });
  }

  Future<void> _setTier(String userId, String tier) async {
    try {
      await ref.read(adminActionsProvider).setTier(userId, tier);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(AppLocalizations.of(context).adminTierUpdated),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed: $e'), backgroundColor: Colors.red),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final t = AppLocalizations.of(context);
    final query = ref.watch(_adminSearchQueryProvider);
    final searchResults = ref.watch(adminSearchUsersProvider(query));
    final logsAsync =
        ref.watch(auditLogsProvider(const AuditLogParams(take: 10)));

    return Scaffold(
      appBar: AppBar(title: Text(t.adminTitle)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    t.adminSearchUsers,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _searchController,
                    onChanged: _onSearchChanged,
                    decoration: InputDecoration(
                      hintText: t.adminSearchPlaceholder,
                      prefixIcon: const Icon(Icons.search),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      isDense: true,
                    ),
                  ),
                  const SizedBox(height: 12),
                  searchResults.when(
                    loading: () => const Center(
                      child: CircularProgressIndicator(strokeWidth: 2),
                    ),
                    error: (e, _) => Text(
                      'Error: $e',
                      style: TextStyle(color: colors.danger),
                    ),
                    data: (users) {
                      if (users.isEmpty) {
                        if (query.isEmpty) {
                          return Text(t.adminTypeToSearch);
                        }
                        return Text(
                          t.adminNoUsersFor(query),
                          style: TextStyle(color: colors.fgMuted),
                        );
                      }
                      return Column(
                        children: users
                            .map(
                              (user) => _UserTierRow(
                                user: user,
                                onSetTier: (tier) => _setTier(user.id, tier),
                              ),
                            )
                            .toList(),
                      );
                    },
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),
          Text(
            t.adminAuditLogTitle,
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 8),
          logsAsync.when(
            loading: () =>
                const Center(child: CircularProgressIndicator(strokeWidth: 2)),
            error: (e, _) => Center(
              child: Text('Error: $e', style: TextStyle(color: colors.danger)),
            ),
            data: (logs) {
              if (logs.items.isEmpty) return Text(t.adminNoAuditLogs);
              return Column(
                children: logs.items
                    .take(10)
                    .map(
                      (log) => Card(
                        margin: const EdgeInsets.only(bottom: 4),
                        child: ListTile(
                          title: Text(
                            log.action,
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          subtitle: Text(
                            log.details ?? '',
                            style: TextStyle(
                              color: colors.fgMuted,
                              fontSize: 12,
                            ),
                          ),
                          trailing: Text(
                            '${log.createdAt.day}/${log.createdAt.month}/${log.createdAt.year}',
                            style:
                                TextStyle(color: colors.fgMuted, fontSize: 11),
                          ),
                          dense: true,
                        ),
                      ),
                    )
                    .toList(),
              );
            },
          ),
        ],
      ),
    );
  }
}

class _UserTierRow extends StatefulWidget {
  final AdminUser user;
  final ValueChanged<String> onSetTier;

  const _UserTierRow({required this.user, required this.onSetTier});

  @override
  State<_UserTierRow> createState() => _UserTierRowState();
}

class _UserTierRowState extends State<_UserTierRow> {
  late String _selectedTier;
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    _selectedTier = widget.user.tier;
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final t = AppLocalizations.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: colors.brand.withValues(alpha: 0.2),
            child: Text(
              widget.user.name[0].toUpperCase(),
              style: TextStyle(color: colors.brand),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  widget.user.name,
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
                Text(
                  widget.user.email,
                  style: TextStyle(color: colors.fgMuted, fontSize: 12),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          DropdownButton<String>(
            value: _selectedTier,
            underline: const SizedBox(),
            items: [
              DropdownMenuItem(value: 'FREE', child: Text(t.tierFree)),
              DropdownMenuItem(value: 'BASIC', child: Text(t.tierBasic)),
              DropdownMenuItem(value: 'MEDIUM', child: Text(t.tierMedium)),
              DropdownMenuItem(value: 'PREMIUM', child: Text(t.tierPremium)),
            ],
            onChanged: (v) {
              if (v != null) setState(() => _selectedTier = v);
            },
          ),
          const SizedBox(width: 8),
          _loading
              ? const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              : ElevatedButton(
                  onPressed: _selectedTier == widget.user.tier
                      ? null
                      : () async {
                          setState(() => _loading = true);
                          widget.onSetTier(_selectedTier);
                          if (mounted) setState(() => _loading = false);
                        },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: colors.brand,
                    foregroundColor: colors.fg,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                  ),
                  child: Text(t.adminSet),
                ),
        ],
      ),
    );
  }
}
