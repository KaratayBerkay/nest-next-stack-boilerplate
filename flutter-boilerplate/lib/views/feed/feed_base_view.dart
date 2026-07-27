import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../api/client/posts/query.dart';
import '../../components/feed/feed_list_empty_state.dart';
import '../../components/feed/post_stats_sidebar.dart';
import '../../components/ui/page_info/page_info.dart';
import '../../components/ui/skeleton/skeleton.dart';
import '../../constants/page_info/feed.dart';
import '../../constants/theme.dart';
import '../../l10n/app_localizations.dart';
import '../../types/feed/post.dart';

class FeedBaseView extends ConsumerStatefulWidget {
  final String lang;
  final Widget Function(Post post) cardBuilder;
  final bool Function(Post post)? isOwnPost;
  final bool showSidebar;
  final bool showPageInfo;

  const FeedBaseView({
    super.key,
    required this.lang,
    required this.cardBuilder,
    this.isOwnPost,
    this.showSidebar = false,
    this.showPageInfo = false,
  });

  @override
  ConsumerState<FeedBaseView> createState() => _FeedBaseViewState();
}

class _FeedBaseViewState extends ConsumerState<FeedBaseView> {
  final ScrollController _scrollCtrl = ScrollController();
  final TextEditingController _searchCtrl = TextEditingController();
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _scrollCtrl.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollCtrl.removeListener(_onScroll);
    _scrollCtrl.dispose();
    _searchCtrl.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_searchQuery.isNotEmpty) return;
    if (_scrollCtrl.position.pixels >=
        _scrollCtrl.position.maxScrollExtent - 200) {
      ref.read(paginatedFeedProvider.notifier).loadMore();
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final t = AppLocalizations.of(context);

    final Widget content;
    if (_searchQuery.isNotEmpty) {
      final searchResults = ref.watch(feedSearchProvider(_searchQuery));
      content = searchResults.when(
        loading: _loadingSkeleton,
        error: (e, _) => FeedListEmptyState(
          onShare: () => context.push('/v1/${widget.lang}/share'),
        ),
        data: (posts) => _searchResultList(posts),
      );
    } else {
      final feedState = ref.watch(paginatedFeedProvider);
      content = _contentWidget(feedState, t, colors);
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 8),
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
                    onTap: () => context.push('/v1/${widget.lang}/share'),
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
                  if (widget.showPageInfo) ...[
                    const SizedBox(width: 8),
                    const PageInfoButton(content: feedPageInfo),
                  ],
                ],
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _searchCtrl,
                onChanged: (v) => setState(() => _searchQuery = v),
                decoration: InputDecoration(
                  hintText: t.feedSearchPlaceholder,
                  prefixIcon: const Icon(Icons.search, size: 18),
                  filled: true,
                  fillColor: colors.surfaceAlt,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: BorderSide.none,
                  ),
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 8,
                  ),
                  isDense: true,
                ),
              ),
              const SizedBox(height: 12),
            ],
          ),
        ),
        Expanded(
          child:
              widget.showSidebar ? _SidebarLayout(content: content) : content,
        ),
      ],
    );
  }

  Widget _searchResultList(List<Post> posts) {
    if (posts.isEmpty) {
      final t = AppLocalizations.of(context);
      final colors = AppColors.of(context);
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Text(
            t.feedNoPostsYet,
            style: TextStyle(color: colors.fgMuted),
          ),
        ),
      );
    }
    return ListView.builder(
      controller: _scrollCtrl,
      padding: const EdgeInsets.symmetric(vertical: 4),
      itemCount: posts.length,
      itemBuilder: (context, i) => widget.cardBuilder(posts[i]),
    );
  }

  Widget _loadingSkeleton() {
    return ListView(
      controller: _scrollCtrl,
      padding: const EdgeInsets.symmetric(vertical: 4),
      children: List.generate(
        5,
        (_) => const Padding(
          padding: EdgeInsets.symmetric(horizontal: 16, vertical: 6),
          child: SkeletonCard(),
        ),
      ),
    );
  }

  Widget _postList(List<Post> posts, bool isLoadingMore, bool hasMore) {
    return RefreshIndicator(
      onRefresh: () => ref.read(paginatedFeedProvider.notifier).refresh(),
      child: ListView.builder(
        controller: _scrollCtrl,
        padding: const EdgeInsets.symmetric(vertical: 4),
        itemCount: posts.length + (isLoadingMore || hasMore ? 1 : 0),
        itemBuilder: (context, i) {
          if (i == posts.length) {
            return _footerIndicator(isLoadingMore, hasMore);
          }
          final post = posts[i];
          final isOwn = widget.isOwnPost != null && widget.isOwnPost!(post);
          if (isOwn) {
            return Column(
              children: [
                Padding(
                  padding: const EdgeInsets.only(left: 16, top: 4),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.amber.shade100,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Text(
                          '👑 Your Post',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                widget.cardBuilder(post),
              ],
            );
          }
          return widget.cardBuilder(post);
        },
      ),
    );
  }

  Widget _footerIndicator(bool isLoadingMore, bool hasMore) {
    final t = AppLocalizations.of(context);
    final colors = AppColors.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 24),
      child: Center(
        child: isLoadingMore
            ? Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  SizedBox(
                    width: 14,
                    height: 14,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: colors.brand,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    t.feedLoadingMore,
                    style: TextStyle(fontSize: 12, color: colors.fgMuted),
                  ),
                ],
              )
            : Text(
                t.feedAllCaughtUp,
                style: TextStyle(fontSize: 12, color: colors.fgMuted),
              ),
      ),
    );
  }

  Widget _contentWidget(
    PaginatedFeedState feedState,
    AppLocalizations t,
    AppColors colors,
  ) {
    if (feedState.isInitialLoading) {
      return _loadingSkeleton();
    }
    if (feedState.error != null && feedState.posts.isEmpty) {
      return FeedListEmptyState(
        onShare: () => context.push('/v1/${widget.lang}/share'),
      );
    }
    if (feedState.posts.isEmpty) {
      return FeedListEmptyState(
        onShare: () => context.push('/v1/${widget.lang}/share'),
      );
    }
    return _postList(
      feedState.posts,
      feedState.isLoadingMore,
      feedState.hasMore,
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
