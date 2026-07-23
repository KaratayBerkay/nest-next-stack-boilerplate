class RouteParams {
  final Map<String, String> pathParams;
  final Map<String, String> queryParams;

  const RouteParams({
    this.pathParams = const {},
    this.queryParams = const {},
  });

  factory RouteParams.fromJson(Map<String, dynamic> json) {
    return RouteParams(
      pathParams: (json['pathParams'] as Map<String, dynamic>?)
              ?.map((k, v) => MapEntry(k, v as String)) ??
          {},
      queryParams: (json['queryParams'] as Map<String, dynamic>?)
              ?.map((k, v) => MapEntry(k, v as String)) ??
          {},
    );
  }

  Map<String, dynamic> toJson() => {
        'pathParams': pathParams,
        'queryParams': queryParams,
      };
}
