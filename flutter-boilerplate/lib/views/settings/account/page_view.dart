import 'dart:async';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../fallbacks/index.dart';
import '../../../api/client/profile/actions.dart';
import '../../../api/server/auth/me.dart';
import '../../../api/server/profile/get.dart';
import '../../../components/ui/avatar/avatar.dart';
import '../../../components/ui/button/button.dart';
import '../../../components/ui/toast/toast.dart';
import '../../../constants/theme.dart';
import '../../../hooks/use_auth.dart';
import '../../../l10n/app_localizations.dart';
import '../settings_shell.dart';

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
    final t = AppLocalizations.of(context);
    final profileAsync = ref.watch(_profileProvider);
    final user = ref.watch(currentUserProvider);

    return SettingsShellScaffold(
      lang: lang,
      child: profileAsync.when(
        loading: () => const SettingsLoadingFallback(),
        error: (_, __) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.error_outline, size: 48, color: colors.danger),
                const SizedBox(height: 12),
                Text(
                  t.notificationLoadFailed,
                  style: TextStyle(color: colors.danger, fontSize: 16),
                ),
              ],
            ),
          ),
        ),
        data: (profile) => _AccountForm(
          profile: profile,
          user: user,
          colors: colors,
          ref: ref,
        ),
      ),
    );
  }
}

class _AccountForm extends StatefulWidget {
  final dynamic profile;
  final dynamic user;
  final AppColors colors;
  final WidgetRef ref;

  const _AccountForm({
    required this.profile,
    required this.user,
    required this.colors,
    required this.ref,
  });

  @override
  State<_AccountForm> createState() => _AccountFormState();
}

class _AccountFormState extends State<_AccountForm> {
  late TextEditingController _nameCtrl;
  late TextEditingController _bioCtrl;
  late TextEditingController _usernameCtrl;
  bool _saving = false;
  bool _avatarUploading = false;

  Timer? _usernameDebounce;
  bool _usernameChecking = false;
  bool? _usernameAvailable;

  @override
  void initState() {
    super.initState();
    _nameCtrl =
        TextEditingController(text: widget.profile.name as String? ?? '');
    _bioCtrl = TextEditingController(text: widget.profile.bio as String? ?? '');
    _usernameCtrl = TextEditingController(
      text: widget.profile.username as String? ?? '',
    );
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _bioCtrl.dispose();
    _usernameCtrl.dispose();
    _usernameDebounce?.cancel();
    super.dispose();
  }

  void _onUsernameChanged(String value) {
    _usernameDebounce?.cancel();
    if (value.isEmpty || value == (widget.profile.username as String? ?? '')) {
      setState(() {
        _usernameChecking = false;
        _usernameAvailable = null;
      });
      return;
    }
    setState(() => _usernameChecking = true);
    _usernameDebounce = Timer(const Duration(milliseconds: 300), () async {
      try {
        final available =
            await widget.ref.read(profileActionsProvider).checkUsername(value);
        if (mounted) {
          setState(() {
            _usernameChecking = false;
            _usernameAvailable = available;
          });
        }
      } catch (_) {
        if (mounted) {
          setState(() {
            _usernameChecking = false;
            _usernameAvailable = null;
          });
        }
      }
    });
  }

  Future<void> _pickAvatar() async {
    final result = await FilePicker.pickFiles(
      type: FileType.image,
    );
    if (result == null || result.files.isEmpty) return;
    if (!mounted) return;

    final t = AppLocalizations.of(context);
    final file = result.files.first;
    if (file.size > 5 * 1024 * 1024) {
      if (mounted) showToast(context, t.settingsFileTooLarge);
      return;
    }
    final ext = file.extension?.toLowerCase();
    if (ext == null || !['jpg', 'jpeg', 'png', 'webp', 'gif'].contains(ext)) {
      if (mounted) showToast(context, t.settingsInvalidFileType);
      return;
    }
    if (file.path == null) return;

    setState(() => _avatarUploading = true);
    try {
      final url = await widget.ref
          .read(profileActionsProvider)
          .uploadAvatar(file.path!);
      await widget.ref.read(profileActionsProvider).update(avatarUrl: url);
      widget.ref.invalidate(_profileProvider);
      try {
        final me = await widget.ref.read(meServerProvider).call();
        await widget.ref.read(authProvider.notifier).updateUser(me);
      } catch (_) {
        // Non-fatal: the page refetch above already reflects the new avatar.
      }
      if (mounted) showToast(context, t.settingsSaveSuccess);
    } catch (e) {
      if (mounted) showToast(context, 'Failed: $e');
    } finally {
      if (mounted) setState(() => _avatarUploading = false);
    }
  }

