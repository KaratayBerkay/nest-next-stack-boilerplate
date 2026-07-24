import 'package:flutter/material.dart';
import '../../../components/ui/input/file_input.dart';

class FileUploadDemoPage extends StatelessWidget {
  final String lang;
  const FileUploadDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('File Upload')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          Card(
            child: Padding(
              padding: EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'File Input',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: 12),
                  FileInput(label: 'Upload File'),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
