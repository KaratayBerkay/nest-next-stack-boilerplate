import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../api/client/posts/query.dart';
import '../../components/feed/post_stats_sidebar.dart';
import '../../components/ui/empty/empty.dart';
import '../../components/ui/spinner/spinner.dart';
import '../../constants/theme.dart';
import '../../l10n/app_localizations.dart';
import '../../types/feed/post.dart';

class FeedBaseView extends ConsumerWidget {
  final String lang;
  final Widget Function(List<Post> posts) builder;
  final bool showSidebar;
  final bool showPageInfo;

  const FeedBaseView({
    super.key,
    required this.lang,
    required this.builder,
    this.showSidebar = false,
    this.showPageInfo = false,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = AppColors.of(context);
    final t = AppLocalizations.of(context);
    final postsAsync = ref.watch(feedProvider);

    final content = _contentWidget(postsAsync, t);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 8),
              SizedBox(
                height: 32,
                child: TextField(
                  decoration: InputDecoration(
                    hintText: t.feedSearchPlaceholder,
                    prefixIcon:
                        Icon(Icons.search, size: 14, color: colors.fgMuted),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12),
                    isDense: true,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide(color: colors.border),
                    ),
                  ),
                  style: TextStyle(fontSize: 12, color: colors.fg),
                ),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Text(
                    t.feedFeed,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: colors.brand,
                    ),
                  ),
                  const Spacer(),
                  InkWell(
                    borderRadius: BorderRadius.circular(8),
                    onTap: () => context.push('/v1/$lang/share'),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: colors.brand,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        t.feedShare,
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w500,
                          color: colors.surface,
                        ),
                      ),
                    ),
                  ),
                  if (showPageInfo) ...[
                    const SizedBox(width: 8),
                    InkWell(
                      borderRadius: BorderRadius.circular(8),
                      onTap: () => _showPageInfo(context),
                      child: Icon(
                        Icons.info_outline,
                        size: 18,
                        color: colors.fgMuted,
                      ),
                    ),
                  ],
                ],
              ),
              const SizedBox(height: 12),
            ],
          ),
        ),
        Expanded(
          child: showSidebar ? _SidebarLayout(content: content) : content,
        ),
      ],
    );
  }

  Widget _contentWidget(AsyncValue<List<Post>> postsAsync, AppLocalizations t) {
    return postsAsync.when(
      loading: () => const Center(child: Spinner()),
      error: (err, _) => EmptyWidget(
        title: t.feedFailedToLoadPosts,
        icon: Icons.error_outline,
      ),
      data: (posts) {
        if (posts.isEmpty) {
          return EmptyWidget(
            title: t.feedNoPostsYet,
            icon: Icons.article_outlined,
          );
        }
        return builder(posts);
      },
    );
  }
}

class _SidebarLayout extends StatelessWidget {
  final Widget content;

  const _SidebarLayout({required this.content});

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    final isDesktop = width >= 768;

    if (isDesktop) {
      return Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(child: content),
          const SizedBox(width: 16),
          const SizedBox(
            width: 224,
            child: PostStatsSidebar(),
          ),
        ],
      );
    }

    return Column(
      children: [
        Expanded(child: content),
        const SizedBox(height: 16),
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 16),
          child: PostStatsSidebar(),
        ),
      ],
    );
  }
}

void _showPageInfo(BuildContext context) {
  showDialog<void>(
    context: context,
    builder: (ctx) => AlertDialog(
      title: Text(AppLocalizations.of(ctx).feedFeed),
      content: const Text('The feed displays posts from users you follow.'),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(ctx).pop(),
          child: const Text('Close'),
        ),
      ],
    ),
  );
}
