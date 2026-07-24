import 'package:flutter/material.dart';

import '../../../l10n/app_localizations.dart';

List<DropdownMenuItem<String>> buildCategoryItems(AppLocalizations t) => [
      DropdownMenuItem(value: 'all', child: Text(t.formsFiltersAllCategories)),
      DropdownMenuItem(value: 'tech', child: Text(t.formsFiltersTechnology)),
      DropdownMenuItem(value: 'design', child: Text(t.formsFiltersDesign)),
      DropdownMenuItem(value: 'business', child: Text(t.formsFiltersBusiness)),
      DropdownMenuItem(
        value: 'marketing',
        child: Text(t.formsFiltersMarketing),
      ),
    ];

List<DropdownMenuItem<String>> buildSortItems(AppLocalizations t) => [
      DropdownMenuItem(value: 'newest', child: Text(t.formsFiltersNewestFirst)),
      DropdownMenuItem(value: 'oldest', child: Text(t.formsFiltersOldestFirst)),
      DropdownMenuItem(
        value: 'popular',
        child: Text(t.formsFiltersMostPopular),
      ),
      DropdownMenuItem(
        value: 'relevance',
        child: Text(t.formsFiltersRelevance),
      ),
    ];

List<DropdownMenuItem<String>> buildStatusItems(AppLocalizations t) => [
      DropdownMenuItem(value: 'all', child: Text(t.formsFiltersAllStatuses)),
      DropdownMenuItem(
        value: 'active',
        child: Text(t.formsFiltersStatusActive),
      ),
      DropdownMenuItem(
        value: 'pending',
        child: Text(t.formsFiltersStatusPending),
      ),
      DropdownMenuItem(
        value: 'archived',
        child: Text(t.formsFiltersStatusArchived),
      ),
    ];

const List<String> tagOptions = [
  'Flutter',
  'React',
  'Node.js',
  'Python',
  'Design',
  'API',
  'Database',
  'DevOps',
];
