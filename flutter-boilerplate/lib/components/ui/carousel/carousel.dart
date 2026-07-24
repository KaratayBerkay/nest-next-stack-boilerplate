import 'package:flutter/material.dart';

class Carousel extends StatefulWidget {
  final List<Widget> children;
  final double? height;
  final bool autoPlay;
  final Duration autoPlayInterval;

  const Carousel({
    super.key,
    required this.children,
    this.height,
    this.autoPlay = false,
    this.autoPlayInterval = const Duration(seconds: 3),
  });

  @override
  State<Carousel> createState() => _CarouselState();
}

class _CarouselState extends State<Carousel> {
  late PageController _pageController;
  int _currentPage = 0;

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
    if (widget.autoPlay && widget.children.length > 1) {
      _startAutoPlay();
    }
  }

  void _startAutoPlay() {
    Future.delayed(widget.autoPlayInterval, () {
      if (!mounted) return;
      final next = (_currentPage + 1) % widget.children.length;
      _pageController.animateToPage(
        next,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    });
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        SizedBox(
          height: widget.height ?? 200,
          child: PageView(
            controller: _pageController,
            onPageChanged: (i) {
              setState(() => _currentPage = i);
              if (widget.autoPlay) _startAutoPlay();
            },
            children: widget.children,
          ),
        ),
        if (widget.children.length > 1)
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(widget.children.length, (i) {
              return Container(
                margin: const EdgeInsets.symmetric(horizontal: 3),
                width: _currentPage == i ? 24 : 8,
                height: 8,
                decoration: BoxDecoration(
                  color: _currentPage == i
                      ? Theme.of(context).colorScheme.primary
                      : Theme.of(context).dividerColor,
                  borderRadius: BorderRadius.circular(4),
                ),
              );
            }),
          ),
      ],
    );
  }
}
