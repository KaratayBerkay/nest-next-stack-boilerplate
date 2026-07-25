import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../components/ui/form_text_field.dart';
import '../../../l10n/app_localizations.dart';
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
    final t = AppLocalizations.of(context);
    return ListView(
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
                    items: [
                      DropdownMenuItem(
                        value: 'all',
                        child: Text(t.formsFiltersAllCategories),
                      ),
                      DropdownMenuItem(
                        value: 'tech',
                        child: Text(t.formsFiltersTechnology),
                      ),
                      DropdownMenuItem(
                        value: 'design',
                        child: Text(t.formsFiltersDesign),
                      ),
                      DropdownMenuItem(
                        value: 'business',
                        child: Text(t.formsFiltersBusiness),
                      ),
                    ],
                    onChanged: (v) => setState(() => _category = v!),
                    decoration: InputDecoration(
                      labelText: t.formsFiltersCategory,
                      border: const OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 8),
                  DropdownButtonFormField<String>(
                    initialValue: _sort,
                    items: [
                      DropdownMenuItem(
                        value: 'newest',
                        child: Text(t.formsFiltersNewestFirst),
                      ),
                      DropdownMenuItem(
                        value: 'oldest',
                        child: Text(t.formsFiltersOldestFirst),
                      ),
                      DropdownMenuItem(
                        value: 'popular',
                        child: Text(t.formsFiltersMostPopular),
                      ),
                    ],
                    onChanged: (v) => setState(() => _sort = v!),
                    decoration: InputDecoration(
                      labelText: t.formsFiltersSortBy,
                      border: const OutlineInputBorder(),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}
