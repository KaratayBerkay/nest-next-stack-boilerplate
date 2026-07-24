// ignore_for_file: prefer_const_constructors, prefer_const_literals_to_create_immutables

import 'package:flutter/material.dart';

import '../../../components/ui/accordion/accordion.dart';

class AccordionVariantsPage extends StatelessWidget {
  final String lang;

  const AccordionVariantsPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Accordion Variants')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text(
            'Single State',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 8),
          const AccordionWidget(
            items: [
              AccordionItem(
                title: 'Single Section 1',
                content: Text('Content for section 1'),
              ),
              AccordionItem(
                title: 'Single Section 2',
                content: Text('Content for section 2'),
              ),
            ],
          ),
          const SizedBox(height: 24),
          const Text(
            'Multiple Open',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 8),
          const AccordionWidget(
            expandMultiple: true,
            items: [
              AccordionItem(
                title: 'Multi Section 1',
                content: Text('Content for section 1'),
              ),
              AccordionItem(
                title: 'Multi Section 2',
                content: Text('Content for section 2'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