  Future<void> _save() async {
    final t = AppLocalizations.of(context);
    setState(() => _saving = true);
    try {
      final Map<String, dynamic> updates = {};
      if (_nameCtrl.text != (widget.profile.name as String? ?? '')) {
        updates['name'] = _nameCtrl.text;
      }
      if (_bioCtrl.text != (widget.profile.bio as String? ?? '')) {
        updates['bio'] = _bioCtrl.text;
      }
      if (_usernameCtrl.text != (widget.profile.username as String? ?? '')) {
        updates['username'] = _usernameCtrl.text;
      }
      if (updates.isNotEmpty) {
        await widget.ref.read(profileActionsProvider).update(
              name: updates['name'] as String?,
              bio: updates['bio'] as String?,
              username: updates['username'] as String?,
            );
      }
      if (mounted) showToast(context, t.settingsSaveSuccess);
    } catch (e) {
      if (mounted) showToast(context, 'Failed: $e');
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    final colors = widget.colors;
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Center(
          child: Column(
            children: [
              Stack(
                children: [
                  Avatar(
                    imageUrl: widget.profile.avatarUrl as String?,
                    name: widget.profile.name as String? ?? 'U',
                    radius: 32,
                  ),
                  Positioned(
                    bottom: 0,
                    right: 0,
                    child: InkWell(
                      onTap: _avatarUploading ? null : _pickAvatar,
                      borderRadius: BorderRadius.circular(16),
                      child: Container(
                        width: 32,
                        height: 32,
                        decoration: BoxDecoration(
                          color: colors.brand,
                          shape: BoxShape.circle,
                        ),
                        child: _avatarUploading
                            ? const SizedBox(
                                width: 16,
                                height: 16,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: Colors.white,
                                ),
                              )
                            : const Icon(
                                Icons.camera_alt,
                                size: 16,
                                color: Colors.white,
                              ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                widget.profile.name as String? ?? 'User',
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(
                widget.profile.email as String? ?? '',
                style: TextStyle(color: colors.fgMuted),
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),
        TextField(
          controller: _nameCtrl,
          decoration: InputDecoration(labelText: t.settingsDisplayName),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: _usernameCtrl,
          decoration: InputDecoration(
            labelText: t.settingsUsername,
            suffixIcon: _usernameChecking
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: Padding(
                      padding: EdgeInsets.all(12),
                      child: CircularProgressIndicator(strokeWidth: 2),
                    ),
                  )
                : _usernameAvailable == true
                    ? const Icon(Icons.check_circle, color: Colors.green)
                    : _usernameAvailable == false
                        ? const Icon(Icons.cancel, color: Colors.red)
                        : null,
            helperText: _usernameChecking
                ? t.settingsUsernameChecking
                : _usernameAvailable == true
                    ? t.settingsUsernameAvailable
                    : _usernameAvailable == false
                        ? t.settingsUsernameTaken
                        : null,
          ),
          onChanged: _onUsernameChanged,
        ),
        const SizedBox(height: 12),
        TextField(
          controller: _bioCtrl,
          decoration: InputDecoration(labelText: t.settingsBio),
          maxLines: 3,
        ),
        const SizedBox(height: 24),
        Button(
          onPressed: _saving ? null : _save,
          child: Text(_saving ? t.settingsSaving : t.settingsSave),
        ),
      ],
    );
  }
}
