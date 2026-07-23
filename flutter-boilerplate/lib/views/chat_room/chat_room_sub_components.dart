import 'package:flutter/material.dart';

import '../../constants/theme.dart';

class SidebarCloseButton extends StatelessWidget {
  final bool useNativeControls;
  final VoidCallback onClick;

  const SidebarCloseButton({
    super.key,
    this.useNativeControls = false,
    required this.onClick,
  });

  @override
  Widget build(BuildContext context) {
    return IconButton(
      icon: const Icon(Icons.close, size: 18),
      onPressed: onClick,
      tooltip: 'Close rooms sidebar',
    );
  }
}

class RoomButton extends StatelessWidget {
  final bool useNativeControls;
  final String room;
  final bool isActive;
  final int count;
  final bool isVip;
  final VoidCallback onSelect;

  const RoomButton({
    super.key,
    this.useNativeControls = false,
    required this.room,
    this.isActive = false,
    this.count = 0,
    this.isVip = false,
    required this.onSelect,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: InkWell(
        onTap: onSelect,
        borderRadius: BorderRadius.circular(8),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: isActive ? colors.brand : Colors.transparent,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            children: [
              if (isVip)
                Padding(
                  padding: const EdgeInsets.only(right: 4),
                  child: Icon(
                    Icons.workspace_premium,
                    size: 12,
                    color: isActive ? colors.surface : colors.brand,
                  ),
                ),
              Text(
                '# $room',
                style: TextStyle(
                  fontSize: 13,
                  color: isActive ? colors.surface : colors.fgMuted,
                  fontWeight: isActive ? FontWeight.w500 : FontWeight.normal,
                ),
              ),
              const Spacer(),
              if (count > 0)
                Text(
                  '$count',
                  style: TextStyle(
                    fontSize: 10,
                    color: isActive
                        ? colors.surface.withValues(alpha: 0.7)
                        : colors.fgMuted,
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

class HamburgerButton extends StatelessWidget {
  final bool useNativeControls;
  final String room;
  final String countLabel;
  final String ariaLabel;
  final VoidCallback onClick;

  const HamburgerButton({
    super.key,
    this.useNativeControls = false,
    required this.room,
    required this.countLabel,
    this.ariaLabel = 'Open rooms',
    required this.onClick,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return InkWell(
      onTap: onClick,
      child: Row(
        children: [
          Icon(Icons.menu, size: 18, color: colors.fgMuted),
          const SizedBox(width: 8),
          Text(
            '# $room',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: colors.fg,
            ),
          ),
          const SizedBox(width: 4),
          Text(
            countLabel,
            style: TextStyle(fontSize: 12, color: colors.fgMuted),
          ),
        ],
      ),
    );
  }
}

class MessageInput extends StatelessWidget {
  final bool useNativeControls;
  final TextEditingController controller;
  final String? placeholder;
  final bool disabled;

  const MessageInput({
    super.key,
    this.useNativeControls = false,
    required this.controller,
    this.placeholder,
    this.disabled = false,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return TextField(
      controller: controller,
      enabled: !disabled,
      decoration: InputDecoration(
        hintText: placeholder ?? 'Type a message...',
        isDense: true,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(color: colors.border),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      ),
      style: const TextStyle(fontSize: 14),
    );
  }
}

class SendButton extends StatelessWidget {
  final bool useNativeControls;
  final VoidCallback? onClick;
  final bool disabled;
  final String label;

  const SendButton({
    super.key,
    this.useNativeControls = false,
    this.onClick,
    this.disabled = false,
    this.label = 'Send',
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return FilledButton(
      onPressed: disabled ? null : onClick,
      style: FilledButton.styleFrom(
        backgroundColor: colors.brand,
        foregroundColor: colors.surface,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
      child: Text(label, style: const TextStyle(fontSize: 13)),
    );
  }
}
