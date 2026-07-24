import 'package:flutter/material.dart';

import '../../../constants/theme.dart';

class TablePageContent extends StatelessWidget {
  final String lang;

  const TablePageContent({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Table')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text(
            'Basic Table',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Card(
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: DataTable(
                columns: const [
                  DataColumn(
                    label: Text(
                      'Name',
                      style: TextStyle(fontWeight: FontWeight.w600),
                    ),
                  ),
                  DataColumn(
                    label: Text(
                      'Email',
                      style: TextStyle(fontWeight: FontWeight.w600),
                    ),
                  ),
                  DataColumn(
                    label: Text(
                      'Role',
                      style: TextStyle(fontWeight: FontWeight.w600),
                    ),
                  ),
                  DataColumn(
                    label: Text(
                      'Status',
                      style: TextStyle(fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
                rows: [
                  _buildRow(
                    colors,
                    'Alice Johnson',
                    'alice@example.com',
                    'Admin',
                    'Active',
                  ),
                  _buildRow(
                    colors,
                    'Bob Smith',
                    'bob@example.com',
                    'Editor',
                    'Active',
                  ),
                  _buildRow(
                    colors,
                    'Charlie Brown',
                    'charlie@example.com',
                    'Viewer',
                    'Inactive',
                  ),
                  _buildRow(
                    colors,
                    'Diana Prince',
                    'diana@example.com',
                    'Editor',
                    'Active',
                  ),
                  _buildRow(
                    colors,
                    'Eve Wilson',
                    'eve@example.com',
                    'Admin',
                    'Suspended',
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),
          const Text(
            'With Selection',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Card(
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: DataTable(
                columns: const [
                  DataColumn(
                    label: Text(
                      'ID',
                      style: TextStyle(fontWeight: FontWeight.w600),
                    ),
                  ),
                  DataColumn(
                    label: Text(
                      'Product',
                      style: TextStyle(fontWeight: FontWeight.w600),
                    ),
                  ),
                  DataColumn(
                    label: Text(
                      'Price',
                      style: TextStyle(fontWeight: FontWeight.w600),
                    ),
                  ),
                  DataColumn(
                    label: Text(
                      'Stock',
                      style: TextStyle(fontWeight: FontWeight.w600),
                    ),
                  ),
                  DataColumn(
                    label: Text(
                      'Sold',
                      style: TextStyle(fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
                rows: List.generate(8, (i) {
                  return DataRow(
                    cells: [
                      DataCell(Text('PRD-${1000 + i}')),
                      DataCell(Text('Product ${i + 1}')),
                      DataCell(Text('\$${(i + 1) * 10}.99')),
                      DataCell(Text('${(i + 1) * 50}')),
                      DataCell(Text('${(i + 1) * 20}')),
                    ],
                  );
                }),
              ),
            ),
          ),
        ],
      ),
    );
  }

  DataRow _buildRow(
    AppColors colors,
    String name,
    String email,
    String role,
    String status,
  ) {
    final statusColor = switch (status) {
      'Active' => colors.success,
      'Inactive' => colors.fgMuted,
      'Suspended' => colors.danger,
      _ => colors.fgMuted,
    };

    return DataRow(
      cells: [
        DataCell(Text(name)),
        DataCell(
          Text(email, style: TextStyle(color: colors.fgMuted, fontSize: 12)),
        ),
        DataCell(Text(role)),
        DataCell(
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: statusColor.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(999),
            ),
            child: Text(
              status,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w500,
                color: statusColor,
              ),
            ),
          ),
        ),
      ],
    );
  }
}
