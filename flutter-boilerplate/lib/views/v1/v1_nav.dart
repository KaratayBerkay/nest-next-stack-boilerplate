import 'package:flutter/material.dart';

class V1BottomNav extends StatelessWidget {
  final int currentIndex;
  final void Function(int) onTap;

  const V1BottomNav({
    super.key,
    required this.currentIndex,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      top: false,
      child: BottomNavigationBar(
        currentIndex: currentIndex,
        onTap: onTap,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.article), label: 'Feed'),
          BottomNavigationBarItem(icon: Icon(Icons.forum), label: 'Chat'),
          BottomNavigationBarItem(icon: Icon(Icons.settings), label: 'Settings'),
        ],
      ),
    );
  }
}
