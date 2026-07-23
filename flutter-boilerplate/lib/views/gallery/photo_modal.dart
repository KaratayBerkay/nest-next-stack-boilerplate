import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';

class PhotoModal extends StatelessWidget {
  final String id;

  const PhotoModal({super.key, required this.id});

  @override
  Widget build(BuildContext context) {
    final imageUrl = 'https://picsum.photos/seed/$id/800/600';

    return Dialog(
      insetPadding: const EdgeInsets.all(24),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: CachedNetworkImage(
          imageUrl: imageUrl,
          placeholder: (_, __) => const AspectRatio(
            aspectRatio: 4 / 3,
            child: Center(child: CircularProgressIndicator()),
          ),
          errorWidget: (_, __, ___) => const AspectRatio(
            aspectRatio: 4 / 3,
            child: Center(child: Icon(Icons.broken_image, size: 64)),
          ),
          fit: BoxFit.contain,
        ),
      ),
    );
  }
}
