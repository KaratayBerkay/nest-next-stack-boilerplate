import 'package:flutter/material.dart';

class BoomPageContent extends StatelessWidget {
  final String lang;

  const BoomPageContent({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Error Trigger')),
      body: Center(
        child: FilledButton(
          onPressed: () {
            throw Exception('This is a test error from the Boom page!');
          },
          child: const Text('Trigger Error'),
        ),
      ),
    );
  }
}
