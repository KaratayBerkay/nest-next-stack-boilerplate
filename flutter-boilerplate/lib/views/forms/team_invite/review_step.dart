import 'package:flutter/material.dart';

import '../../../constants/theme.dart';

class ReviewStep extends StatelessWidget {
  final List<String> emails;
  final String role;
  final String? message;

  const ReviewStep({
    super.key,
    required this.emails,
    required this.role,
    this.message,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Review Invitations',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 4),
        Text(
          'Please review before sending',
          style: TextStyle(color: colors.fgMuted, fontSize: 13),
        ),
        const SizedBox(height: 12),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Recipients (${emails.length})',
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    color: colors.fgMuted,
                    fontSize: 12,
                  ),
                ),
                const SizedBox(height: 4),
                ...emails.map(
                  (e) => Padding(
                    padding: const EdgeInsets.symmetric(vertical: 2),
                    child: Row(
                      children: [
                        Icon(Icons.email, size: 14, color: colors.fgMuted),
                        const SizedBox(width: 6),
                        Text(e),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 8),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Role',
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    color: colors.fgMuted,
                    fontSize: 12,
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Icon(Icons.shield, size: 14, color: colors.brand),
                    const SizedBox(width: 6),
                    Text(role[0].toUpperCase() + role.substring(1)),
                  ],
                ),
              ],
            ),
          ),
        ),
        if (message != null && message!.isNotEmpty) ...[
          const SizedBox(height: 8),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Message',
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      color: colors.fgMuted,
                      fontSize: 12,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(message!),
                ],
              ),
            ),
          ),
        ],
      ],
    );
  }
}
