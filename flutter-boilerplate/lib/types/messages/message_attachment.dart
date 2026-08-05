class StorageEnvelope {
  final String v;
  final String nonce;
  final String ct;

  const StorageEnvelope({
    required this.v,
    required this.nonce,
    required this.ct,
  });

  factory StorageEnvelope.fromJson(Map<String, dynamic> json) {
    return StorageEnvelope(
      v: json['v'] as String,
      nonce: json['nonce'] as String,
      ct: json['ct'] as String,
    );
  }

  Map<String, dynamic> toJson() => {
        'v': v,
        'nonce': nonce,
        'ct': ct,
      };
}

class MessageAttachment {
  final String url;
  final String type;
  final String name;
  final StorageEnvelope? storageEnvelope;

  const MessageAttachment({
    required this.url,
    required this.type,
    required this.name,
    this.storageEnvelope,
  });

  factory MessageAttachment.fromJson(Map<String, dynamic> json) {
    return MessageAttachment(
      url: json['url'] as String,
      type: json['type'] as String,
      name: json['name'] as String,
      storageEnvelope: json['storageEnvelope'] == null
          ? null
          : StorageEnvelope.fromJson(
              json['storageEnvelope'] as Map<String, dynamic>,
            ),
    );
  }

  Map<String, dynamic> toJson() => {
        'url': url,
        'type': type,
        'name': name,
        if (storageEnvelope != null)
          'storageEnvelope': storageEnvelope!.toJson(),
      };
}
