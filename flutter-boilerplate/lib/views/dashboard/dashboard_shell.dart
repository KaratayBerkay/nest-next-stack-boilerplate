import 'package:flutter/material.dart';

class DashboardShell extends StatelessWidget {
  const DashboardShell({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Dashboard')),
      body: const Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(flex: 2, child: AnalyticsPanel()),
          VerticalDivider(width: 1),
          Expanded(child: TeamPanel()),
        ],
      ),
    );
  }
}

class AnalyticsPanel extends StatelessWidget {
  const AnalyticsPanel({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text('Analytics', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
        const SizedBox(height: 16),
        _buildMetricCard('Page Views', '12,345', Icons.visibility),
        const SizedBox(height: 8),
        _buildMetricCard('Active Users', '1,234', Icons.person),
        const SizedBox(height: 8),
        _buildMetricCard('Revenue', '\$4,567', Icons.attach_money),
      ],
    );
  }

  Widget _buildMetricCard(String label, String value, IconData icon) {
    return Card(
      child: ListTile(
        leading: Icon(icon),
        title: Text(value, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w600)),
        subtitle: Text(label),
      ),
    );
  }
}

class TeamPanel extends StatelessWidget {
  const TeamPanel({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text('Team', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
        const SizedBox(height: 16),
        _buildMember('Alice', 'Developer'),
        _buildMember('Bob', 'Designer'),
        _buildMember('Charlie', 'PM'),
      ],
    );
  }

  Widget _buildMember(String name, String role) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          CircleAvatar(child: Text(name[0])),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(name, style: const TextStyle(fontWeight: FontWeight.w500)),
              Text(role, style: const TextStyle(fontSize: 12, color: Colors.grey)),
            ],
          ),
        ],
      ),
    );
  }
}
