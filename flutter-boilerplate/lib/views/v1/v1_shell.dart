import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'v1_header.dart';
import 'v1_sidebar.dart';

class V1Shell extends ConsumerStatefulWidget {
  final String lang;
  final Widget child;

  const V1Shell({
    super.key,
    required this.lang,
    required this.child,
  });

  @override
  ConsumerState<V1Shell> createState() => _V1ShellState();
}

class _V1ShellState extends ConsumerState<V1Shell> {
  bool _sidebarOpen = false;

  void _toggleSidebar() => setState(() => _sidebarOpen = !_sidebarOpen);
  void _closeSidebar() => setState(() => _sidebarOpen = false);

  @override
  Widget build(BuildContext context) {
    final loc = GoRouterState.of(context).uri.toString();
    final width = MediaQuery.of(context).size.width;
    final isMobile = width < 768;

    return PopScope(
      child: Scaffold(
        appBar: V1Header(
          lang: widget.lang,
          onToggleSidebar: _toggleSidebar,
        ),
        body: isMobile
            ? Stack(
                children: [
                  SafeArea(
                    top: false,
                    child: widget.child,
                  ),
                  V1Sidebar(
                    lang: widget.lang,
                    currentPath: loc,
                    sidebarOpen: _sidebarOpen,
                    onClose: _closeSidebar,
                  ),
                ],
              )
            : SafeArea(
                top: false,
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    V1Sidebar(
                      lang: widget.lang,
                      currentPath: loc,
                      sidebarOpen: _sidebarOpen,
                      onClose: _closeSidebar,
                    ),
                    Expanded(child: widget.child),
                  ],
                ),
              ),
      ),
    );
  }
}
