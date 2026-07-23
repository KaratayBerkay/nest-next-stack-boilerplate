import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../api/client/profile/actions.dart';
import '../../../api/server/profile/get.dart';
import '../../../components/ui/avatar/avatar.dart';
import '../../../components/ui/button/button.dart';
import '../../../components/ui/toast/toast.dart';
import '../../../constants/theme.dart';
import '../../../hooks/use_auth.dart';

final _profileProvider = FutureProvider((ref) async {
  final server = ref.read(profileGetServerProvider);
  return server.call();
});

class SettingsAccountPageContent extends ConsumerWidget {
  final String lang;

  const SettingsAccountPageContent({super.key, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = AppColors.of(context);
    final profileAsync = ref.watch(_profileProvider);
    final user = ref.watch(currentUserProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Account')),
      body: profileAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
        data: (profile) => _AccountForm(profile: profile, user: user, colors: colors, ref: ref),
      ),
    );
  }
}

class _AccountForm extends StatefulWidget {
  final dynamic profile;
  final dynamic user;
  final AppColors colors;
  final WidgetRef ref;

  const _AccountForm({required this.profile, required this.user, required this.colors, required this.ref});

  @override
  State<_AccountForm> createState() => _AccountFormState();
}

class _AccountFormState extends State<_AccountForm> {
  late TextEditingController _nameCtrl;
  late TextEditingController _bioCtrl;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _nameCtrl = TextEditingController(text: widget.profile.name as String? ?? '');
    _bioCtrl = TextEditingController(text: widget.profile.bio as String? ?? '');
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _bioCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    setState(() => _saving = true);
    try {
      await widget.ref.read(profileActionsProvider).update(
        name: _nameCtrl.text,
        bio: _bioCtrl.text,
      );
      if (mounted) showToast(context, 'Profile updated');
    } catch (e) {
      if (mounted) showToast(context, 'Failed: $e');
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Center(
          child: Column(
            children: [
              Avatar(name: widget.profile.name as String? ?? 'U', radius: 32),
              const SizedBox(height: 12),
              Text(widget.profile.name as String? ?? 'User',
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),),
              Text(widget.profile.email as String? ?? '',
                  style: TextStyle(color: widget.colors.fgMuted),),
            ],
          ),
        ),
        const SizedBox(height: 24),
        TextField(
          controller: _nameCtrl,
          decoration: const InputDecoration(labelText: 'Display Name'),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: _bioCtrl,
          decoration: const InputDecoration(labelText: 'Bio'),
          maxLines: 3,
        ),
        const SizedBox(height: 24),
        Button(
          onPressed: _saving ? null : _save,
          child: Text(_saving ? 'Saving...' : 'Save Changes'),
        ),
      ],
    );
  }
}
