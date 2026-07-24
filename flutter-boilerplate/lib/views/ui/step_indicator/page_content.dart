import 'package:flutter/material.dart';
import '../../../l10n/app_localizations.dart';

class StepIndicatorDemoPage extends StatelessWidget {
  final String lang;
  const StepIndicatorDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.uiStepIndicatorTitle)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Stepper(
            currentStep: 1,
            steps: const [
              Step(title: Text('Step 1'), content: Text('Details')),
              Step(title: Text('Step 2'), content: Text('Payment')),
              Step(title: Text('Step 3'), content: Text('Confirmation')),
            ],
          ),
        ],
      ),
    );
  }
}
