/// Server-side at-rest encryption metadata. `ct` (the ciphertext) is
/// deliberately never sent over the wire — it can be megabytes for large
/// uploads and would blow past the 64 KiB WS frame cap, and the client
/// never needs it: `GET /upload/serve` decrypts server-side. Mirrors
/// `next-js-boilerplate`'s `MessageAttachment-types.ts`, which likewise has
/// no `ct` field.
class StorageEnvelope {
  final String v;
  final String nonce;

  const StorageEnvelope({
    required this.v,
    required this.nonce,
  });

  factory StorageEnvelope.fromJson(Map<String, dynamic> json) {
    return StorageEnvelope(
      v: json['v'] as String,
      nonce: json['nonce'] as String,
    );
  }

  Map<String, dynamic> toJson() => {
        'v': v,
        'nonce': nonce,
      };
}

class MessageAttachment {
  final String url;
  final String type;
  final String name;
  final int size;
  final String? thumbnailUrl;
  final StorageEnvelope? storageEnvelope;

  const MessageAttachment({
    required this.url,
    required this.type,
    required this.name,
    this.size = 0,
    this.thumbnailUrl,
    this.storageEnvelope,
  });

  factory MessageAttachment.fromJson(Map<String, dynamic> json) {
    return MessageAttachment(
      url: json['url'] as String,
      type: json['type'] as String,
      name: json['name'] as String,
      size: json['size'] as int? ?? 0,
      thumbnailUrl: json['thumbnailUrl'] as String?,
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
        'size': size,
        if (thumbnailUrl != null) 'thumbnailUrl': thumbnailUrl,
        if (storageEnvelope != null)
          'storageEnvelope': storageEnvelope!.toJson(),
      };
}
