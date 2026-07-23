import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../api/server/auth/reset_password.dart';
import '../../../components/ui/toast/toast.dart';

class ResetPasswordPageContent extends ConsumerStatefulWidget {
  const ResetPasswordPageContent({super.key});

  @override
  ConsumerState<ResetPasswordPageContent> createState() => _ResetPasswordPageContentState();
}

class _ResetPasswordPageContentState extends ConsumerState<ResetPasswordPageContent> {
  final _tokenCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  bool _loading = false;
  bool _done = false;

  @override
  void dispose() {
    _tokenCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }

  Future<void> _handleReset() async {
    setState(() => _loading = true);
    try {
      await ref.read(resetPasswordServerProvider).call(_tokenCtrl.text, _passwordCtrl.text);
      setState(() => _done = true);
      showToast(context, 'Password reset successfully');
    } catch (e) {
      if (mounted) showToast(context, 'Failed: $e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Reset Password')),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (_done)
                Column(
                  children: [
                    const Icon(Icons.check_circle, color: Colors.green, size: 48),
                    const SizedBox(height: 16),
                    const Text('Password has been reset.', textAlign: TextAlign.center),
                    const SizedBox(height: 16),
                    FilledButton(onPressed: () => context.go('/auth/login'), child: const Text('Back to Login')),
                  ],
                )
              else
                Column(
                  children: [
                    TextField(
                      controller: _tokenCtrl,
                      decoration: const InputDecoration(labelText: 'Reset Token'),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _passwordCtrl,
                      decoration: const InputDecoration(labelText: 'New Password'),
                      obscureText: true,
                    ),
                    const SizedBox(height: 20),
                    FilledButton(
                      onPressed: _loading ? null : _handleReset,
                      child: _loading
                          ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                          : const Text('Reset Password'),
                    ),
                  ],
                ),
            ],
          ),
        ),
      ),
    );
  }
}
