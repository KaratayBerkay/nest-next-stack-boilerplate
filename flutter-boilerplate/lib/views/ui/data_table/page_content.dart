import 'package:flutter/material.dart' hide Badge;

import '../../../components/ui/badge/badge.dart';
import '../../../components/ui/data_table/data_table.dart';

class _Invoice {
  final String id;
  final String customer;
  final String email;
  final double amount;
  final String status;

  const _Invoice({
    required this.id,
    required this.customer,
    required this.email,
    required this.amount,
    required this.status,
  });
}

const _invoices = [
  _Invoice(
    id: 'INV001',
    customer: 'Alice Johnson',
    email: 'alice@example.com',
    amount: 250,
    status: 'paid',
  ),
  _Invoice(
    id: 'INV002',
    customer: 'Bob Smith',
    email: 'bob@example.com',
    amount: 150,
    status: 'pending',
  ),
  _Invoice(
    id: 'INV003',
    customer: 'Carol White',
    email: 'carol@example.com',
    amount: 350,
    status: 'overdue',
  ),
  _Invoice(
    id: 'INV004',
    customer: 'David Brown',
    email: 'david@example.com',
    amount: 450,
    status: 'paid',
  ),
  _Invoice(
    id: 'INV005',
    customer: 'Eve Davis',
    email: 'eve@example.com',
    amount: 550,
    status: 'paid',
  ),
  _Invoice(
    id: 'INV006',
    customer: 'Frank Wilson',
    email: 'frank@example.com',
    amount: 200,
    status: 'pending',
  ),
  _Invoice(
    id: 'INV007',
    customer: 'Grace Lee',
    email: 'grace@example.com',
    amount: 300,
    status: 'paid',
  ),
  _Invoice(
    id: 'INV008',
    customer: 'Henry Taylor',
    email: 'henry@example.com',
    amount: 175,
    status: 'overdue',
  ),
];

const _statusVariant = {
  'paid': BadgeVariant.success,
  'pending': BadgeVariant.warning,
  'overdue': BadgeVariant.danger,
};

List<DataTableColumn<_Invoice>> _columns() => [
      DataTableColumn(
        header: 'Invoice',
        cellBuilder: (i) => Text(i.id),
        sortValue: (i) => i.id,
      ),
      DataTableColumn(
        header: 'Customer',
        cellBuilder: (i) => Text(i.customer),
        sortValue: (i) => i.customer,
      ),
      DataTableColumn(header: 'Email', cellBuilder: (i) => Text(i.email)),
      DataTableColumn(
        header: 'Amount',
        cellBuilder: (i) => Text('\$${i.amount.toStringAsFixed(2)}'),
        sortValue: (i) => i.amount,
      ),
      DataTableColumn(
        header: 'Status',
        cellBuilder: (i) => Badge(
          text: i.status,
          variant: _statusVariant[i.status] ?? BadgeVariant.default_,
        ),
      ),
    ];

class DataTableDemoPage extends StatelessWidget {
  final String lang;

  const DataTableDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text(
          'Basic',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        AppDataTable<_Invoice>(columns: _columns(), data: _invoices),
        const SizedBox(height: 24),
        const Text(
          'Searchable',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        AppDataTable<_Invoice>(
          columns: _columns(),
          data: _invoices,
          searchValue: (i) => i.customer,
          searchPlaceholder: 'Search by customer...',
        ),
      ],
    );
  }
}
