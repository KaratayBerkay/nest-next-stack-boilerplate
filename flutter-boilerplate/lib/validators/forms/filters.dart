class FiltersValidator {
  static String? validateSortBy(String? value) {
    if (value == null || value.isEmpty) return null;
    if (!['relevance', 'date', 'name'].contains(value)) return 'Invalid sort option';
    return null;
  }

  static String? validateSortOrder(String? value) {
    if (value == null || value.isEmpty) return null;
    if (!['asc', 'desc'].contains(value)) return 'Invalid sort order';
    return null;
  }

  static String? validateStatus(String? value) {
    return null;
  }

  static String? validatePageSize(String? value) {
    if (value == null || value.isEmpty) return null;
    if (!['10', '25', '50'].contains(value)) return 'Invalid page size';
    return null;
  }
}
