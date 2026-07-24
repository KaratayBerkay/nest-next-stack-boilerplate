import 'package:flutter_boilerplate/lib/riverpod_compat.dart';

enum DateDisplayFormat { locale, iso, relative }

final dateDisplayCookieProvider =
    StateProvider<DateDisplayFormat>((ref) => DateDisplayFormat.locale);
