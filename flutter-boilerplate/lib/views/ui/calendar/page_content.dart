import 'package:flutter/material.dart';
import '../../../components/ui/input/date_input.dart';
import '../../../l10n/app_localizations.dart';

class CalendarDemoPage extends StatelessWidget {
  final String lang;
  const CalendarDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.uiCalendarTitle)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          Card(
            child: Padding(
              padding: EdgeInsets.all(16),
              child: Column(
                children: [
                  Text(
                    'Date Input',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: 12),
                  DateInput(label: 'Select Date'),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
