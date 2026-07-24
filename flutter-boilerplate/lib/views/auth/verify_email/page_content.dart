import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../api/server/auth/verify_email.dart';
import '../../../components/ui/toast/toast.dart';
import '../../../l10n/app_localizations.dart';

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
    final t = AppLocalizations.of(context);
    setState(() => _loading = true);
    try {
      await ref.read(verifyEmailServerProvider).call(_tokenCtrl.text);
      if (!mounted) return;
      setState(() => _done = true);
      showToast(context, t.authFormVerifyEmailSuccess);
    } catch (e) {
      if (mounted) showToast(context, '$e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);

    return Scaffold(
      appBar: AppBar(title: Text(t.authFormVerifyEmailTitle)),
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
                    Text(
                      t.authFormVerifyEmailSuccess,
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 16),
                    FilledButton(
                      onPressed: () => context.go('/auth/login'),
                      child: Text(t.authFormVerifyEmailLoginLink),
                    ),
                  ],
                )
              else
                Column(
                  children: [
                    Text(t.authFormVerifyEmailDescription),
                    const SizedBox(height: 16),
                    TextField(
                      controller: _tokenCtrl,
                      decoration: InputDecoration(
                        labelText: t.authFormVerifyEmailTokenLabel,
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
                          : Text(t.authFormVerifyEmailSubmit),
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
