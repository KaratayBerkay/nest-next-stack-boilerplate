import 'package:flutter/material.dart';
import '../../../components/ui/input/input.dart';
import '../../../l10n/app_localizations.dart';
import 'constants.dart';
import 'filter_section.dart';
import 'use_filters_form.dart';

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
    final t = AppLocalizations.of(context);
    return ListenableBuilder(
      listenable: _formManager,
      builder: (context, _) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              t.formsFiltersHeading,
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            FilterSection(
              title: t.formsFiltersSearch,
              child: Input(
                label: t.formsFiltersSearch,
                hintText: t.formsFiltersSearchPlaceholder,
                prefixIcon: const Icon(Icons.search),
                controller: TextEditingController.fromValue(
                  TextEditingValue(text: state.search),
                ),
                onChanged: _formManager.updateSearch,
              ),
            ),
            const SizedBox(height: 12),
            FilterSection(
              title: t.formsFiltersCategory,
              child: DropdownButtonFormField<String>(
                initialValue: state.category,
                items: buildCategoryItems(t),
                onChanged: (v) => _formManager.updateCategory(v!),
                decoration: const InputDecoration(
                  border: OutlineInputBorder(),
                  isDense: true,
                ),
              ),
            ),
            const SizedBox(height: 12),
            FilterSection(
              title: t.formsFiltersSortBy,
              child: DropdownButtonFormField<String>(
                initialValue: state.sort,
                items: buildSortItems(t),
                onChanged: (v) => _formManager.updateSort(v!),
                decoration: const InputDecoration(
                  border: OutlineInputBorder(),
                  isDense: true,
                ),
              ),
            ),
            const SizedBox(height: 12),
            FilterSection(
              title: t.formsFiltersStatus,
              child: DropdownButtonFormField<String>(
                initialValue: state.status,
                items: buildStatusItems(t),
                onChanged: (v) => _formManager.updateStatus(v!),
                decoration: const InputDecoration(
                  border: OutlineInputBorder(),
                  isDense: true,
                ),
              ),
            ),
            const SizedBox(height: 12),
            FilterSection(
              title: t.formsFiltersTags,
              child: Wrap(
                spacing: 6,
                runSpacing: 6,
                children: tagOptions.map((tag) {
                  final selected = state.tags.contains(tag);
                  return FilterChip(
                    label: Text(
                      tag,
                      style: TextStyle(
                        fontSize: 12,
                        color: selected ? Colors.white : null,
                      ),
                    ),
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
                  child: Text(t.formsFiltersApply),
                ),
                const SizedBox(width: 8),
                OutlinedButton(
                  onPressed: _formManager.reset,
                  child: Text(t.formsCommonReset),
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
