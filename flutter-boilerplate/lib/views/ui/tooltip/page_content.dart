import 'package:flutter/material.dart';
import '../../../components/ui/tooltip/tooltip.dart';

class TooltipDemoPage extends StatelessWidget {
  final String lang;
  const TooltipDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Tooltip')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text('Tooltips', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          const Wrap(
            spacing: 24,
            runSpacing: 16,
            children: [
              TooltipWidget(message: 'Save', child: Icon(Icons.save, size: 32)),
              TooltipWidget(message: 'Delete', child: Icon(Icons.delete, size: 32)),
              TooltipWidget(message: 'Settings', child: Icon(Icons.settings, size: 32)),
              TooltipWidget(message: 'Notifications', child: Icon(Icons.notifications, size: 32)),
            ],
          ),
        ],
      ),
    );
  }
}
