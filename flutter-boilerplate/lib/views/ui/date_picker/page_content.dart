import 'package:flutter/material.dart';
import '../../../components/ui/input/date_input.dart';
import '../../../components/ui/input/date_time_input.dart';

class DatePickerDemoPage extends StatelessWidget {
  final String lang;
  const DatePickerDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Date Picker')),
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
                    'Date Input',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: 12),
                  DateInput(label: 'Pick a date'),
                  SizedBox(height: 16),
                  Text(
                    'Date & Time Input',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: 12),
                  DateTimeInput(label: 'Pick date & time'),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
