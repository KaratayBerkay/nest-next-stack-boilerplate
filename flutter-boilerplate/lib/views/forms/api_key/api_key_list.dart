import 'package:flutter/material.dart';

import '../../../constants/theme.dart';

class ApiKeyItem {
  final String id;
  final String name;
  final String maskedKey;
  final bool active;

  const ApiKeyItem({
    required this.id,
    required this.name,
    required this.maskedKey,
    this.active = true,
  });
}

class ApiKeyList extends StatelessWidget {
  final List<ApiKeyItem> keys;
  final ValueChanged<String>? onDelete;
  final ValueChanged<String>? onCopy;

  const ApiKeyList({
    super.key,
    required this.keys,
    this.onDelete,
    this.onCopy,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Your API Keys', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        if (keys.isEmpty)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 24),
            child: Center(
              child: Text('No API keys yet', style: TextStyle(color: colors.fgMuted)),
            ),
          )
        else
          ...keys.map((key) => Card(
            child: ListTile(
              title: Text(key.name),
              subtitle: Text(key.maskedKey, style: TextStyle(color: colors.fgMuted, fontSize: 12)),
              trailing: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (onCopy != null)
                    IconButton(
                      icon: Icon(Icons.copy, size: 18, color: colors.fgMuted),
                      onPressed: () => onCopy!(key.id),
                    ),
                  IconButton(
                    icon: Icon(Icons.delete_outline, color: colors.danger),
                    onPressed: () => onDelete!(key.id),
                  ),
                ],
              ),
            ),
          ),),
      ],
    );
  }
}
