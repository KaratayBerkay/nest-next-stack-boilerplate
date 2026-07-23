import 'package:flutter/material.dart';
import '../../../components/ui/sheet/sheet.dart';
import '../../../components/ui/button/button.dart';

class SheetDemoPage extends StatelessWidget {
  final String lang;
  const SheetDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Sheet')),
      body: Center(
        child: Button(
          child: const Text('Open Sheet'),
          onPressed: () => showModalBottomSheet<bool>(
            context: context,
            builder: (_) => const SheetWidget(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  ListTile(title: Text('Option 1')),
                  ListTile(title: Text('Option 2')),
                  ListTile(title: Text('Option 3')),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
