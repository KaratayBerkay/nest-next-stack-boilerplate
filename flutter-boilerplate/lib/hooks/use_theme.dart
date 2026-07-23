import '../lib/riverpod_compat.dart';
import '../constants/theme.dart';

final themeModeProvider = StateProvider<AppThemeMode>((ref) => AppThemeMode.light);
