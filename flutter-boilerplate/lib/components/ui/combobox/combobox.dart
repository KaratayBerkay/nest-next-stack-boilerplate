import 'package:flutter/material.dart';

class ComboboxWidget extends StatefulWidget {
  final List<String> items;
  final String? value;
  final void Function(String?)? onChanged;
  final String? label;
  final String? hintText;
  final String? errorText;

  const ComboboxWidget({
    super.key,
    required this.items,
    this.value,
    this.onChanged,
    this.label,
    this.hintText,
    this.errorText,
  });

  @override
  State<ComboboxWidget> createState() => _ComboboxWidgetState();
}

class _ComboboxWidgetState extends State<ComboboxWidget> {
  final _controller = TextEditingController();
  final _focusNode = FocusNode();
  late List<String> _filteredItems;
  bool _showDropdown = false;

  @override
  void initState() {
    super.initState();
    _filteredItems = widget.items;
    _controller.addListener(_onSearchChanged);
    _focusNode.addListener(() {
      if (!_focusNode.hasFocus) {
        setState(() => _showDropdown = false);
      }
    });
  }

  void _onSearchChanged() {
    final query = _controller.text.toLowerCase();
    setState(() {
      _filteredItems = widget.items
          .where((item) => item.toLowerCase().contains(query))
          .toList();
      _showDropdown = _filteredItems.isNotEmpty;
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        TextField(
          controller: _controller,
          focusNode: _focusNode,
          decoration: InputDecoration(
            labelText: widget.label,
            hintText: widget.hintText,
            errorText: widget.errorText,
            suffixIcon: IconButton(
              icon: const Icon(Icons.arrow_drop_down),
              onPressed: () => setState(() => _showDropdown = !_showDropdown),
            ),
          ),
        ),
        if (_showDropdown)
          Container(
            constraints: const BoxConstraints(maxHeight: 200),
            decoration: BoxDecoration(
              border: Border.all(color: Theme.of(context).dividerColor),
              borderRadius: const BorderRadius.vertical(bottom: Radius.circular(6)),
            ),
            child: ListView.builder(
              shrinkWrap: true,
              itemCount: _filteredItems.length,
              itemBuilder: (_, i) => ListTile(
                dense: true,
                title: Text(_filteredItems[i]),
                onTap: () {
                  widget.onChanged?.call(_filteredItems[i]);
                  _controller.text = _filteredItems[i];
                  setState(() => _showDropdown = false);
                },
              ),
            ),
          ),
      ],
    );
  }
}
