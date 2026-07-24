import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';

import '../../l10n/app_localizations.dart';

class PhotoDetailPage extends StatelessWidget {
  final String id;

  const PhotoDetailPage({super.key, required this.id});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    final imageUrl = 'https://picsum.photos/seed/$id/800/600';

    return Scaffold(
      appBar: AppBar(title: Text(t.galleryPhoto(id))),
      body: Center(
        child: CachedNetworkImage(
          imageUrl: imageUrl,
          placeholder: (_, __) =>
              const Center(child: CircularProgressIndicator()),
          errorWidget: (_, __, ___) => const Icon(Icons.broken_image, size: 64),
          fit: BoxFit.contain,
        ),
      ),
    );
  }
}
