import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../api/server/auth/verify_email.dart';
import '../../../components/ui/toast/toast.dart';

class VerifyEmailPageContent extends ConsumerStatefulWidget {
  const VerifyEmailPageContent({super.key});

  @override
  ConsumerState<VerifyEmailPageContent> createState() =>
      _VerifyEmailPageContentState();
}

class _VerifyEmailPageContentState
    extends ConsumerState<VerifyEmailPageContent> {
  final _tokenCtrl = TextEditingController();
  bool _loading = false;
  bool _done = false;

  @override
  void dispose() {
    _tokenCtrl.dispose();
    super.dispose();
  }

  Future<void> _handleVerify() async {
    setState(() => _loading = true);
    try {
      await ref.read(verifyEmailServerProvider).call(_tokenCtrl.text);
      if (!mounted) return;
      setState(() => _done = true);
      showToast(context, 'Email verified successfully');
    } catch (e) {
      if (mounted) showToast(context, 'Failed: $e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Verify Email')),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (_done)
                Column(
                  children: [
                    const Icon(
                      Icons.check_circle,
                      color: Colors.green,
                      size: 48,
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'Your email has been verified!',
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 16),
                    FilledButton(
                      onPressed: () => context.go('/auth/login'),
                      child: const Text('Continue'),
                    ),
                  ],
                )
              else
                Column(
                  children: [
                    const Text(
                      'Enter the verification token sent to your email.',
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: _tokenCtrl,
                      decoration: const InputDecoration(
                        labelText: 'Verification Token',
                      ),
                    ),
                    const SizedBox(height: 20),
                    FilledButton(
                      onPressed: _loading ? null : _handleVerify,
                      child: _loading
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.white,
                              ),
                            )
                          : const Text('Verify'),
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
