import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class FriendSearchState {
  final TextEditingController controller;
  final String query;

  FriendSearchState({
    TextEditingController? controller,
    this.query = '',
  }) : controller = controller ?? TextEditingController();
}

class FriendSearchNotifier extends Notifier<FriendSearchState> {
  @override
  FriendSearchState build() => FriendSearchState();

  void onQueryChanged(String value) {
    state = FriendSearchState(
      controller: state.controller,
      query: value,
    );
  }
}

final friendSearchProvider =
    NotifierProvider<FriendSearchNotifier, FriendSearchState>(
  FriendSearchNotifier.new,
);
