import 'package:flutter/material.dart';

class SearchParamsDemo extends StatelessWidget {
  const SearchParamsDemo({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Search Params')),
      body: const Center(
        child: Text('URL search parameters and query string handling'),
      ),
    );
  }
}