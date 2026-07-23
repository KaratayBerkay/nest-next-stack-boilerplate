import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../components/ui/card/card.dart';
import '../../components/ui/card/card_content.dart';

final _formRoutes = <(String, String, IconData)>[
  ('Advanced', '/v1/en/forms/advanced', Icons.tune),
  ('API Key', '/v1/en/forms/api-key', Icons.vpn_key),
  ('Billing', '/v1/en/forms/billing', Icons.receipt),
  ('Checkout', '/v1/en/forms/checkout', Icons.shopping_cart),
  ('Content Editor', '/v1/en/forms/content-editor', Icons.edit_note),
  ('Editable Table', '/v1/en/forms/editable-table', Icons.table_chart),
  ('Elements', '/v1/en/forms/elements', Icons.widgets),
  ('Error Lab', '/v1/en/forms/error-lab', Icons.bug_report),
  ('Field States', '/v1/en/forms/field-states', Icons.toggle_on),
  ('Filters', '/v1/en/forms/filters', Icons.filter_list),
  ('Form Builder', '/v1/en/forms/form-builder', Icons.dynamic_form),
  ('Layouts', '/v1/en/forms/layouts', Icons.grid_view),
  ('Profile', '/v1/en/forms/profile', Icons.person),
  ('Team Invite', '/v1/en/forms/team-invite', Icons.group_add),
  ('Uploads', '/v1/en/forms/uploads', Icons.upload_file),
];

class FormsPageContent extends ConsumerWidget {
  final String lang;

  const FormsPageContent({super.key, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: const Text('Forms Demo')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Wrap(
          spacing: 12,
          runSpacing: 12,
          children: _formRoutes.map((f) {
            final name = f.$1;
            final route = f.$2;
            final icon = f.$3;
            return SizedBox(
              width: 160,
              child: CardWidget(
                child: CardContent(
                  child: InkWell(
                    onTap: () => context.push(route),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      child: Column(
                        children: [
                          Icon(icon, size: 28),
                          const SizedBox(height: 8),
                          Text(name, textAlign: TextAlign.center),
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
