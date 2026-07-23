import 'package:flutter/material.dart';

import '../../api/server/admin/search_users.dart';
import '../../constants/theme.dart';

class UserTierRow extends StatefulWidget {
  final AdminUser user;
  final ValueChanged<String> onSetTier;

  const UserTierRow({
    super.key,
    required this.user,
    required this.onSetTier,
  });

  @override
  State<UserTierRow> createState() => _UserTierRowState();
}

class _UserTierRowState extends State<UserTierRow> {
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

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: colors.brand.withOpacity(0.2),
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
                Text(widget.user.name, style: const TextStyle(fontWeight: FontWeight.w600)),
                Text(widget.user.email, style: TextStyle(color: colors.fgMuted, fontSize: 12)),
              ],
            ),
          ),
          const SizedBox(width: 8),
          DropdownButton<String>(
            value: _selectedTier,
            underline: const SizedBox(),
            items: const [
              DropdownMenuItem(value: 'FREE', child: Text('Free')),
              DropdownMenuItem(value: 'BASIC', child: Text('Basic')),
              DropdownMenuItem(value: 'MEDIUM', child: Text('Medium')),
              DropdownMenuItem(value: 'PREMIUM', child: Text('Premium')),
            ],
            onChanged: (v) {
              if (v != null) setState(() => _selectedTier = v);
            },
          ),
          const SizedBox(width: 8),
          _loading
            ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
            : ElevatedButton(
                onPressed: _selectedTier == widget.user.tier ? null : () async {
                  setState(() => _loading = true);
                  widget.onSetTier(_selectedTier);
                  if (mounted) setState(() => _loading = false);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: colors.brand,
                  foregroundColor: colors.fg,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                ),
                child: const Text('Set'),
              ),
        ],
      ),
    );
  }
}
