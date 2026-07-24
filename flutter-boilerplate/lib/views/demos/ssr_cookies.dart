import 'package:flutter/material.dart';

class SsrCookiesDemo extends StatelessWidget {
  const SsrCookiesDemo({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('SSR Cookies')),
      body: const Center(
        child: Text('Server-side cookie reading and setting'),
      ),
    );
  }
}
