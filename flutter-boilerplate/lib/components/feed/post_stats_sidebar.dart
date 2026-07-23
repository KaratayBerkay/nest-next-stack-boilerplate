import 'package:flutter/material.dart';

import '../../constants/theme.dart';

class PostStats {
  final int totalPosts;
  final int totalReactions;
  final double avgReactionsPerPost;

  const PostStats({
    required this.totalPosts,
    required this.totalReactions,
    required this.avgReactionsPerPost,
  });
}

class PostStatsSidebar extends StatefulWidget {
  final Future<PostStats> Function()? onLoadStats;

  const PostStatsSidebar({
    super.key,
    this.onLoadStats,
  });

  @override
  State<PostStatsSidebar> createState() => _PostStatsSidebarState();
}

class _PostStatsSidebarState extends State<PostStatsSidebar> {
  PostStats? _stats;
  bool _loading = false;

  Future<void> _loadStats() async {
    if (widget.onLoadStats == null) return;
    setState(() => _loading = true);
    try {
      final stats = await widget.onLoadStats!();
      setState(() => _stats = stats);
    } catch (_) {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to load stats')),
      );
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        border: Border.all(color: colors.border),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'YOUR POST STATS',
            style: TextStyle(
              color: colors.fgMuted,
              fontSize: 11,
              fontWeight: FontWeight.w600,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 12),
          if (_stats == null)
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: _loading ? null : _loadStats,
                child: Text(_loading ? 'Loading...' : 'Load stats'),
              ),
            )
          else ...[
            _StatRow(
              label: 'Posts',
              value: '${_stats!.totalPosts}',
              colors: colors,
            ),
            const SizedBox(height: 8),
            _StatRow(
              label: 'Reactions',
              value: '${_stats!.totalReactions}',
              colors: colors,
            ),
            const SizedBox(height: 8),
            _StatRow(
              label: 'Avg/Post',
              value: _stats!.avgReactionsPerPost.toStringAsFixed(1),
              colors: colors,
            ),
          ],
        ],
      ),
    );
  }
}

class _StatRow extends StatelessWidget {
  final String label;
  final String value;
  final AppColors colors;

  const _StatRow({
    required this.label,
    required this.value,
    required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: TextStyle(color: colors.fgMuted, fontSize: 12)),
        Text(
          value,
          style: TextStyle(
            color: colors.fg,
            fontSize: 14,
            fontWeight: FontWeight.w700,
          ),
        ),
      ],
    );
  }
}
