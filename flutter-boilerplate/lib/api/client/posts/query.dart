import 'package:flutter_boilerplate/lib/riverpod_compat.dart';
import 'package:flutter_boilerplate/types/feed/comment.dart';
import 'package:flutter_boilerplate/types/feed/post.dart';

import '../../server/posts/comments.dart';
import '../../server/posts/list.dart';
import '../../server/posts/single.dart';
import '../../server/posts/stats.dart';
import '../../server/posts/who_reacted.dart';

const pageSize = 5;

class PaginatedFeedState {
  final List<Post> posts;
  final String? cursor;
  final bool hasMore;
  final bool isLoadingMore;
  final bool isInitialLoading;
  final String? error;

  const PaginatedFeedState({
    this.posts = const [],
    this.cursor,
    this.hasMore = true,
    this.isLoadingMore = false,
    this.isInitialLoading = true,
    this.error,
  });

  PaginatedFeedState copyWith({
    List<Post>? posts,
    String? cursor,
    bool? hasMore,
    bool? isLoadingMore,
    bool? isInitialLoading,
    String? error,
  }) {
    return PaginatedFeedState(
      posts: posts ?? this.posts,
      cursor: cursor ?? this.cursor,
      hasMore: hasMore ?? this.hasMore,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      isInitialLoading: isInitialLoading ?? this.isInitialLoading,
      error: error ?? this.error,
    );
  }
}

final paginatedFeedProvider =
    StateNotifierProvider<PaginatedFeedNotifier, PaginatedFeedState>((ref) {
  return PaginatedFeedNotifier(ref.read(feedListServerProvider));
});

class PaginatedFeedNotifier extends StateNotifier<PaginatedFeedState> {
  final FeedListServer _server;

  PaginatedFeedNotifier(this._server) : super(const PaginatedFeedState()) {
    _initialLoad();
  }

  Future<void> _initialLoad() async {
    state = const PaginatedFeedState();
    try {
      final posts = await _server.call(take: pageSize);
      final hasMore = posts.length >= pageSize;
      final cursor = posts.isNotEmpty ? posts.last.id : null;
      state = PaginatedFeedState(
        posts: posts,
        cursor: hasMore ? cursor : null,
        hasMore: hasMore,
        isInitialLoading: false,
      );
    } catch (e) {
      state = PaginatedFeedState(
        error: e.toString(),
        isInitialLoading: false,
      );
    }
  }

  Future<void> loadMore() async {
    if (state.isLoadingMore || !state.hasMore || state.cursor == null) return;
    state = state.copyWith(isLoadingMore: true);
    try {
      final nextPosts =
          await _server.call(cursor: state.cursor, take: pageSize);
      final combined = [...state.posts, ...nextPosts];
      final hasMore = nextPosts.length >= pageSize;
      final cursor = nextPosts.isNotEmpty ? nextPosts.last.id : null;
      state = PaginatedFeedState(
        posts: combined,
        cursor: hasMore ? cursor : null,
        hasMore: hasMore,
        isInitialLoading: false,
      );
    } catch (e) {
      state = state.copyWith(isLoadingMore: false, error: e.toString());
    }
  }

  Future<void> refresh() async {
    state = const PaginatedFeedState();
    try {
      final posts = await _server.call(take: pageSize);
      final hasMore = posts.length >= pageSize;
      final cursor = posts.isNotEmpty ? posts.last.id : null;
      state = PaginatedFeedState(
        posts: posts,
        cursor: hasMore ? cursor : null,
        hasMore: hasMore,
        isInitialLoading: false,
      );
    } catch (e) {
      state = PaginatedFeedState(
        error: e.toString(),
        isInitialLoading: false,
      );
    }
  }
}

final feedProvider = FutureProvider<List<Post>>((ref) async {
  final server = ref.read(feedListServerProvider);
  return server.call();
});

final feedSearchProvider =
    FutureProvider.family<List<Post>, String>((ref, String query) async {
  final server = ref.read(feedListServerProvider);
  return server.call(search: query.isEmpty ? null : query);
});

final postProvider =
    FutureProvider.family<Post, String>((ref, String postId) async {
  final server = ref.read(postSingleServerProvider);
  return server.call(postId);
});

final postCommentsProvider =
    FutureProvider.family<List<Comment>, String>((ref, String postId) async {
  final server = ref.read(postCommentsServerProvider);
  return server.list(postId);
});

final postStatsProvider = FutureProvider((ref) async {
  final server = ref.read(postStatsServerProvider);
  return server.call();
});

final whoReactedProvider =
    FutureProvider.family<List<Reactor>, String>((ref, String postId) async {
  final server = ref.read(whoReactedServerProvider);
  return server.call(postId);
});
