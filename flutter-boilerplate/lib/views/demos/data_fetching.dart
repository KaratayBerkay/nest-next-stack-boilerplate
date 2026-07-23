import 'package:flutter/material.dart';

class DataFetchingDemo extends StatelessWidget {
  const DataFetchingDemo({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Data Fetching')),
      body: const Center(
        child: Text('Data fetching patterns and best practices'),
      ),
    );
  }
}