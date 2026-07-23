import 'package:flutter/material.dart';

class FiltersFormState {
  String search;
  String category;
  String sort;
  String status;
  List<String> tags;

  FiltersFormState({
    this.search = '',
    this.category = 'all',
    this.sort = 'newest',
    this.status = 'all',
    this.tags = const [],
  });

  FiltersFormState copyWith({
    String? search,
    String? category,
    String? sort,
    String? status,
    List<String>? tags,
  }) {
    return FiltersFormState(
      search: search ?? this.search,
      category: category ?? this.category,
      sort: sort ?? this.sort,
      status: status ?? this.status,
      tags: tags ?? this.tags,
    );
  }

  Map<String, dynamic> toQuery() {
    return {
      if (search.isNotEmpty) 'q': search,
      if (category != 'all') 'category': category,
      'sort': sort,
      if (status != 'all') 'status': status,
      if (tags.isNotEmpty) 'tags': tags.join(','),
    };
  }
}

class UseFiltersForm extends ChangeNotifier {
  FiltersFormState _state = FiltersFormState();

  FiltersFormState get state => _state;

  void updateSearch(String value) {
    _state = _state.copyWith(search: value);
    notifyListeners();
  }

  void updateCategory(String value) {
    _state = _state.copyWith(category: value);
    notifyListeners();
  }

  void updateSort(String value) {
    _state = _state.copyWith(sort: value);
    notifyListeners();
  }

  void updateStatus(String value) {
    _state = _state.copyWith(status: value);
    notifyListeners();
  }

  void toggleTag(String tag) {
    final tags = List<String>.from(_state.tags);
    if (tags.contains(tag)) {
      tags.remove(tag);
    } else {
      tags.add(tag);
    }
    _state = _state.copyWith(tags: tags);
    notifyListeners();
  }

  void reset() {
    _state = FiltersFormState();
    notifyListeners();
  }
}
