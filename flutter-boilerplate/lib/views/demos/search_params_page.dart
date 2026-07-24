import 'package:flutter/material.dart';

class SearchParamsDemoPage extends StatefulWidget {
  final String lang;
  const SearchParamsDemoPage({super.key, required this.lang});

  @override
  State<SearchParamsDemoPage> createState() => _SearchParamsDemoPageState();
}

class _SearchParamsDemoPageState extends State<SearchParamsDemoPage> {
  String _name = 'unknown';
  String _category = 'none';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Search Params')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text(
            'Search Params Demo',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 8),
          const Text(
            'Simulates query parameter handling with local state.',
            style: TextStyle(fontSize: 13, color: Colors.grey),
          ),
          const SizedBox(height: 16),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Current Params',
                    style: TextStyle(fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 8),
                  Text('name = $_name'),
                  Text('category = $_category'),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            'Presets',
            style: TextStyle(fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              _presetChip('Alice / Books', 'alice', 'books'),
              const SizedBox(width: 8),
              _presetChip('Bob / Games', 'bob', 'games'),
            ],
          ),
          const SizedBox(height: 24),
          const Text(
            'Manual Input',
            style: TextStyle(fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 8),
          TextField(
            decoration: const InputDecoration(
              labelText: 'Name',
              border: OutlineInputBorder(),
            ),
            onChanged: (v) => setState(() => _name = v.isEmpty ? 'unknown' : v),
          ),
          const SizedBox(height: 12),
          TextField(
            decoration: const InputDecoration(
              labelText: 'Category',
              border: OutlineInputBorder(),
            ),
            onChanged: (v) =>
                setState(() => _category = v.isEmpty ? 'none' : v),
          ),
        ],
      ),
    );
  }

  Widget _presetChip(String label, String name, String category) {
    return ActionChip(
      label: Text(label, style: const TextStyle(fontSize: 12)),
      onPressed: () => setState(() {
        _name = name;
        _category = category;
      }),
    );
  }
}
