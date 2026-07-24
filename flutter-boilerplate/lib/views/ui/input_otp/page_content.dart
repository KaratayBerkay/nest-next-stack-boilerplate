import 'package:flutter/material.dart';

import '../../../l10n/app_localizations.dart';

class InputOtpDemoPage extends StatefulWidget {
  final String lang;
  const InputOtpDemoPage({super.key, required this.lang});

  @override
  State<InputOtpDemoPage> createState() => _InputOtpDemoPageState();
}

class _InputOtpDemoPageState extends State<InputOtpDemoPage> {
  final _code = List.filled(6, '');

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.uiInputOtpTitle)),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                t.uiInputOtpEnterCode,
                style: const TextStyle(fontSize: 16),
              ),
              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(
                  6,
                  (i) => Container(
                    width: 48,
                    height: 56,
                    margin: const EdgeInsets.symmetric(horizontal: 4),
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.grey),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Center(
                      child: Text(
                        _code[i],
                        style: const TextStyle(fontSize: 24),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
