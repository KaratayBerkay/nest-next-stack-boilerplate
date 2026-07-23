import 'package:flutter/material.dart';
import '../../../components/ui/pagination/pagination.dart';

class PaginationDemoPage extends StatelessWidget {
  final String lang;
  const PaginationDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Pagination')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text('Basic Pagination', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          PaginationWidget(currentPage: 1, totalPages: 10, onPageChanged: (_) {}),
          const SizedBox(height: 24),
          const Text('On Last Page', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          PaginationWidget(currentPage: 10, totalPages: 10, onPageChanged: (_) {}),
        ],
      ),
    );
  }
}
