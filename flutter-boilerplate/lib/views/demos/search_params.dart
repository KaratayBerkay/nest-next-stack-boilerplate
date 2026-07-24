import 'package:flutter/material.dart';

import '../../l10n/app_localizations.dart';

class SearchParamsDemo extends StatelessWidget {
  const SearchParamsDemo({super.key});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.demoSearchParamsTitle)),
      body: Center(
        child: Text(t.demoSearchParamsDescription),
      ),
    );
  }
}
