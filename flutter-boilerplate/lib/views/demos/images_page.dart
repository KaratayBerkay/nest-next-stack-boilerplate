import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';

class ImagesDemoPage extends StatelessWidget {
  final String lang;
  const ImagesDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Images Demo')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const _SectionHeader('Local Asset'),
          const SizedBox(height: 8),
          Container(
            width: 200,
            height: 100,
            decoration: BoxDecoration(
              color: Colors.grey.shade200,
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Center(child: Icon(Icons.image, color: Colors.grey)),
          ),
          const SizedBox(height: 24),
          const _SectionHeader('Remote Image'),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: CachedNetworkImage(
              imageUrl: 'https://picsum.photos/seed/flutter/400/300',
              width: 400,
              height: 200,
              fit: BoxFit.cover,
              placeholder: (_, __) => const SizedBox(
                height: 200,
                child: Center(child: CircularProgressIndicator()),
              ),
              errorWidget: (_, __, ___) => const SizedBox(
                height: 200,
                child: Center(child: Text('Failed to load image')),
              ),
            ),
          ),
          const SizedBox(height: 24),
          const _SectionHeader('Responsive'),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: LayoutBuilder(
              builder: (context, constraints) {
                final w = constraints.maxWidth;
                return CachedNetworkImage(
                  imageUrl:
                      'https://picsum.photos/seed/responsive/${w.toInt()}/200',
                  width: w,
                  height: 200,
                  fit: BoxFit.cover,
                  placeholder: (_, __) => const SizedBox(
                    height: 200,
                    child: Center(child: CircularProgressIndicator()),
                  ),
                  errorWidget: (_, __, ___) => const SizedBox(
                    height: 200,
                    child: Center(child: Text('Failed to load image')),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String text;
  const _SectionHeader(this.text);

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      style: const TextStyle(
        fontSize: 13,
        fontWeight: FontWeight.w600,
        color: Colors.grey,
      ),
    );
  }
}
