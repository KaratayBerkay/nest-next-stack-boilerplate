import 'package:flutter/material.dart';

class InputGroupDemoPage extends StatelessWidget {
  final String lang;
  const InputGroupDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Input Group')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Input Group', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
                        decoration: BoxDecoration(
                          border: Border.all(color: Colors.grey),
                          borderRadius: const BorderRadius.horizontal(left: Radius.circular(8)),
                        ),
                        child: const Text('\$'),
                      ),
                      Expanded(
                        child: TextField(
                          decoration: InputDecoration(
                            border: const OutlineInputBorder(),
                            labelText: 'Amount',
                            contentPadding: const EdgeInsets.symmetric(horizontal: 12),
                          ),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
                        decoration: BoxDecoration(
                          border: Border.all(color: Colors.grey),
                          borderRadius: const BorderRadius.horizontal(right: Radius.circular(8)),
                        ),
                        child: const Text('USD'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
