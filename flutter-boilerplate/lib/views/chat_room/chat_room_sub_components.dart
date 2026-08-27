import 'package:flutter/material.dart';

import '../../constants/theme.dart';
import '../../l10n/app_localizations.dart';

class SidebarCloseButton extends StatelessWidget {
  final VoidCallback onClick;

  const SidebarCloseButton({
    super.key,
    required this.onClick,
  });

  @override
  Widget build(BuildContext context) {
    return IconButton(
      icon: const Icon(Icons.close, size: 18),
      onPressed: onClick,
      tooltip: AppLocalizations.of(context).chatRoomCloseSidebar,
    );
  }
}

class RoomButton extends StatelessWidget {
  final String room;
  final bool isActive;
  final int count;
  final bool isVip;
  final VoidCallback onSelect;

  const RoomButton({
    super.key,
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
  final String room;
  final String countLabel;
  final String? ariaLabel;
  final VoidCallback onClick;

  const HamburgerButton({
    super.key,
    required this.room,
    required this.countLabel,
    this.ariaLabel,
    required this.onClick,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Semantics(
      label: ariaLabel ?? AppLocalizations.of(context).chatRoomOpenRooms,
      button: true,
      child: InkWell(
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
      ),
    );
  }
}

class MessageInput extends StatelessWidget {
  final TextEditingController controller;
  final String? placeholder;
  final bool disabled;
  final ValueChanged<String>? onSubmitted;

  const MessageInput({
    super.key,
    required this.controller,
    this.placeholder,
    this.disabled = false,
    this.onSubmitted,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return TextField(
      controller: controller,
      enabled: !disabled,
      onSubmitted: onSubmitted,
      textInputAction: TextInputAction.send,
      decoration: InputDecoration(
        hintText:
            placeholder ?? AppLocalizations.of(context).chatRoomTypeMessage,
        isDense: true,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(color: colors.border),
        ),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      ),
      style: const TextStyle(fontSize: 14),
    );
  }
}

class ComposerIconButton extends StatelessWidget {
  final IconData icon;
  final String tooltip;
  final bool disabled;
  final bool loading;
  final VoidCallback? onPressed;

  const ComposerIconButton({
    super.key,
    required this.icon,
    required this.tooltip,
    this.disabled = false,
    this.loading = false,
    this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    if (loading) {
      return const Padding(
        padding: EdgeInsets.all(8),
        child: SizedBox(
          width: 18,
          height: 18,
          child: CircularProgressIndicator(strokeWidth: 2),
        ),
      );
    }

    return IconButton(
      icon: Icon(icon, size: 22, color: colors.fgMuted),
      onPressed: disabled ? null : onPressed,
      tooltip: tooltip,
    );
  }
}

class SendButton extends StatelessWidget {
  final VoidCallback? onClick;
  final bool disabled;
  final String? label;

  const SendButton({
    super.key,
    this.onClick,
    this.disabled = false,
    this.label,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return IconButton(
      icon: Icon(
        Icons.send,
        color: disabled ? colors.fgMuted : colors.brand,
      ),
      onPressed: disabled ? null : onClick,
      tooltip: label ?? AppLocalizations.of(context).chatRoomSend,
    );
  }
}
