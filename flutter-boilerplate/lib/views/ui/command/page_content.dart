import 'package:flutter/material.dart';
import '../../../components/ui/command/command.dart';

class CommandDemoPage extends StatelessWidget {
  final String lang;
  const CommandDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Command')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          Text('Command Menu', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          SizedBox(height: 8),
          SizedBox(
            height: 300,
            child: CommandWidget(
              items: [
                CommandItem(icon: Icons.search, label: 'Search'),
                CommandItem(icon: Icons.file_copy, label: 'New File'),
                CommandItem(icon: Icons.folder_open, label: 'Open Folder'),
                CommandItem(icon: Icons.save, label: 'Save'),
                CommandItem(icon: Icons.settings, label: 'Settings'),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
