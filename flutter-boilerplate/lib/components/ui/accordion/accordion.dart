import 'package:flutter/material.dart';


class AccordionWidget extends StatefulWidget {
  final List<AccordionItem> items;
  final bool expandMultiple;

  const AccordionWidget({
    super.key,
    required this.items,
    this.expandMultiple = false,
  });

  @override
  State<AccordionWidget> createState() => _AccordionWidgetState();
}

class AccordionItem {
  final String title;
  final Widget content;
  final IconData? icon;

  const AccordionItem({
    required this.title,
    required this.content,
    this.icon,
  });
}

class _AccordionWidgetState extends State<AccordionWidget> {
  final Set<int> _expandedIndexes = {};

  @override
  Widget build(BuildContext context) {
    return Column(
      children: List.generate(widget.items.length, (i) {
        final isExpanded = _expandedIndexes.contains(i);
        final item = widget.items[i];

        return Column(
          children: [
          InkWell(
            onTap: () {
              setState(() {
              if (widget.expandMultiple) {
                if (isExpanded) {
                  _expandedIndexes.remove(i);
                } else {
                  _expandedIndexes.add(i);
                }
              } else {
                _expandedIndexes.clear();
                if (!isExpanded) _expandedIndexes.add(i);
              }
              });
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Row(
              children: [
                if (item.icon != null) ...[
                  Icon(item.icon, size: 18),
                  const SizedBox(width: 12),
                ],
                Expanded(
                  child: Text(item.title, style: const TextStyle(fontWeight: FontWeight.w500)),
                ),
                AnimatedRotation(
                  turns: isExpanded ? 0.5 : 0,
                  duration: const Duration(milliseconds: 200),
                  child: const Icon(Icons.keyboard_arrow_down, size: 20),
                ),
              ],
              ),
            ),
          ),
          AnimatedCrossFade(
            firstChild: const SizedBox.shrink(),
            secondChild: Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
              child: item.content,
            ),
            crossFadeState: isExpanded ? CrossFadeState.showSecond : CrossFadeState.showFirst,
            duration: const Duration(milliseconds: 200),
          ),
          Divider(height: 1, color: Theme.of(context).dividerColor),
          ],
        );
      }),
    );
  }
}

class AccordionContent extends StatelessWidget {
  final Widget child;

  const AccordionContent({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return child;
  }
}

class AccordionTrigger extends StatelessWidget {
  final Widget child;

  const AccordionTrigger({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return child;
  }
}

class AccordionItemWidget extends StatelessWidget {
  final String title;
  final Widget content;
  final bool expanded;

  const AccordionItemWidget({
    super.key,
    required this.title,
    required this.content,
    this.expanded = false,
  });

  @override
  Widget build(BuildContext context) {
    return ExpansionTile(
      title: Text(title),
      initiallyExpanded: expanded,
      children: [content],
    );
  }
}
