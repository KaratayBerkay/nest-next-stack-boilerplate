import 'package:intl/intl.dart';
import 'package:timezone/timezone.dart' as tz;

/// Date/time formatting for the whole app.
///
/// CROSS-019: the profile's timezone (Settings → General) used to be stored
/// and read back only to pre-fill that dropdown — every timestamp still
/// rendered in the device zone. Every wall-clock formatter here now converts
/// into the preferred zone first (see [setPreferredTimeZone], wired from the
/// app root's profile listener and the settings save). With no preference
/// set, behaviour is unchanged: device-local time.
class DateTimeHelper {
  DateTimeHelper._();

  static tz.Location? _location;

  /// The IANA zone currently applied, or null for device-local.
  static String? get preferredTimeZone => _location?.name;

  /// Apply (or clear, with null/unknown) the profile timezone. Requires the
  /// tz database to be initialised once at startup (see main.dart).
  static void setPreferredTimeZone(String? name) {
    if (name == null || name.isEmpty) {
      _location = null;
      return;
    }
    try {
      _location = tz.getLocation(name);
    } on tz.LocationNotFoundException {
      _location = null;
    } catch (_) {
      // tz database not initialised (tests, or a very early call) — fall
      // back to device-local rather than crashing a formatter.
      _location = null;
    }
  }

  /// The instant [date] expressed in the preferred zone (device-local when
  /// no preference is set).
  static DateTime inPreferredZone(DateTime date) {
    final location = _location;
    if (location == null) return date.isUtc ? date.toLocal() : date;
    return tz.TZDateTime.from(date, location);
  }

  static String format(DateTime date, {String? format}) {
    return DateFormat(format ?? 'MMM d, yyyy').format(inPreferredZone(date));
  }

  static String formatTime(DateTime date) {
    return DateFormat('h:mm a').format(inPreferredZone(date));
  }

  static String formatDateTime(DateTime date) {
    return DateFormat('MMM d, yyyy h:mm a').format(inPreferredZone(date));
  }

  static String relative(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);

    if (diff.inSeconds < 60) return 'just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays < 7) return '${diff.inDays}d ago';
    return format(date);
  }

  /// Calendar-day comparison in the preferred zone — what a chat's "Today"
  /// separator means to someone whose profile zone differs from the device.
  static bool isSameDay(DateTime a, DateTime b) {
    final pa = inPreferredZone(a);
    final pb = inPreferredZone(b);
    return pa.year == pb.year && pa.month == pb.month && pa.day == pb.day;
  }

  static DateTime startOfDay(DateTime date) {
    return DateTime(date.year, date.month, date.day);
  }

  static DateTime endOfDay(DateTime date) {
    return DateTime(date.year, date.month, date.day, 23, 59, 59, 999);
  }
}
