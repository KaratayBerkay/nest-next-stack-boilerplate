import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class GalleryPage extends StatelessWidget {
  const GalleryPage({super.key});

  static const _images = [
    'https://picsum.photos/seed/1/400/300',
    'https://picsum.photos/seed/2/400/300',
    'https://picsum.photos/seed/3/400/300',
    'https://picsum.photos/seed/4/400/300',
    'https://picsum.photos/seed/5/400/300',
    'https://picsum.photos/seed/6/400/300',
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Gallery')),
      body: GridView.builder(
        padding: const EdgeInsets.all(8),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 3,
          crossAxisSpacing: 8,
          mainAxisSpacing: 8,
        ),
        itemCount: _images.length,
        itemBuilder: (_, i) => GestureDetector(
          onTap: () => context.push('/gallery/${i + 1}'),
          child: Container(
            decoration: BoxDecoration(
              color: Colors.grey[300],
              borderRadius: BorderRadius.circular(8),
            ),
            child: Center(
              child: Text(
                '${i + 1}',
                style: const TextStyle(fontSize: 24, color: Colors.white),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
