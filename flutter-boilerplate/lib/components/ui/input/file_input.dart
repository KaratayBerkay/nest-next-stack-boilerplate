import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';

class FileInput extends StatelessWidget {
  final String? label;
  final void Function(PlatformFile)? onFilePicked;
  final List<String>? allowedExtensions;

  const FileInput({
    super.key,
    this.label,
    this.onFilePicked,
    this.allowedExtensions,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () async {
        final result = await FilePicker.pickFiles(
          type: FileType.custom,
          allowedExtensions: allowedExtensions ?? ['pdf', 'doc', 'docx', 'txt'],
        );
        if (result != null && result.files.isNotEmpty) {
          onFilePicked?.call(result.files.first);
        }
      },
      child: InputDecorator(
        decoration: InputDecoration(
          labelText: label ?? 'Upload file',
          suffixIcon: const Icon(Icons.upload_file),
        ),
        child: const Text('Tap to select file'),
      ),
    );
  }
}
