import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/lib/tier_view.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../api/client/posts/actions.dart';
import '../../api/client/posts/query.dart';
import '../../components/ui/avatar/avatar.dart';
import '../../constants/theme.dart';
import '../../types/feed/post.dart';

class PostsPageContent extends ConsumerWidget {
  final String lang;

  const PostsPageContent({super.key, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return TierGate(
      freeWidget: _FreePostsView(lang: lang),
      basicWidget: _PostsView(lang: lang),
      mediumWidget: _PostsView(lang: lang),
      premiumWidget: _PremiumPostsView(lang: lang),
    );
  }
}

class _FreePostsView extends StatelessWidget {
  final String lang;

  const _FreePostsView({required this.lang});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Posts')),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                'Posts Available on Paid Plans',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              FilledButton(
                onPressed: () => context.go('/v1/$lang/plans'),
                child: const Text('Upgrade to View Posts'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _PostsView extends ConsumerWidget {
  final String lang;

  const _PostsView({required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final postsAsync = ref.watch(feedProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Posts'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () => context.go('/v1/$lang/posts/create'),
          ),
        ],
      ),
      body: postsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
        data: (posts) => ListView.builder(
          padding: const EdgeInsets.all(8),
          itemCount: posts.length,
          itemBuilder: (_, i) => _PostCard(post: posts[i], lang: lang),
        ),
      ),
    );
  }
}

class _PremiumPostsView extends ConsumerWidget {
  final String lang;

  const _PremiumPostsView({required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return _PostsView(lang: lang);
  }
}

class _PostCard extends ConsumerWidget {
  final Post post;
  final String lang;

  const _PostCard({required this.post, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = AppColors.of(context);

    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: InkWell(
        onTap: () => context.go('/v1/$lang/posts/${post.id}'),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Avatar(name: post.authorName, radius: 16),
                  const SizedBox(width: 8),
                  Text(
                    post.authorName,
                    style: const TextStyle(fontWeight: FontWeight.w600),
                  ),
                  const Spacer(),
                  Text(
                    _timeAgo(post.createdAt),
                    style: TextStyle(color: colors.fgMuted, fontSize: 12),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                post.title,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 4),
              Text(post.content, maxLines: 3, overflow: TextOverflow.ellipsis),
              if (post.imageUrl != null) ...[
                const SizedBox(height: 8),
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Image.network(
                    post.imageUrl!,
                    height: 200,
                    width: double.infinity,
                    fit: BoxFit.cover,
                  ),
                ),
              ],
              const SizedBox(height: 8),
              Row(
                children: [
                  IconButton(
                    icon: Icon(
                      post.isLiked ? Icons.favorite : Icons.favorite_border,
                      color: post.isLiked ? colors.danger : null,
                    ),
                    onPressed: () =>
                        ref.read(postActionsProvider).toggleReaction(post.id),
                    iconSize: 20,
                  ),
                  Text(
                    '${post.likeCount}',
                    style: TextStyle(color: colors.fgMuted, fontSize: 12),
                  ),
                  const SizedBox(width: 16),
                  Icon(
                    Icons.chat_bubble_outline,
                    size: 20,
                    color: colors.fgMuted,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    '${post.commentCount}',
                    style: TextStyle(color: colors.fgMuted, fontSize: 12),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _timeAgo(DateTime date) {
    final diff = DateTime.now().difference(date);
    if (diff.inMinutes < 60) return '${diff.inMinutes}m';
    if (diff.inHours < 24) return '${diff.inHours}h';
    return '${diff.inDays}d';
  }
}
