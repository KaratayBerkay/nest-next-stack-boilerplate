import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';

import '../../../constants/theme.dart';
import '../../../lib/initials.dart';

class Avatar extends StatelessWidget {
  final String? imageUrl;
  final String name;
  final double radius;
  final VoidCallback? onTap;

  const Avatar({
    super.key,
    this.imageUrl,
    required this.name,
    this.radius = 20,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final initials = getInitials(name);

    final circle = CircleAvatar(
      radius: radius,
      backgroundColor: colors.brand.withValues(alpha: 0.15),
      backgroundImage: imageUrl != null
          ? CachedNetworkImageProvider(imageUrl!)
          : null,
      child: imageUrl == null
          ? Text(
              initials,
              style: TextStyle(
                color: colors.brand,
                fontWeight: FontWeight.w600,
                fontSize: radius * 0.7,
              ),
            )
          : null,
    );

    if (onTap != null) {
      return InkWell(
        borderRadius: BorderRadius.circular(radius),
        onTap: onTap,
        child: circle,
      );
    }
    return circle;
  }
}

class AvatarGroup extends StatelessWidget {
  final List<Avatar> avatars;
  final double overlap;

  const AvatarGroup({
    super.key,
    required this.avatars,
    this.overlap = 8,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(avatars.length, (i) {
        return Transform.translate(
          offset: Offset(-(i * overlap), 0),
          child: avatars[i],
        );
      }),
    );
  }
}
