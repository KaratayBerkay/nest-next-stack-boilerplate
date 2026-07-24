// ignore_for_file: prefer_const_constructors, prefer_const_literals_to_create_immutables

import 'package:flutter/material.dart';

import '../../../components/ui/accordion/accordion.dart';

class AccordionRichItemsPage extends StatelessWidget {
  final String lang;

  const AccordionRichItemsPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Rich Items')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text(
            'User Profiles',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 8),
          AccordionWidget(
            items: [
              AccordionItem(
                title: 'Sarah Johnson',
                icon: Icons.person,
                content: const Text(
                  'Sarah is a product designer with 5+ years of experience.',
                ),
              ),
              AccordionItem(
                title: 'Mike Chen',
                icon: Icons.person,
                content: const Text(
                  'Mike is a full-stack engineer specializing in React and Node.js.',
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          const Text(
            'With Badges',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 8),
          AccordionWidget(
            items: [
              AccordionItem(
                title: 'Notifications',
                content: const Text('You have 3 unread notifications.'),
              ),
              AccordionItem(
                title: 'Messages',
                content: const Text('You have 12 unread messages.'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
