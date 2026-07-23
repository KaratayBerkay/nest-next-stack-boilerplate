import 'package:flutter/material.dart';

class ExampleTabs extends StatelessWidget {
  final List<String> titles;
  final List<Widget> children;
  final int? initialIndex;

  const ExampleTabs({
    super.key,
    required this.titles,
    required this.children,
    this.initialIndex,
  });

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      initialIndex: initialIndex ?? 0,
      length: titles.length,
      child: Scaffold(
        appBar: AppBar(
          bottom: TabBar(
            isScrollable: true,
            tabAlignment: TabAlignment.start,
            tabs: titles.map((t) => Tab(text: t)).toList(),
          ),
        ),
        body: TabBarView(children: children),
      ),
    );
  }
}
