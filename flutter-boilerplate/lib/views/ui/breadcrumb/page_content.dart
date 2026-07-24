import 'package:flutter/material.dart';
import '../../../components/ui/breadcrumb/breadcrumb.dart';
import '../../../l10n/app_localizations.dart';

class BreadcrumbDemoPage extends StatelessWidget {
  final String lang;
  const BreadcrumbDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.uiBreadcrumbTitle)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          Text(
            'Basic Breadcrumb',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          SizedBox(height: 8),
          BreadcrumbWidget(
            items: [
              BreadcrumbItem(label: 'Home'),
              BreadcrumbItem(label: 'Products'),
              BreadcrumbItem(label: 'Details'),
            ],
          ),
          SizedBox(height: 24),
          Text(
            'With Icons',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          SizedBox(height: 8),
          BreadcrumbWidget(
            items: [
              BreadcrumbItem(label: 'Home'),
              BreadcrumbItem(label: 'Settings'),
              BreadcrumbItem(label: 'Profile'),
            ],
          ),
        ],
      ),
    );
  }
}
