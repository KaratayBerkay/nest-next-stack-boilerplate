import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../components/ui/form_text_field.dart';
import '../../../validators/forms/schema.dart' as forms;

class FormsFiltersPageContent extends ConsumerStatefulWidget {
  final String lang;

  const FormsFiltersPageContent({super.key, required this.lang});

  @override
  ConsumerState<FormsFiltersPageContent> createState() =>
      _FormsFiltersPageContentState();
}

class _FormsFiltersPageContentState
    extends ConsumerState<FormsFiltersPageContent> {
  final _formKey = GlobalKey<FormState>();
  String _category = 'all';
  String _sort = 'newest';
  final _searchCtrl = TextEditingController();

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Filters')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Filter Controls',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 12),
                    FormTextField(
                      controller: _searchCtrl,
                      label: 'Search',
                      prefixIcon: const Icon(Icons.search),
                      validator: (v) => forms.validateMinLength(v, 2, 'Search'),
                    ),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<String>(
                      initialValue: _category,
                      items: const [
                        DropdownMenuItem(
                          value: 'all',
                          child: Text('All Categories'),
                        ),
                        DropdownMenuItem(
                          value: 'tech',
                          child: Text('Technology'),
                        ),
                        DropdownMenuItem(
                          value: 'design',
                          child: Text('Design'),
                        ),
                        DropdownMenuItem(
                          value: 'business',
                          child: Text('Business'),
                        ),
                      ],
                      onChanged: (v) => setState(() => _category = v!),
                      decoration: const InputDecoration(
                        labelText: 'Category',
                        border: OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<String>(
                      initialValue: _sort,
                      items: const [
                        DropdownMenuItem(
                          value: 'newest',
                          child: Text('Newest First'),
                        ),
                        DropdownMenuItem(
                          value: 'oldest',
                          child: Text('Oldest First'),
                        ),
                        DropdownMenuItem(
                          value: 'popular',
                          child: Text('Most Popular'),
                        ),
                      ],
                      onChanged: (v) => setState(() => _sort = v!),
                      decoration: const InputDecoration(
                        labelText: 'Sort By',
                        border: OutlineInputBorder(),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
