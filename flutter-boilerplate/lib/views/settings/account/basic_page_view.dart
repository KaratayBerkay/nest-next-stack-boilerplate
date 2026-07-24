import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../components/ui/avatar/avatar.dart';
import '../../../components/ui/button/button.dart';
import '../../../constants/theme.dart';
import '../../../hooks/use_auth.dart';

class BasicSettingsAccountPage extends ConsumerStatefulWidget {
  final String lang;

  const BasicSettingsAccountPage({super.key, required this.lang});

  @override
  ConsumerState<BasicSettingsAccountPage> createState() =>
      _BasicSettingsAccountPageState();
}

class _BasicSettingsAccountPageState
    extends ConsumerState<BasicSettingsAccountPage> {
  late TextEditingController _nameCtrl;

  @override
  void initState() {
    super.initState();
    final user = ref.read(currentUserProvider);
    _nameCtrl = TextEditingController(text: user?.name ?? '');
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final user = ref.watch(currentUserProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Account')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Center(
            child: Column(
              children: [
                Avatar(name: user?.name ?? 'U', radius: 32),
                const SizedBox(height: 12),
                Text(
                  user?.name ?? 'User',
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  user?.email ?? '',
                  style: TextStyle(color: colors.fgMuted),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          TextField(
            controller: _nameCtrl,
            decoration: const InputDecoration(labelText: 'Display Name'),
          ),
          const SizedBox(height: 24),
          Button(
            fullWidth: true,
            child: const Text('Save Name'),
            onPressed: () {},
          ),
        ],
      ),
    );
  }
}
