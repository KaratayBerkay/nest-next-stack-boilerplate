import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../constants/theme.dart';

final _formSections = <FormSection>[
  const FormSection(
    name: 'Layouts',
    items: [
      FormItem('Two Column', Icons.view_column, '/v1/en/forms/layouts'),
      FormItem('Sectioned', Icons.grid_view, '/v1/en/forms/layouts'),
      FormItem('Wizard', Icons.layers, '/v1/en/forms/layouts'),
    ],
  ),
  const FormSection(
    name: 'Elements',
    items: [
      FormItem('Input', Icons.edit, '/v1/en/forms/elements'),
      FormItem('Select', Icons.arrow_drop_down, '/v1/en/forms/elements'),
      FormItem('Checkbox', Icons.check_box, '/v1/en/forms/elements'),
      FormItem('Radio', Icons.radio_button_checked, '/v1/en/forms/elements'),
      FormItem('Toggle', Icons.toggle_on, '/v1/en/forms/elements'),
    ],
  ),
  const FormSection(
    name: 'Validation',
    items: [
      FormItem('Field States', Icons.toggle_on, '/v1/en/forms/field-states'),
      FormItem('Error Lab', Icons.bug_report, '/v1/en/forms/error-lab'),
      FormItem('Form Builder', Icons.dynamic_form, '/v1/en/forms/form-builder'),
    ],
  ),
  const FormSection(
    name: 'Advanced',
    items: [
      FormItem('API Key', Icons.vpn_key, '/v1/en/forms/api-key'),
      FormItem('Billing', Icons.receipt, '/v1/en/forms/billing'),
      FormItem('Checkout', Icons.shopping_cart, '/v1/en/forms/checkout'),
      FormItem('Uploads', Icons.upload_file, '/v1/en/forms/uploads'),
    ],
  ),
];

class FormsLayout extends StatefulWidget {
  final String lang;

  const FormsLayout({super.key, required this.lang});

  @override
  State<FormsLayout> createState() => _FormsLayoutState();
}

class _FormsLayoutState extends State<FormsLayout> with SingleTickerProviderStateMixin {
  late TabController _controller;

  @override
  void initState() {
    super.initState();
    _controller = TabController(length: _formSections.length, vsync: this);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Forms'),
        bottom: TabBar(
          controller: _controller,
          isScrollable: true,
          tabAlignment: TabAlignment.start,
          tabs: _formSections.map((s) => Tab(text: s.name)).toList(),
        ),
      ),
      body: TabBarView(
        controller: _controller,
        children: _formSections.map((s) => _buildSection(context, colors, s)).toList(),
      ),
    );
  }

  Widget _buildSection(BuildContext context, AppColors colors, FormSection section) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        ...section.items.map((item) => Card(
          margin: const EdgeInsets.only(bottom: 8),
          child: ListTile(
            leading: Icon(item.icon, color: colors.brand),
            title: Text(item.name),
            trailing: Icon(Icons.chevron_right, color: colors.fgMuted),
            onTap: () => context.push(item.route),
          ),
        ),),
      ],
    );
  }
}

class FormSection {
  final String name;
  final List<FormItem> items;

  const FormSection({required this.name, required this.items});
}

class FormItem {
  final String name;
  final IconData icon;
  final String route;

  const FormItem(this.name, this.icon, this.route);
}
