import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../components/ui/card/card.dart';
import '../../components/ui/card/card_content.dart';

final _componentList = [
  ('Accordion', '/v1/en/ui/accordion'),
  ('Alert', '/v1/en/ui/alert'),
  ('Alert Dialog', '/v1/en/ui/alert-dialog'),
  ('Aspect Ratio', '/v1/en/ui/aspect-ratio'),
  ('Avatar', '/v1/en/ui/avatar'),
  ('Badge', '/v1/en/ui/badge'),
  ('Breadcrumb', '/v1/en/ui/breadcrumb'),
  ('Button', '/v1/en/ui/button'),
  ('Calendar', '/v1/en/ui/calendar'),
  ('Card', '/v1/en/ui/card'),
  ('Carousel', '/v1/en/ui/carousel'),
  ('Checkbox', '/v1/en/ui/checkbox'),
  ('Collapsible', '/v1/en/ui/collapsible'),
  ('Combobox', '/v1/en/ui/combobox'),
  ('Command', '/v1/en/ui/command'),
  ('Confirm Dialog', '/v1/en/ui/confirm-dialog'),
  ('Context Menu', '/v1/en/ui/context-menu'),
  ('Counter', '/v1/en/ui/counter'),
  ('Date Picker', '/v1/en/ui/date-picker'),
  ('Dialog', '/v1/en/ui/dialog'),
  ('Drawer', '/v1/en/ui/drawer'),
  ('Dropdown', '/v1/en/ui/dropdown'),
  ('Dropdown Menu', '/v1/en/ui/dropdown-menu'),
  ('Empty', '/v1/en/ui/empty'),
  ('Error Boundary', '/v1/en/ui/error-boundary'),
  ('File Upload', '/v1/en/ui/file-upload'),
  ('Form Error Banner', '/v1/en/ui/form-error-banner'),
  ('Form Field Info', '/v1/en/ui/form-field-info'),
  ('Hover Card', '/v1/en/ui/hover-card'),
  ('Image Upload', '/v1/en/ui/image-upload'),
  ('Input Group', '/v1/en/ui/input-group'),
  ('Input OTP', '/v1/en/ui/input-otp'),
  ('Kbd', '/v1/en/ui/kbd'),
  ('Label', '/v1/en/ui/label'),
  ('Logo Spinner', '/v1/en/ui/logo-spinner'),
  ('Menubar', '/v1/en/ui/menubar'),
  ('Native Select', '/v1/en/ui/native-select'),
  ('Navigation Menu', '/v1/en/ui/navigation-menu'),
  ('Pagination', '/v1/en/ui/pagination'),
  ('Popover', '/v1/en/ui/popover'),
  ('Progress', '/v1/en/ui/progress'),
  ('Radio Group', '/v1/en/ui/radio-group'),
  ('Resizable', '/v1/en/ui/resizable'),
  ('Scroll Area', '/v1/en/ui/scroll-area'),
  ('Scroll To Bottom Button', '/v1/en/ui/scroll-to-bottom-button'),
  ('Select', '/v1/en/ui/select'),
  ('Separator', '/v1/en/ui/separator'),
  ('Sheet', '/v1/en/ui/sheet'),
  ('Skeleton', '/v1/en/ui/skeleton'),
  ('Slider', '/v1/en/ui/slider'),
  ('Spinner', '/v1/en/ui/spinner'),
  ('Step Indicator', '/v1/en/ui/step-indicator'),
  ('Switch', '/v1/en/ui/switch'),
  ('Tabs', '/v1/en/ui/tabs'),
  ('Textarea', '/v1/en/ui/textarea'),
  ('Time Input', '/v1/en/ui/time-input'),
  ('Toast', '/v1/en/ui/toast'),
  ('Toggle', '/v1/en/ui/toggle'),
  ('Toggle Group', '/v1/en/ui/toggle-group'),
  ('Tooltip', '/v1/en/ui/tooltip'),
  ('Typography', '/v1/en/ui/typography'),
];

class DemosPageContent extends ConsumerWidget {
  final String lang;

  const DemosPageContent({super.key, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: const Text('UI Components')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Wrap(
          spacing: 12,
          runSpacing: 12,
          children: _componentList.map((c) {
            final name = c.$1;
            final route = c.$2;
            return SizedBox(
              width: 160,
              child: CardWidget(
                child: CardContent(
                  child: InkWell(
                    onTap: () => context.push(route),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      child: Text(name, textAlign: TextAlign.center),
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
