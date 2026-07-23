import 'package:flutter/material.dart';

class ImageUpload extends StatelessWidget {
  final List<String> images;
  final void Function()? onPick;
  final void Function(int index)? onRemove;
  final int maxImages;

  const ImageUpload({
    super.key,
    required this.images,
    this.onPick,
    this.onRemove,
    this.maxImages = 5,
  });

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [
        ...List.generate(images.length, (i) {
          return Stack(
            children: [
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(6),
                  image: DecorationImage(
                    image: NetworkImage(images[i]),
                    fit: BoxFit.cover,
                  ),
                ),
              ),
              if (onRemove != null)
                Positioned(
                  top: 0,
                  right: 0,
                  child: InkWell(
                    onTap: () => onRemove!(i),
                    child: Container(
                      decoration: const BoxDecoration(
                        color: Colors.black54,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.close, size: 16, color: Colors.white),
                    ),
                  ),
                ),
            ],
          );
        }),
        if (images.length < maxImages)
          InkWell(
            onTap: onPick,
            child: Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(6),
                border: Border.all(color: Theme.of(context).dividerColor),
              ),
              child: const Icon(Icons.add, size: 24),
            ),
          ),
      ],
    );
  }
}
