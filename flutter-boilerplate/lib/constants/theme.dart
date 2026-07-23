import 'package:flutter/material.dart';

enum AppThemeMode { light, dark }

class AppColors extends ThemeExtension<AppColors> {
  final Color brand;
  final Color brandHover;
  final Color surface;
  final Color surfaceAlt;
  final Color surfaceHover;
  final Color fg;
  final Color fgMuted;
  final Color border;
  final Color danger;
  final Color success;
  final Color warning;
  final Color info;

  const AppColors({
    required this.brand,
    required this.brandHover,
    required this.surface,
    required this.surfaceAlt,
    required this.surfaceHover,
    required this.fg,
    required this.fgMuted,
    required this.border,
    required this.danger,
    required this.success,
    required this.warning,
    required this.info,
  });

  static const light = AppColors(
    brand: Color(0xFF6366F1),
    brandHover: Color(0xFF4F46E5),
    surface: Color(0xFFFFFFFF),
    surfaceAlt: Color(0xFFF9FAFB),
    surfaceHover: Color(0xFFF3F4F6),
    fg: Color(0xFF111827),
    fgMuted: Color(0xFF6B7280),
    border: Color(0xFFE5E7EB),
    danger: Color(0xFFEF4444),
    success: Color(0xFF10B981),
    warning: Color(0xFFF59E0B),
    info: Color(0xFF3B82F6),
  );

  static const dark = AppColors(
    brand: Color(0xFF818CF8),
    brandHover: Color(0xFF6366F1),
    surface: Color(0xFF111827),
    surfaceAlt: Color(0xFF1F2937),
    surfaceHover: Color(0xFF374151),
    fg: Color(0xFFF9FAFB),
    fgMuted: Color(0xFF9CA3AF),
    border: Color(0xFF374151),
    danger: Color(0xFFFCA5A5),
    success: Color(0xFF6EE7B7),
    warning: Color(0xFFFCD34D),
    info: Color(0xFF93C5FD),
  );

  @override
  AppColors copyWith({
    Color? brand,
    Color? brandHover,
    Color? surface,
    Color? surfaceAlt,
    Color? surfaceHover,
    Color? fg,
    Color? fgMuted,
    Color? border,
    Color? danger,
    Color? success,
    Color? warning,
    Color? info,
  }) {
    return AppColors(
      brand: brand ?? this.brand,
      brandHover: brandHover ?? this.brandHover,
      surface: surface ?? this.surface,
      surfaceAlt: surfaceAlt ?? this.surfaceAlt,
      surfaceHover: surfaceHover ?? this.surfaceHover,
      fg: fg ?? this.fg,
      fgMuted: fgMuted ?? this.fgMuted,
      border: border ?? this.border,
      danger: danger ?? this.danger,
      success: success ?? this.success,
      warning: warning ?? this.warning,
      info: info ?? this.info,
    );
  }

  @override
  AppColors lerp(AppColors? other, double t) {
    if (other == null) return this;
    return AppColors(
      brand: Color.lerp(brand, other.brand, t)!,
      brandHover: Color.lerp(brandHover, other.brandHover, t)!,
      surface: Color.lerp(surface, other.surface, t)!,
      surfaceAlt: Color.lerp(surfaceAlt, other.surfaceAlt, t)!,
      surfaceHover: Color.lerp(surfaceHover, other.surfaceHover, t)!,
      fg: Color.lerp(fg, other.fg, t)!,
      fgMuted: Color.lerp(fgMuted, other.fgMuted, t)!,
      border: Color.lerp(border, other.border, t)!,
      danger: Color.lerp(danger, other.danger, t)!,
      success: Color.lerp(success, other.success, t)!,
      warning: Color.lerp(warning, other.warning, t)!,
      info: Color.lerp(info, other.info, t)!,
    );
  }

  static AppColors of(BuildContext context) {
    return Theme.of(context).extension<AppColors>() ?? light;
  }
}

class AppTypography extends ThemeExtension<AppTypography> {
  final TextStyle h1;
  final TextStyle h2;
  final TextStyle h3;
  final TextStyle h4;
  final TextStyle body;
  final TextStyle bodySmall;
  final TextStyle caption;
  final TextStyle code;
  final TextStyle label;

  const AppTypography({
    required this.h1,
    required this.h2,
    required this.h3,
    required this.h4,
    required this.body,
    required this.bodySmall,
    required this.caption,
    required this.code,
    required this.label,
  });

