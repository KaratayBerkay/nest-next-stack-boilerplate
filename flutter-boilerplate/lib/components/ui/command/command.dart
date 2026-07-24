import 'package:flutter/material.dart';

class CommandWidget extends StatefulWidget {
  final List<CommandItem> items;
  final void Function(CommandItem)? onSelected;
  final String? hintText;

  const CommandWidget({
    super.key,
    required this.items,
    this.onSelected,
    this.hintText,
  });

  @override
  State<CommandWidget> createState() => _CommandWidgetState();
}

class CommandItem {
  final String label;
  final IconData? icon;
  final String? group;
  final dynamic value;

  const CommandItem({
    required this.label,
    this.icon,
    this.group,
    this.value,
  });
}

class _CommandWidgetState extends State<CommandWidget> {
  final _controller = TextEditingController();
  late List<CommandItem> _filteredItems;

  @override
  void initState() {
    super.initState();
    _filteredItems = widget.items;
    _controller.addListener(() {
      final q = _controller.text.toLowerCase();
      setState(() {
        _filteredItems = widget.items
            .where((i) => i.label.toLowerCase().contains(q))
            .toList();
      });
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final groups = <String, List<CommandItem>>{};
    for (final item in _filteredItems) {
      groups.putIfAbsent(item.group ?? '', () => []).add(item);
    }

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Padding(
          padding: const EdgeInsets.all(8),
          child: TextField(
            controller: _controller,
            autofocus: true,
            decoration: InputDecoration(
              hintText: widget.hintText ?? 'Search...',
              prefixIcon: const Icon(Icons.search, size: 20),
              border: InputBorder.none,
              filled: false,
            ),
          ),
        ),
        const Divider(height: 1),
        Flexible(
          child: ListView(
            shrinkWrap: true,
            children: groups.entries.expand((entry) {
              return [
                if (entry.key.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.fromLTRB(12, 8, 12, 4),
                    child: Text(
                      entry.key,
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: Colors.grey,
                      ),
                    ),
                  ),
                ...entry.value.map(
                  (item) => ListTile(
                    dense: true,
                    leading:
                        item.icon != null ? Icon(item.icon, size: 18) : null,
                    title: Text(item.label),
                    onTap: () => widget.onSelected?.call(item),
                  ),
                ),
              ];
            }).toList(),
          ),
        ),
      ],
    );
  }
}

class CommandEmpty extends StatelessWidget {
  final String message;

  const CommandEmpty({super.key, this.message = 'No results found.'});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Text(message, style: const TextStyle(color: Colors.grey)),
      ),
    );
  }
}

class CommandGroup extends StatelessWidget {
  final String label;
  final List<Widget> children;

  const CommandGroup({super.key, required this.label, required this.children});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(12, 8, 12, 4),
          child: Text(
            label,
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: Colors.grey,
            ),
          ),
        ),
        ...children,
      ],
    );
  }
}

class CommandInput extends StatelessWidget {
  final TextEditingController controller;
  final String? hintText;

  const CommandInput({super.key, required this.controller, this.hintText});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(8),
      child: TextField(
        controller: controller,
        autofocus: true,
        decoration: InputDecoration(
          hintText: hintText ?? 'Search...',
          prefixIcon: const Icon(Icons.search, size: 20),
          border: InputBorder.none,
        ),
      ),
    );
  }
}

class CommandItemWidget extends StatelessWidget {
  final String label;
  final IconData? icon;
  final VoidCallback? onTap;

  const CommandItemWidget({
    super.key,
    required this.label,
    this.icon,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      dense: true,
      leading: icon != null ? Icon(icon, size: 18) : null,
      title: Text(label),
      onTap: onTap,
    );
  }
}

class CommandList extends StatelessWidget {
  final List<Widget> children;

  const CommandList({super.key, required this.children});

  @override
  Widget build(BuildContext context) {
    return Flexible(
      child: ListView(shrinkWrap: true, children: children),
    );
  }
}
