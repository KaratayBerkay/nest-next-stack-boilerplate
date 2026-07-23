import 'package:flutter/material.dart';

import '../../../constants/theme.dart';

class ApiKeyItem {
  final String id;
  final String name;
  final String prefix;
  final DateTime createdAt;
  final DateTime? lastUsedAt;

  const ApiKeyItem({
    required this.id,
    required this.name,
    required this.prefix,
    required this.createdAt,
    this.lastUsedAt,
  });
}

class ApiKeyList extends StatelessWidget {
  final List<ApiKeyItem> keys;
  final Future<void> Function(String id)? onRevoke;

  const ApiKeyList({
    super.key,
    required this.keys,
    this.onRevoke,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return ListView(
      padding: const EdgeInsets.all(16),
      children: keys.map((k) => Padding(
        padding: const EdgeInsets.only(bottom: 8),
        child: Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(k.name, style: const TextStyle(fontWeight: FontWeight.w600)),
                          Text('${k.prefix}••••••••••••••••',
                              style: TextStyle(color: colors.fgMuted, fontSize: 12)),
                        ],
                      ),
                    ),
                    if (onRevoke != null)
                      IconButton(
                        icon: const Icon(Icons.delete_outline, size: 18),
                        onPressed: () => onRevoke!(k.id),
                      ),
                  ],
                ),
                const SizedBox(height: 8),
                Text('Created: ${k.createdAt.toLocal().toString().split(' ')[0]}',
                    style: TextStyle(color: colors.fgMuted, fontSize: 11)),
                if (k.lastUsedAt != null)
                  Text('Last used: ${k.lastUsedAt!.toLocal().toString().split(' ')[0]}',
                      style: TextStyle(color: colors.fgMuted, fontSize: 11)),
              ],
            ),
          ),
        ),
      )).toList(),
    );
  }
}
