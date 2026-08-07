import 'package:flutter/material.dart';

import '../../../components/ui/button/button.dart';
import '../../../components/ui/page_header/page_header.dart';

class PageHeaderDemoPage extends StatelessWidget {
  final String lang;

  const PageHeaderDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: const [
        Text(
          'Basic',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        SizedBox(height: 8),
        PageHeader(
          title: 'Dashboard',
          description: "Welcome back. Here's an overview of your account.",
        ),
        SizedBox(height: 24),
        Text(
          'With Actions',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        SizedBox(height: 8),
        PageHeader(
          title: 'Projects',
          description: "Manage your team's projects and workflows.",
          actions: Button(size: ButtonSize.sm, child: Text('New Project')),
        ),
        SizedBox(height: 24),
        Text(
          'As H2',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        SizedBox(height: 8),
        PageHeader(
          title: 'Section Title',
          description: 'A subsection heading using h2.',
          asH2: true,
        ),
      ],
    );
  }
}
