// ignore_for_file: prefer_const_constructors, prefer_const_literals_to_create_immutables

import 'package:flutter/material.dart';

import '../../l10n/app_localizations.dart';

class LazyLoadingDemoPage extends StatefulWidget {
  final String lang;
  const LazyLoadingDemoPage({super.key, required this.lang});

  @override
  State<LazyLoadingDemoPage> createState() => _LazyLoadingDemoPageState();
}

class _LazyLoadingDemoPageState extends State<LazyLoadingDemoPage> {
  bool _loaded = false;

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.demoLazyLoadingPageTitle)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text(
            'Lazy Loading',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 8),
          const Text(
            'Tap the button below to lazily load a component.',
            style: TextStyle(fontSize: 13, color: Colors.grey),
          ),
          const SizedBox(height: 16),
          if (!_loaded)
            FilledButton.icon(
              onPressed: () => setState(() => _loaded = true),
              icon: const Icon(Icons.download),
              label: Text(t.demoLazyLoadingLoad),
            )
          else
            const _HeavyComponent(),
        ],
      ),
    );
  }
}

class _HeavyComponent extends StatelessWidget {
  const _HeavyComponent();

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            const Icon(Icons.check_circle, size: 48, color: Colors.green),
            const SizedBox(height: 8),
            const Text(
              'Heavy Component Loaded!',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 4),
            const Text(
              'This component was loaded on demand.',
              style: TextStyle(fontSize: 13, color: Colors.grey),
            ),
          ],
        ),
      ),
    );
  }
}
