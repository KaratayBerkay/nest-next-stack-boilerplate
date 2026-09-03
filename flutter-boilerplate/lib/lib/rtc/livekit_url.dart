import '../../app_config.dart';

/// Which LiveKit server URL a room connect should use.
///
/// The backend stamps its client-facing `LIVEKIT_URL` onto every join result
/// (`joinMeeting`, `goLive`, `joinStreamAsViewer`) and onto the
/// `rtc:accepted` call frame as `livekitUrl`. Prefer that: it is the one value
/// operators actually keep in sync with the deployment. The compile-time
/// [AppConfig.livekitUrl] is only the fallback for a backend that has none
/// configured — relying on it alone is how every build silently shipped
/// pointing at `ws://localhost:7880`, the device's own loopback (MOB-034).
String resolveLivekitUrl(String? serverUrl) {
  final trimmed = serverUrl?.trim();
  if (trimmed != null && trimmed.isNotEmpty) return trimmed;
  return AppConfig.livekitUrl;
}
