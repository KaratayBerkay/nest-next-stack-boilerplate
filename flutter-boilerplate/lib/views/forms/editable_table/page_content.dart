import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../components/ui/button/button.dart';
import '../../../constants/theme.dart';

class FormsEditableTablePageContent extends ConsumerStatefulWidget {
  final String lang;

  const FormsEditableTablePageContent({super.key, required this.lang});

  @override
  ConsumerState<FormsEditableTablePageContent> createState() => _FormsEditableTablePageContentState();
}

class _FormsEditableTablePageContentState extends ConsumerState<FormsEditableTablePageContent> {
  final _rows = [
    const _TableRowData(item: 'Widget A', quantity: 2, price: 19.99),
    const _TableRowData(item: 'Widget B', quantity: 1, price: 29.99),
    const _TableRowData(item: 'Widget C', quantity: 3, price: 9.99),
  ];

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final total = _rows.fold<double>(0, (sum, r) => sum + r.quantity * r.price);

    return Scaffold(
      appBar: AppBar(title: const Text('Editable Table')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: DataTable(
              columns: const [
                DataColumn(label: Text('Item')),
                DataColumn(label: Text('Qty'), numeric: true),
                DataColumn(label: Text('Price'), numeric: true),
                DataColumn(label: Text('Total'), numeric: true),
              ],
              rows: _rows.map((r) => DataRow(cells: [
                DataCell(Text(r.item)),
                DataCell(Text('${r.quantity}')),
                DataCell(Text('\$${r.price.toStringAsFixed(2)}')),
                DataCell(Text('\$${(r.quantity * r.price).toStringAsFixed(2)}')),
              ],),).toList(),
            ),
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              Text('Total: ', style: TextStyle(color: colors.fgMuted)),
              Text('\$${total.toStringAsFixed(2)}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 16),
          Button(child: const Text('Add Row'), onPressed: () {
            setState(() => _rows.add(const _TableRowData(item: 'New Item', quantity: 1, price: 0)));
          },),
        ],
      ),
    );
  }
}

class _TableRowData {
  final String item;
  final int quantity;
  final double price;

  const _TableRowData({required this.item, required this.quantity, required this.price});
}
