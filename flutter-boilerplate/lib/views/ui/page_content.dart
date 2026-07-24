import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../components/ui/card/card.dart';
import '../../components/ui/card/card_content.dart';
import '../../l10n/app_localizations.dart';

final _uiRoutes = <(String, IconData, String)>[
  ('Accordion', Icons.expand_more, '/v1/en/ui/accordion'),
  ('Alert', Icons.warning_amber, '/v1/en/ui/alert'),
  ('Alert Dialog', Icons.chat, '/v1/en/ui/alert-dialog'),
  ('Aspect Ratio', Icons.aspect_ratio, '/v1/en/ui/aspect-ratio'),
  ('Avatar', Icons.face, '/v1/en/ui/avatar'),
  ('Badge', Icons.circle_notifications, '/v1/en/ui/badge'),
  ('Breadcrumb', Icons.arrow_right, '/v1/en/ui/breadcrumb'),
  ('Button', Icons.smart_button, '/v1/en/ui/button'),
  ('Calendar', Icons.calendar_month, '/v1/en/ui/calendar'),
  ('Card', Icons.credit_card, '/v1/en/ui/card'),
  ('Carousel', Icons.view_carousel, '/v1/en/ui/carousel'),
  ('Checkbox', Icons.check_box, '/v1/en/ui/checkbox'),
  ('Collapsible', Icons.unfold_more, '/v1/en/ui/collapsible'),
  ('Combobox', Icons.arrow_drop_down_circle, '/v1/en/ui/combobox'),
  ('Command', Icons.terminal, '/v1/en/ui/command'),
  ('Confirm Dialog', Icons.check_circle_outline, '/v1/en/ui/confirm-dialog'),
  ('Context Menu', Icons.more_vert, '/v1/en/ui/context-menu'),
  ('Counter', Icons.add_circle_outline, '/v1/en/ui/counter'),
  ('Date Picker', Icons.date_range, '/v1/en/ui/date-picker'),
  ('Dialog', Icons.open_in_new, '/v1/en/ui/dialog'),
  ('Drawer', Icons.menu_open, '/v1/en/ui/drawer'),
  ('Dropdown', Icons.arrow_drop_down, '/v1/en/ui/dropdown'),
  ('Dropdown Menu', Icons.arrow_drop_down_circle, '/v1/en/ui/dropdown-menu'),
  ('Empty', Icons.inbox, '/v1/en/ui/empty'),
  ('Error Boundary', Icons.error_outline, '/v1/en/ui/error-boundary'),
  ('File Upload', Icons.upload_file, '/v1/en/ui/file-upload'),
  ('Form Error Banner', Icons.flag, '/v1/en/ui/form-error-banner'),
  ('Form Field Info', Icons.info_outline, '/v1/en/ui/form-field-info'),
  ('Hover Card', Icons.mouse, '/v1/en/ui/hover-card'),
  ('Image Upload', Icons.image, '/v1/en/ui/image-upload'),
  ('Input', Icons.edit, '/v1/en/ui/input'),
  ('Input Group', Icons.input, '/v1/en/ui/input-group'),
  ('Input OTP', Icons.pin, '/v1/en/ui/input-otp'),
  ('Kbd', Icons.keyboard, '/v1/en/ui/kbd'),
  ('Label', Icons.label, '/v1/en/ui/label'),
  ('Logo Spinner', Icons.hourglass_top, '/v1/en/ui/logo-spinner'),
  ('Menubar', Icons.menu, '/v1/en/ui/menubar'),
  ('Native Select', Icons.language, '/v1/en/ui/native-select'),
  ('Navigation Menu', Icons.navigation, '/v1/en/ui/navigation-menu'),
  ('Pagination', Icons.more_horiz, '/v1/en/ui/pagination'),
  ('Popover', Icons.open_in_new, '/v1/en/ui/popover'),
  ('Progress', Icons.hourglass_bottom, '/v1/en/ui/progress'),
  ('Radio Group', Icons.radio_button_checked, '/v1/en/ui/radio-group'),
  ('Resizable', Icons.drag_indicator, '/v1/en/ui/resizable'),
  ('Scroll Area', Icons.swap_vert, '/v1/en/ui/scroll-area'),
  (
    'Scroll To Bottom',
    Icons.vertical_align_bottom,
    '/v1/en/ui/scroll-to-bottom-button'
  ),
  ('Select', Icons.list, '/v1/en/ui/select'),
  ('Separator', Icons.horizontal_rule, '/v1/en/ui/separator'),
  ('Sheet', Icons.article, '/v1/en/ui/sheet'),
  ('Skeleton', Icons.view_week, '/v1/en/ui/skeleton'),
  ('Slider', Icons.tune, '/v1/en/ui/slider'),
  ('Spinner', Icons.sync, '/v1/en/ui/spinner'),
  ('Step Indicator', Icons.layers, '/v1/en/ui/step-indicator'),
  ('Switch', Icons.toggle_on, '/v1/en/ui/switch'),
  ('Table', Icons.table_chart, '/v1/en/ui/table'),
  ('Tabs', Icons.tab, '/v1/en/ui/tabs'),
  ('Textarea', Icons.text_fields, '/v1/en/ui/textarea'),
  ('Time Input', Icons.schedule, '/v1/en/ui/time-input'),
  ('Toast', Icons.notifications, '/v1/en/ui/toast'),
  ('Toggle', Icons.toggle_off, '/v1/en/ui/toggle'),
  ('Toggle Group', Icons.toggle_on, '/v1/en/ui/toggle-group'),
  ('Tooltip', Icons.info_outline, '/v1/en/ui/tooltip'),
  ('Typography', Icons.text_fields, '/v1/en/ui/typography'),
];

class UiPageContent extends StatelessWidget {
  final String lang;

  const UiPageContent({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.uiPageTitle)),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Wrap(
          spacing: 12,
          runSpacing: 12,
          children: _uiRoutes.map((r) {
            final name = r.$1;
            final icon = r.$2;
            final route = r.$3;
            return SizedBox(
              width: 150,
              child: CardWidget(
                child: CardContent(
                  child: InkWell(
                    onTap: () => context.push(route),
                    borderRadius: BorderRadius.circular(8),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      child: Column(
                        children: [
                          Icon(icon, size: 28),
                          const SizedBox(height: 8),
                          Text(
                            name,
                            textAlign: TextAlign.center,
                            style: const TextStyle(fontSize: 12),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      ),
    );
  }
}
