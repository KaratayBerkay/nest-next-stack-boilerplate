import 'package:flutter/material.dart';

import '../../shared/loading_text.dart';

class LoadingPhotoFallback extends StatelessWidget {
  const LoadingPhotoFallback({super.key});

  @override
  Widget build(BuildContext context) {
    return const LoadingTextFallback(text: 'Loading photo...');
  }
}
