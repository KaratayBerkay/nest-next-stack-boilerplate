import 'package:flutter/material.dart';
import '../../../components/ui/logo_spinner/logo_spinner.dart';

class LogoSpinnerDemoPage extends StatelessWidget {
  final String lang;
  const LogoSpinnerDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Logo Spinner')),
      body: const LogoSpinner(),
    );
  }
}
