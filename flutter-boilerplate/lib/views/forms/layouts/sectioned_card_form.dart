import 'package:flutter/material.dart';

import 'personal_info_section.dart';
import 'address_section.dart';

class SectionedCardForm extends StatelessWidget {
  const SectionedCardForm({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Personal Information', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                const SizedBox(height: 8),
                const Row(
                  children: [
                    Expanded(child: TextField(decoration: InputDecoration(labelText: 'Full Name', border: OutlineInputBorder()))),
                    SizedBox(width: 12),
                    Expanded(child: TextField(decoration: InputDecoration(labelText: 'Phone', border: OutlineInputBorder()))),
                  ],
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 8),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Address', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                const SizedBox(height: 8),
                const TextField(decoration: InputDecoration(labelText: 'Street', border: OutlineInputBorder())),
                const SizedBox(height: 8),
                const Row(
                  children: [
                    Expanded(child: TextField(decoration: InputDecoration(labelText: 'City', border: OutlineInputBorder()))),
                    SizedBox(width: 12),
                    Expanded(child: TextField(decoration: InputDecoration(labelText: 'ZIP', border: OutlineInputBorder()))),
                  ],
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
