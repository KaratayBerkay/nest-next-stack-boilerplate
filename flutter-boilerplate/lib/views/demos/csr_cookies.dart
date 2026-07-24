import 'package:flutter/material.dart';

class CsrCookiesDemo extends StatelessWidget {
  const CsrCookiesDemo({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('CSR Cookies')),
      body: const Center(
        child: Text('Client-side cookie handling with document.cookie'),
      ),
    );
  }
}
