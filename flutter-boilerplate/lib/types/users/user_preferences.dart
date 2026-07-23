class UserPreferences {
  final String language;
  final bool pushNotificationsEnabled;
  final bool emailNotificationsEnabled;
  final bool darkMode;
  final bool publicProfile;
  final String? timezone;

  const UserPreferences({
    this.language = 'en',
    this.pushNotificationsEnabled = true,
    this.emailNotificationsEnabled = true,
    this.darkMode = false,
    this.publicProfile = true,
    this.timezone,
  });

  factory UserPreferences.fromJson(Map<String, dynamic> json) {
    return UserPreferences(
      language: json['language'] as String? ?? 'en',
      pushNotificationsEnabled:
          json['pushNotificationsEnabled'] as bool? ?? true,
      emailNotificationsEnabled:
          json['emailNotificationsEnabled'] as bool? ?? true,
      darkMode: json['darkMode'] as bool? ?? false,
      publicProfile: json['publicProfile'] as bool? ?? true,
      timezone: json['timezone'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'language': language,
        'pushNotificationsEnabled': pushNotificationsEnabled,
        'emailNotificationsEnabled': emailNotificationsEnabled,
        'darkMode': darkMode,
        'publicProfile': publicProfile,
        'timezone': timezone,
      };
}
