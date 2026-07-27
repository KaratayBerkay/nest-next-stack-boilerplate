import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/lib/tier_view.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../api/client/profile/actions.dart';
import '../../../api/client/profile/query.dart';
import '../../../components/settings/theme_picker.dart';
import '../../../components/ui/button/button.dart';
import '../../../components/ui/toast/toast.dart';
import '../../../constants/i18n.dart';
import '../../../constants/theme.dart';
import '../../../hooks/use_currency.dart';
import '../../../hooks/use_date_display.dart';
import '../../../hooks/use_theme.dart';
import '../../../l10n/app_localizations.dart';
import '../settings_shell.dart';

const _timezones = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Istanbul',
  'Europe/Moscow',
  'Asia/Dubai',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Kolkata',
  'Australia/Sydney',
  'Pacific/Auckland',
];

const _currencies = ['USD', 'EUR', 'GBP', 'TRY', 'JPY', 'AUD'];

const _dateDisplayOptions = ['Long', 'ISO', 'Short'];

String _previewDate(String format) {
  final now = DateTime.now();
  switch (format) {
    case 'Long':
      const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      return '${months[now.month - 1]} ${now.day}, ${now.year}';
    case 'ISO':
      return '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';
    case 'Short':
      return '${now.month.toString().padLeft(2, '0')}/${now.day.toString().padLeft(2, '0')}/${now.year}';
    default:
      return '';
  }
}

class SettingsGeneralPageContent extends ConsumerWidget {
  final String lang;

  const SettingsGeneralPageContent({super.key, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return SettingsShellScaffold(
      lang: lang,
      child: TierGate(
        freeWidget: _GeneralSettings(lang: lang),
        basicWidget: _GeneralSettings(lang: lang),
        mediumWidget: _GeneralSettings(lang: lang),
        premiumWidget: _GeneralSettings(lang: lang),
      ),
    );
  }
}

class _GeneralSettings extends ConsumerStatefulWidget {
  final String lang;

  const _GeneralSettings({required this.lang});

  @override
  ConsumerState<_GeneralSettings> createState() => _GeneralSettingsState();
}

class _GeneralSettingsState extends ConsumerState<_GeneralSettings> {
  late String _stagedLocale;
  String _stagedTimezone = '';
  late String _stagedCurrency;
  late String _stagedDateDisplay;
  bool _saving = false;
  bool _currencyTouched = false;
  bool _dateDisplayTouched = false;

  @override
  void initState() {
    super.initState();
    _stagedLocale = ref.read(localeProvider);
    _stagedCurrency = ref.read(currencyProvider);
    _stagedDateDisplay = ref.read(dateDisplayProvider);
    final profile = ref.read(userProfileProvider).asData?.value;
    if (profile?.timezone != null) _stagedTimezone = profile!.timezone!;
  }

  void _syncFromProviders() {
    final tz = ref.watch(userProfileProvider).asData?.value.timezone;
    if (tz != null && _stagedTimezone.isEmpty) {
      _stagedTimezone = tz;
    }
    ref.listen<String>(currencyProvider, (prev, next) {
      if (!_currencyTouched) setState(() => _stagedCurrency = next);
    });
    ref.listen<String>(dateDisplayProvider, (prev, next) {
      if (!_dateDisplayTouched) setState(() => _stagedDateDisplay = next);
    });
  }

  Future<void> _save() async {
    setState(() => _saving = true);
    try {
      if (_stagedLocale != ref.read(localeProvider) ||
          _stagedTimezone.isNotEmpty) {
        await ref.read(profileActionsProvider).update(
              locale: _stagedLocale,
              timezone: _stagedTimezone,
            );
        ref.read(localeProvider.notifier).setLocale(_stagedLocale);
      }
      await ref.read(currencyProvider.notifier).setCurrency(_stagedCurrency);
      await ref
          .read(dateDisplayProvider.notifier)
          .setDateDisplay(_stagedDateDisplay);
      if (mounted) showToast(context, 'Settings saved');
    } catch (e) {
      if (mounted) showToast(context, 'Failed: $e');
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final t = AppLocalizations.of(context);
    _syncFromProviders();

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Card(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Padding(
                padding: EdgeInsets.fromLTRB(16, 16, 16, 12),
                child: ThemePicker(),
              ),
              const Divider(height: 1),
              ListTile(
                title: Text(t.settingsLanguage),
                subtitle: Text(
                  _stagedLocale.toUpperCase(),
                  style: TextStyle(color: colors.fgMuted, fontSize: 12),
                ),
                trailing: DropdownButton<String>(
                  value: _stagedLocale,
                  items: I18nConstants.supportedLangs
                      .map(
                        (String l) => DropdownMenuItem<String>(
                          value: l,
                          child: Text(l.toUpperCase()),
                        ),
                      )
                      .toList(),
                  onChanged: (String? v) {
                    if (v != null) {
                      setState(() => _stagedLocale = v);
                    }
                  },
                  underline: const SizedBox(),
                ),
              ),
              const Divider(height: 1),
              ListTile(
                title: const Text('Timezone'),
                subtitle: Text(
                  _stagedTimezone.isEmpty ? 'Select timezone' : _stagedTimezone,
                  style: TextStyle(color: colors.fgMuted, fontSize: 12),
                ),
                trailing: DropdownButton<String>(
                  value: _timezones.contains(_stagedTimezone)
                      ? _stagedTimezone
                      : null,
                  items: _timezones
                      .map(
                        (tz) => DropdownMenuItem<String>(
                          value: tz,
                          child: Text(tz),
                        ),
                      )
                      .toList(),
                  onChanged: (String? v) {
                    if (v != null) {
                      setState(() => _stagedTimezone = v);
                    }
                  },
                  underline: const SizedBox(),
                ),
              ),
              const Divider(height: 1),
              ListTile(
                title: const Text('Currency'),
                subtitle: Text(
                  _stagedCurrency,
                  style: TextStyle(color: colors.fgMuted, fontSize: 12),
                ),
                trailing: DropdownButton<String>(
                  value: _stagedCurrency,
                  items: _currencies
                      .map(
                        (c) => DropdownMenuItem<String>(
                          value: c,
                          child: Text(c),
                        ),
                      )
                      .toList(),
                  onChanged: (String? v) {
                    if (v != null) {
                      setState(() {
                        _stagedCurrency = v;
                        _currencyTouched = true;
                      });
                    }
                  },
                  underline: const SizedBox(),
                ),
              ),
              const Divider(height: 1),
              ListTile(
                title: const Text('Date display'),
                subtitle: Text(
                  _previewDate(_stagedDateDisplay),
                  style: TextStyle(color: colors.fgMuted, fontSize: 12),
                ),
                trailing: DropdownButton<String>(
                  value: _stagedDateDisplay,
                  items: _dateDisplayOptions
                      .map(
                        (d) => DropdownMenuItem<String>(
                          value: d,
                          child: Text(d),
                        ),
                      )
                      .toList(),
                  onChanged: (String? v) {
                    if (v != null) {
                      setState(() {
                        _stagedDateDisplay = v;
                        _dateDisplayTouched = true;
                      });
                    }
                  },
                  underline: const SizedBox(),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        Button(
          onPressed: _saving ? null : _save,
          child: Text(_saving ? 'Saving...' : 'Save'),
        ),
      ],
    );
  }
}
