import 'package:flutter/material.dart';

import '../../../components/ui/input/input.dart';
import 'filter_section.dart';
import 'use_filters_form.dart';
import 'constants.dart';

class FiltersForm extends StatefulWidget {
  const FiltersForm({super.key});

  @override
  State<FiltersForm> createState() => _FiltersFormState();
}

class _FiltersFormState extends State<FiltersForm> {
  final _formManager = UseFiltersForm();

  @override
  void dispose() {
    _formManager.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = _formManager.state;
    return ListenableBuilder(
      listenable: _formManager,
      builder: (context, _) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Filter Controls', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            FilterSection(
              title: 'Search',
              child: Input(
                label: 'Search',
                hintText: 'Search items...',
                prefixIcon: const Icon(Icons.search),
                controller: TextEditingController.fromValue(TextEditingValue(text: state.search)),
                onChanged: _formManager.updateSearch,
              ),
            ),
            const SizedBox(height: 12),
            FilterSection(
              title: 'Category',
              child: DropdownButtonFormField<String>(
                value: state.category,
                items: categoryItems,
                onChanged: (v) => _formManager.updateCategory(v!),
                decoration: const InputDecoration(border: OutlineInputBorder(), isDense: true),
              ),
            ),
            const SizedBox(height: 12),
            FilterSection(
              title: 'Sort By',
              child: DropdownButtonFormField<String>(
                value: state.sort,
                items: sortItems,
                onChanged: (v) => _formManager.updateSort(v!),
                decoration: const InputDecoration(border: OutlineInputBorder(), isDense: true),
              ),
            ),
            const SizedBox(height: 12),
            FilterSection(
              title: 'Status',
              child: DropdownButtonFormField<String>(
                value: state.status,
                items: statusItems,
                onChanged: (v) => _formManager.updateStatus(v!),
                decoration: const InputDecoration(border: OutlineInputBorder(), isDense: true),
              ),
            ),
            const SizedBox(height: 12),
            FilterSection(
              title: 'Tags',
              child: Wrap(
                spacing: 6,
                runSpacing: 6,
                children: tagOptions.map((tag) {
                  final selected = state.tags.contains(tag);
                  return FilterChip(
                    label: Text(tag, style: TextStyle(fontSize: 12, color: selected ? Colors.white : null)),
                    selected: selected,
                    selectedColor: Colors.indigo,
                    checkmarkColor: Colors.white,
                    onSelected: (_) => _formManager.toggleTag(tag),
                  );
                }).toList(),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                FilledButton(
                  onPressed: () {},
                  child: const Text('Apply Filters'),
                ),
                const SizedBox(width: 8),
                OutlinedButton(
                  onPressed: _formManager.reset,
                  child: const Text('Reset'),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                'Query: ${state.toQuery()}',
                style: const TextStyle(fontSize: 11, fontFamily: 'monospace'),
              ),
            ),
          ],
        );
      },
    );
  }
}
