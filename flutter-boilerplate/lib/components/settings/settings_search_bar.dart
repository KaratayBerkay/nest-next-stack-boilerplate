import 'package:flutter/material.dart';

import '../../constants/theme.dart';

class SettingsSearchBar extends StatefulWidget {
  final void Function(String query)? onChanged;
  final String? hintText;
  final TextEditingController? controller;

  const SettingsSearchBar({
    super.key,
    this.onChanged,
    this.hintText,
    this.controller,
  });

  @override
  State<SettingsSearchBar> createState() => _SettingsSearchBarState();
}

class _SettingsSearchBarState extends State<SettingsSearchBar> {
  late final TextEditingController _controller;
  bool _hasText = false;

  @override
  void initState() {
    super.initState();
    _controller = widget.controller ?? TextEditingController();
    _controller.addListener(_onListen);
    _hasText = _controller.text.isNotEmpty;
  }

  @override
  void dispose() {
    if (widget.controller == null) {
      _controller.dispose();
    } else {
      _controller.removeListener(_onListen);
    }
    super.dispose();
  }

  void _onListen() {
    final hasText = _controller.text.isNotEmpty;
    if (hasText != _hasText) {
      setState(() => _hasText = hasText);
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 0, 24, 16),
      child: TextField(
        controller: _controller,
        onChanged: widget.onChanged,
        decoration: InputDecoration(
          hintText: widget.hintText ?? 'Search settings...',
          prefixIcon: Icon(Icons.search_rounded, size: 20, color: colors.fgMuted),
          suffixIcon: _hasText
              ? IconButton(
                  icon: Icon(Icons.close_rounded, size: 18, color: colors.fgMuted),
                  onPressed: () {
                    _controller.clear();
                    widget.onChanged?.call('');
                  },
                )
              : null,
          filled: true,
          fillColor: colors.surfaceAlt,
          contentPadding: const EdgeInsets.symmetric(vertical: 10),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: BorderSide(color: colors.border),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: BorderSide(color: colors.border),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: BorderSide(color: colors.brand),
          ),
        ),
      ),
    );
  }
}
