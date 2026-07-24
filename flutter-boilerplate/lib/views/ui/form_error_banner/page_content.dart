import 'package:flutter/material.dart';
import '../../../components/ui/alert/alert.dart';
import '../../../l10n/app_localizations.dart';

class FormErrorBannerDemoPage extends StatelessWidget {
  final String lang;
  const FormErrorBannerDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.uiFormErrorBannerTitle)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          AlertWidget(
            title: 'Please fix the following errors',
            message:
                '• Email is required\n• Password must be at least 8 characters',
            variant: AlertVariant.danger,
          ),
        ],
      ),
    );
  }
}
