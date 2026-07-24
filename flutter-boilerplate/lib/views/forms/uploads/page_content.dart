import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../components/ui/avatar/avatar.dart';
import '../../../components/ui/button/button.dart';
import '../../../constants/theme.dart';
import '../../../l10n/app_localizations.dart';

class FormsUploadsPageContent extends ConsumerStatefulWidget {
  final String lang;

  const FormsUploadsPageContent({super.key, required this.lang});

  @override
  ConsumerState<FormsUploadsPageContent> createState() =>
      _FormsUploadsPageContentState();
}

class _FormsUploadsPageContentState
    extends ConsumerState<FormsUploadsPageContent> {
  final _uploadedDocs = <String>[];

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.formsUploadsPageTitle)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Avatar Upload',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 12),
                  Center(
                    child: Column(
                      children: [
                        const Avatar(name: 'User', radius: 36),
                        const SizedBox(height: 8),
                        Button(
                          variant: ButtonVariant.outline,
                          child: Text(t.formsUploadsUploadPhoto),
                          onPressed: () {},
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Document Upload',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      border: Border.all(color: colors.border),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Center(
                      child: Column(
                        children: [
                          Icon(
                            Icons.cloud_upload_outlined,
                            size: 32,
                            color: colors.fgMuted,
                          ),
                          const SizedBox(height: 8),
                          Text(t.formsUploadsDragDrop),
                          const SizedBox(height: 8),
                          Button(
                            variant: ButtonVariant.outline,
                            child: Text(t.formsUploadsBrowseFiles),
                            onPressed: () {},
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  ..._uploadedDocs.map(
                    (doc) => ListTile(
                      leading: Icon(Icons.description, color: colors.brand),
                      title: Text(doc),
                      trailing: IconButton(
                        icon: const Icon(Icons.delete_outline),
                        onPressed: () {
                          setState(() => _uploadedDocs.remove(doc));
                        },
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
