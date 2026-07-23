import 'package:flutter/material.dart';

class FileUploadSections extends StatelessWidget {
  const FileUploadSections({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _UploadTile(
          icon: Icons.cloud_upload_outlined,
          label: 'Upload File',
          subtitle: 'PDF, DOC, or TXT up to 10MB',
        ),
        const SizedBox(height: 8),
        _UploadTile(
          icon: Icons.image_outlined,
          label: 'Upload Image',
          subtitle: 'PNG, JPG, or WebP up to 5MB',
        ),
        const SizedBox(height: 8),
        _UploadTile(
          icon: Icons.folder_outlined,
          label: 'Upload Folder',
          subtitle: 'Multiple files supported',
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _FileChip(name: 'report.pdf', size: '2.4 MB'),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _FileChip(name: 'photo.jpg', size: '1.1 MB'),
            ),
          ],
        ),
      ],
    );
  }
}

class _UploadTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final String subtitle;

  const _UploadTile({
    required this.icon,
    required this.label,
    required this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () {},
      borderRadius: BorderRadius.circular(8),
      child: Container(
        decoration: BoxDecoration(
          border: Border.all(color: Colors.grey.shade300),
          borderRadius: BorderRadius.circular(8),
        ),
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            Icon(icon, size: 24, color: Colors.grey.shade600),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label, style: const TextStyle(fontWeight: FontWeight.w500)),
                  Text(subtitle, style: TextStyle(fontSize: 12, color: Colors.grey.shade500)),
                ],
              ),
            ),
            const Icon(Icons.upload_file, size: 20),
          ],
        ),
      ),
    );
  }
}

class _FileChip extends StatelessWidget {
  final String name;
  final String size;

  const _FileChip({required this.name, required this.size});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.grey.shade100,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        children: [
          const Icon(Icons.insert_drive_file, size: 16),
          const SizedBox(width: 6),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500), overflow: TextOverflow.ellipsis),
                Text(size, style: TextStyle(fontSize: 10, color: Colors.grey.shade500)),
              ],
            ),
          ),
          Icon(Icons.close, size: 14, color: Colors.grey.shade500),
        ],
      ),
    );
  }
}
