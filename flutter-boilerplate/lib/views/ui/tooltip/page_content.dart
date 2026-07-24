import 'package:flutter/material.dart';
import '../../../components/ui/tooltip/tooltip.dart';
import '../../../l10n/app_localizations.dart';

class TooltipDemoPage extends StatelessWidget {
  final String lang;
  const TooltipDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.uiTooltipTitle)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          Text(
            'Tooltips',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          SizedBox(height: 12),
          Wrap(
            spacing: 24,
            runSpacing: 16,
            children: [
              TooltipWidget(message: 'Save', child: Icon(Icons.save, size: 32)),
              TooltipWidget(
                message: 'Delete',
                child: Icon(Icons.delete, size: 32),
              ),
              TooltipWidget(
                message: 'Settings',
                child: Icon(Icons.settings, size: 32),
              ),
              TooltipWidget(
                message: 'Notifications',
                child: Icon(Icons.notifications, size: 32),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
