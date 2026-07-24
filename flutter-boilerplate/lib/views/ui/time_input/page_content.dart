import 'package:flutter/material.dart';
import '../../../components/ui/input/date_time_input.dart';

class TimeInputDemoPage extends StatelessWidget {
  final String lang;
  const TimeInputDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Time Input')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          Card(
            child: Padding(
              padding: EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Time Input',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: 12),
                  DateTimeInput(label: 'Select time'),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
