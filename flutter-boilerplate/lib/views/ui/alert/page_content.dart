import 'package:flutter/material.dart';
import '../../../components/ui/alert/alert.dart';

class AlertDemoPage extends StatelessWidget {
  final String lang;
  const AlertDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Alert')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          AlertWidget(
            title: 'Default Alert',
            message: 'This is a default alert message.',
          ),
          SizedBox(height: 8),
          AlertWidget(
            title: 'Success',
            message: 'Operation completed!',
            variant: AlertVariant.success,
          ),
          SizedBox(height: 8),
          AlertWidget(
            title: 'Warning',
            message: 'Please check your input.',
            variant: AlertVariant.warning,
          ),
          SizedBox(height: 8),
          AlertWidget(
            title: 'Error',
            message: 'Something went wrong.',
            variant: AlertVariant.danger,
          ),
        ],
      ),
    );
  }
}
