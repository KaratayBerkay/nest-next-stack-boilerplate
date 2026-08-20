/// Shared cursor-pagination state, backing the hand-rolled
/// `StateNotifier`-based paginated lists in this app (mirrors the shape of
/// `PaginatedFeedState` in api/client/posts/query.dart, generalized —
/// `hasMore` here is always the backend's own flag, never inferred from
/// page length).
class PaginatedListState<T> {
  final List<T> items;
  final bool hasMore;
  final bool isLoadingMore;
  final bool isInitialLoading;
  final String? error;

  const PaginatedListState({
    this.items = const [],
    this.hasMore = false,
    this.isLoadingMore = false,
    this.isInitialLoading = true,
    this.error,
  });

  PaginatedListState<T> copyWith({
    List<T>? items,
    bool? hasMore,
    bool? isLoadingMore,
    bool? isInitialLoading,
    String? error,
  }) {
    return PaginatedListState<T>(
      items: items ?? this.items,
      hasMore: hasMore ?? this.hasMore,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      isInitialLoading: isInitialLoading ?? this.isInitialLoading,
      error: error ?? this.error,
    );
  }
}
