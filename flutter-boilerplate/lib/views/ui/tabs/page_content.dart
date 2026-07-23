import 'package:flutter/material.dart';
import '../../../components/ui/tabs/tabs.dart';

class TabsDemoPage extends StatelessWidget {
  final String lang;
  const TabsDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Tabs')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text('Basic Tabs', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          SizedBox(
            height: 200,
            child: TabsWidget(
              tabs: const [Tab(text: 'Tab 1'), Tab(text: 'Tab 2'), Tab(text: 'Tab 3')],
              children: [
                const Center(child: Text('Tab 1 Content')),
                const Center(child: Text('Tab 2 Content')),
                const Center(child: Text('Tab 3 Content')),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
