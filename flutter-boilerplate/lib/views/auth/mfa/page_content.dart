import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../api/server/auth/mfa.dart';
import '../../../components/ui/toast/toast.dart';
import '../../../l10n/app_localizations.dart';

class MfaPageContent extends ConsumerStatefulWidget {
  const MfaPageContent({super.key});

  @override
  ConsumerState<MfaPageContent> createState() => _MfaPageContentState();
}

class _MfaPageContentState extends ConsumerState<MfaPageContent> {
  final _codeCtrl = TextEditingController();
  bool _loading = false;

  @override
  void dispose() {
    _codeCtrl.dispose();
    super.dispose();
  }

  Future<void> _handleVerify() async {
    final t = AppLocalizations.of(context);
    setState(() => _loading = true);
    try {
      await ref.read(mfaServerProvider).call(_codeCtrl.text);
      if (mounted) {
        showToast(context, t.authFormLoginMfaVerified);
        context.go('/v1/en/feed');
      }
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
      appBar: AppBar(title: Text(t.authFormLoginMfaTitle)),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(t.authFormLoginMfaDescription),
              const SizedBox(height: 16),
              TextField(
                controller: _codeCtrl,
                decoration:
                    InputDecoration(labelText: t.authFormLoginMfaCodeLabel),
                keyboardType: TextInputType.number,
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
                    : Text(t.authFormLoginMfaVerify),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
