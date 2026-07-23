import 'package:flutter/material.dart';
import '../../../components/ui/switch/switch.dart';

class SwitchDemoPage extends StatelessWidget {
  final String lang;
  const SwitchDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Switch')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Column(
              children: [
                const SwitchWidget(value: true, label: 'Notifications'),
                const Divider(height: 1),
                const SwitchWidget(value: false, label: 'Dark Mode'),
                const Divider(height: 1),
                const SwitchWidget(value: true, label: 'Sound'),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
