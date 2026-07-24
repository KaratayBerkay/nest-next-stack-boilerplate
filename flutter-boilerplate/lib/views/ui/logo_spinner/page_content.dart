import 'package:flutter/material.dart';
import '../../../components/ui/logo_spinner/logo_spinner.dart';
import '../../../l10n/app_localizations.dart';

class LogoSpinnerDemoPage extends StatelessWidget {
  final String lang;
  const LogoSpinnerDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.uiLogoSpinnerTitle)),
      body: const LogoSpinner(),
    );
  }
}
