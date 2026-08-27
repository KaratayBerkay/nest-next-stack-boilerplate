import '../activity_logger.dart';

/// Sends RTC diagnostics through the same ActivityLogger pipeline used by the
/// app-wide Flutter exception and page telemetry.
void logRtcEvent({
  required String event,
  required String rtcKind,
  String? rtcId,
  String? roomName,
  String? mediaType,
  String? phase,
  String? exceptionType,
  Object? error,
  StackTrace? stackTrace,
  Map<String, dynamic>? metadata,
}) {
  ActivityLogger.instance.enqueue({
    'category': 'rtc',
    'event': event,
    'eventType': event,
    if (rtcKind.isNotEmpty) 'rtcKind': rtcKind,
    if (rtcId != null && rtcId.isNotEmpty) 'rtcId': rtcId,
    if (roomName != null && roomName.isNotEmpty) 'roomName': roomName,
    if (mediaType != null) 'mediaType': mediaType,
    if (phase != null) 'phase': phase,
    if (exceptionType != null) 'exceptionType': exceptionType,
    if (error != null) 'errorMessage': error.toString(),
    if (stackTrace != null) 'stack': stackTrace.toString(),
    if (metadata != null) 'metadata': metadata,
  });
}
