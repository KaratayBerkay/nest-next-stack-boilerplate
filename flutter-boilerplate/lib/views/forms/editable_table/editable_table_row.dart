import 'package:flutter/material.dart';

import '../../../constants/theme.dart';

class EditableTableRowData {
  String item;
  int quantity;
  double price;

  EditableTableRowData({
    this.item = '',
    this.quantity = 1,
    this.price = 0.0,
  });

  double get total => quantity * price;
}

class EditableTableRow extends StatefulWidget {
  final EditableTableRowData data;
  final int index;
  final ValueChanged<EditableTableRowData> onChanged;
  final VoidCallback? onDelete;

  const EditableTableRow({
    super.key,
    required this.data,
    required this.index,
    required this.onChanged,
    this.onDelete,
  });

  @override
  State<EditableTableRow> createState() => _EditableTableRowState();
}

class _EditableTableRowState extends State<EditableTableRow> {
  late TextEditingController _itemCtrl;
  late TextEditingController _qtyCtrl;
  late TextEditingController _priceCtrl;

  @override
  void initState() {
    super.initState();
    _itemCtrl = TextEditingController(text: widget.data.item);
    _qtyCtrl = TextEditingController(text: widget.data.quantity.toString());
    _priceCtrl = TextEditingController(text: widget.data.price.toStringAsFixed(2));
    _itemCtrl.addListener(_emitChange);
    _qtyCtrl.addListener(_emitChange);
    _priceCtrl.addListener(_emitChange);
  }

  @override
  void didUpdateWidget(EditableTableRow oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.data != widget.data) {
      _itemCtrl.text = widget.data.item;
      _qtyCtrl.text = widget.data.quantity.toString();
      _priceCtrl.text = widget.data.price.toStringAsFixed(2);
    }
  }

  @override
  void dispose() {
    _itemCtrl.dispose();
    _qtyCtrl.dispose();
    _priceCtrl.dispose();
    super.dispose();
  }

  void _emitChange() {
    final data = EditableTableRowData(
      item: _itemCtrl.text,
      quantity: int.tryParse(_qtyCtrl.text) ?? 0,
      price: double.tryParse(_priceCtrl.text) ?? 0.0,
    );
    widget.onChanged(data);
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Expanded(
            flex: 3,
            child: TextField(
              controller: _itemCtrl,
              decoration: InputDecoration(
                isDense: true,
                hintText: 'Item name',
                border: OutlineInputBorder(borderSide: BorderSide(color: colors.border)),
              ),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            flex: 1,
            child: TextField(
              controller: _qtyCtrl,
              keyboardType: TextInputType.number,
              decoration: InputDecoration(
                isDense: true,
                hintText: 'Qty',
                border: OutlineInputBorder(borderSide: BorderSide(color: colors.border)),
              ),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            flex: 2,
            child: TextField(
              controller: _priceCtrl,
              keyboardType: TextInputType.number,
              decoration: InputDecoration(
                isDense: true,
                hintText: 'Price',
                prefixText: '\$ ',
                border: OutlineInputBorder(borderSide: BorderSide(color: colors.border)),
              ),
            ),
          ),
          const SizedBox(width: 8),
          SizedBox(
            width: 60,
            child: Text('\$${widget.data.total.toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.w600)),
          ),
          if (widget.onDelete != null)
            IconButton(
              icon: Icon(Icons.delete_outline, size: 18, color: colors.danger),
              onPressed: widget.onDelete,
              visualDensity: VisualDensity.compact,
            ),
        ],
      ),
    );
  }
}
