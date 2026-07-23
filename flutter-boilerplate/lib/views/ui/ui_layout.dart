import 'package:flutter/material.dart';

class UiLayout extends StatefulWidget {
  final List<UiCategory> categories;
  final int initialIndex;

  const UiLayout({
    super.key,
    required this.categories,
    this.initialIndex = 0,
  });

  @override
  State<UiLayout> createState() => _UiLayoutState();
}

class _UiLayoutState extends State<UiLayout> with SingleTickerProviderStateMixin {
  late TabController _controller;

  @override
  void initState() {
    super.initState();
    _controller = TabController(
      length: widget.categories.length,
      vsync: this,
      initialIndex: widget.initialIndex,
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('UI Components'),
        bottom: TabBar(
          controller: _controller,
          isScrollable: true,
          tabAlignment: TabAlignment.start,
          tabs: widget.categories.map((c) => Tab(text: c.name)).toList(),
        ),
      ),
      body: TabBarView(
        controller: _controller,
        children: widget.categories.map((c) => c.content).toList(),
      ),
    );
  }
}

class UiCategory {
  final String name;
  final Widget content;

  const UiCategory({required this.name, required this.content});
}
