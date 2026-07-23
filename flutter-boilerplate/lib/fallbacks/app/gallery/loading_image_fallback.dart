import 'package:flutter/material.dart';

import '../../shared/loading_text.dart';

class LoadingImageFallback extends StatelessWidget {
  const LoadingImageFallback({super.key});

  @override
  Widget build(BuildContext context) {
    return const LoadingTextFallback();
  }
}
