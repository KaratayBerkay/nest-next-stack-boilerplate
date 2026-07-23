import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../components/ui/form_text_field.dart';

class UseApiKeyMutations extends ConsumerStatefulWidget {
  final Widget Function({
    required TextEditingController nameCtrl,
    required GlobalKey<FormState> formKey,
    required VoidCallback onGenerate,
    required VoidCallback onDelete,
    required List<Map<String, String>> keys,
  }) builder;

  const UseApiKeyMutations({super.key, required this.builder});

  @override
  ConsumerState<UseApiKeyMutations> createState() => _UseApiKeyMutationsState();
}

class _UseApiKeyMutationsState extends ConsumerState<UseApiKeyMutations> {
  final _nameCtrl = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  final _keys = <Map<String, String>>[];

  @override
  void dispose() {
    _nameCtrl.dispose();
    super.dispose();
  }

  void _generateKey() {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    final id = DateTime.now().millisecondsSinceEpoch.toString();
    final masked = 'sk_${_nameCtrl.text.toLowerCase().replaceAll(RegExp(r'\s+'), '_')}_${id.substring(id.length - 8)}';
    setState(() {
      _keys.insert(0, {'id': id, 'name': _nameCtrl.text, 'key': masked});
      _nameCtrl.clear();
    });
  }

  void _deleteKey(String id) {
    setState(() => _keys.removeWhere((k) => k['id'] == id));
  }

  @override
  Widget build(BuildContext context) {
    return widget.builder(
      nameCtrl: _nameCtrl,
      formKey: _formKey,
      onGenerate: _generateKey,
      onDelete: () => _deleteKey(''),
      keys: _keys,
    );
  }
}
