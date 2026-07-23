class TableColumn {
  final String label;
  final bool numeric;
  final double flex;

  const TableColumn({
    required this.label,
    this.numeric = false,
    this.flex = 1,
  });
}

const tableColumns = [
  TableColumn(label: 'Item', flex: 3),
  TableColumn(label: 'Qty', numeric: true, flex: 1),
  TableColumn(label: 'Price', numeric: true, flex: 2),
  TableColumn(label: 'Total', numeric: true, flex: 1),
];

const emptyRowData = {
  'item': '',
  'quantity': 1,
  'price': 0.0,
};

const double defaultTaxRate = 0.08;
const int maxTableRows = 50;
