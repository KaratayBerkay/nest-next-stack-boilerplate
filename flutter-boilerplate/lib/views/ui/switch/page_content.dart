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
        children: const [
          Card(
            child: Column(
              children: [
                SwitchWidget(value: true, label: 'Notifications'),
                Divider(height: 1),
                SwitchWidget(value: false, label: 'Dark Mode'),
                Divider(height: 1),
                SwitchWidget(value: true, label: 'Sound'),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