  static const light = AppTypography(
    h1: TextStyle(fontSize: 32, fontWeight: FontWeight.w700, height: 1.2),
    h2: TextStyle(fontSize: 24, fontWeight: FontWeight.w700, height: 1.25),
    h3: TextStyle(fontSize: 20, fontWeight: FontWeight.w600, height: 1.3),
    h4: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, height: 1.35),
    body: TextStyle(fontSize: 14, fontWeight: FontWeight.w400, height: 1.5),
    bodySmall: TextStyle(fontSize: 12, fontWeight: FontWeight.w400, height: 1.5),
    caption: TextStyle(fontSize: 11, fontWeight: FontWeight.w400, height: 1.4),
    code: TextStyle(fontSize: 13, fontWeight: FontWeight.w400, fontFamily: 'monospace', height: 1.5),
    label: TextStyle(fontSize: 13, fontWeight: FontWeight.w500, height: 1.4),
  );

  static const dark = light;

  @override
  AppTypography copyWith({
    TextStyle? h1,
    TextStyle? h2,
    TextStyle? h3,
    TextStyle? h4,
    TextStyle? body,
    TextStyle? bodySmall,
    TextStyle? caption,
    TextStyle? code,
    TextStyle? label,
  }) {
    return AppTypography(
      h1: h1 ?? this.h1,
      h2: h2 ?? this.h2,
      h3: h3 ?? this.h3,
      h4: h4 ?? this.h4,
      body: body ?? this.body,
      bodySmall: bodySmall ?? this.bodySmall,
      caption: caption ?? this.caption,
      code: code ?? this.code,
      label: label ?? this.label,
    );
  }

  @override
  AppTypography lerp(AppTypography? other, double t) {
    if (other == null) return this;
    return AppTypography(
      h1: TextStyle.lerp(h1, other.h1, t)!,
      h2: TextStyle.lerp(h2, other.h2, t)!,
      h3: TextStyle.lerp(h3, other.h3, t)!,
      h4: TextStyle.lerp(h4, other.h4, t)!,
      body: TextStyle.lerp(body, other.body, t)!,
      bodySmall: TextStyle.lerp(bodySmall, other.bodySmall, t)!,
      caption: TextStyle.lerp(caption, other.caption, t)!,
      code: TextStyle.lerp(code, other.code, t)!,
      label: TextStyle.lerp(label, other.label, t)!,
    );
  }

  static AppTypography of(BuildContext context) {
    return Theme.of(context).extension<AppTypography>() ?? light;
  }
}

ThemeData buildThemeData(AppThemeMode mode) {
  final isLight = mode == AppThemeMode.light;
  final colors = isLight ? AppColors.light : AppColors.dark;
  final typography = isLight ? AppTypography.light : AppTypography.dark;

  final colorScheme = isLight
      ? ColorScheme.light(
          primary: colors.brand,
          onPrimary: colors.surface,
          secondary: colors.brandHover,
          surface: colors.surface,
          onSurface: colors.fg,
          error: colors.danger,
        )
      : ColorScheme.dark(
          primary: colors.brand,
          onPrimary: colors.surface,
          secondary: colors.brandHover,
          surface: colors.surface,
          onSurface: colors.fg,
          error: colors.danger,
        );

  return ThemeData(
    useMaterial3: true,
    brightness: isLight ? Brightness.light : Brightness.dark,
    colorScheme: colorScheme,
    extensions: [colors, typography],
    scaffoldBackgroundColor: colors.surface,
    appBarTheme: AppBarTheme(
      backgroundColor: colors.surface,
      foregroundColor: colors.fg,
      elevation: 0,
      scrolledUnderElevation: 1,
    ),
    cardTheme: CardThemeData(
      color: colors.surfaceAlt,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
        side: BorderSide(color: colors.border, width: 1),
      ),
    ),
    dividerTheme: DividerThemeData(color: colors.border, thickness: 1),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: colors.surface,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(6),
        borderSide: BorderSide(color: colors.border),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(6),
        borderSide: BorderSide(color: colors.border),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(6),
        borderSide: BorderSide(color: colors.brand, width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(6),
        borderSide: BorderSide(color: colors.danger),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: colors.brand,
        foregroundColor: colors.surface,
        elevation: 0,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
      ),
    ),
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(foregroundColor: colors.brand),
    ),
    snackBarTheme: SnackBarThemeData(
      backgroundColor: colors.fg,
      contentTextStyle: TextStyle(color: colors.surface),
      behavior: SnackBarBehavior.floating,
    ),
    bottomNavigationBarTheme: BottomNavigationBarThemeData(
      backgroundColor: colors.surface,
      selectedItemColor: colors.brand,
      unselectedItemColor: colors.fgMuted,
    ),
    navigationRailTheme: NavigationRailThemeData(
      backgroundColor: colors.surface,
    ),
  );
}
