class LibraryItem {
  final String id;
  final String name;
  final String type;
  final String version;
  final String? description;
  final String? repository;
  final bool isInternal;

  const LibraryItem({
    required this.id,
    required this.name,
    required this.type,
    required this.version,
    this.description,
    this.repository,
    this.isInternal = false,
  });

  factory LibraryItem.fromJson(Map<String, dynamic> json) {
    return LibraryItem(
      id: json['id'] as String,
      name: json['name'] as String,
      type: json['type'] as String,
      version: json['version'] as String,
      description: json['description'] as String?,
      repository: json['repository'] as String?,
      isInternal: json['isInternal'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'type': type,
        'version': version,
        'description': description,
        'repository': repository,
        'isInternal': isInternal,
      };
}
