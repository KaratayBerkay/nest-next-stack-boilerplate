import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../api/server/auth/request_password_reset.dart';
import '../../../components/ui/toast/toast.dart';

class ForgotPasswordPageContent extends ConsumerStatefulWidget {
  const ForgotPasswordPageContent({super.key});

  @override
  ConsumerState<ForgotPasswordPageContent> createState() =>
      _ForgotPasswordPageContentState();
}

class _ForgotPasswordPageContentState
    extends ConsumerState<ForgotPasswordPageContent> {
  final _emailCtrl = TextEditingController();
  bool _loading = false;
  bool _sent = false;

  @override
  void dispose() {
    _emailCtrl.dispose();
    super.dispose();
  }

  Future<void> _handleSend() async {
    setState(() => _loading = true);
    try {
      await ref.read(requestPasswordResetServerProvider).call(_emailCtrl.text);
      if (!mounted) return;
      setState(() => _sent = true);
      showToast(context, 'Password reset email sent');
    } catch (e) {
      if (mounted) showToast(context, 'Failed: $e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Forgot Password')),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (_sent)
                Column(
                  children: [
                    const Icon(
                      Icons.check_circle,
                      color: Colors.green,
                      size: 48,
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'Check your email for reset instructions.',
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 16),
                    FilledButton(
                      onPressed: () => context.go('/auth/login'),
                      child: const Text('Back to Login'),
                    ),
                  ],
                )
              else
                Column(
                  children: [
                    TextField(
                      controller: _emailCtrl,
                      decoration: const InputDecoration(labelText: 'Email'),
                      keyboardType: TextInputType.emailAddress,
                    ),
                    const SizedBox(height: 20),
                    FilledButton(
                      onPressed: _loading ? null : _handleSend,
                      child: _loading
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.white,
                              ),
                            )
                          : const Text('Send Reset Link'),
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
