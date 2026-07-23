import 'package:flutter/material.dart';
import '../../constants/theme.dart';

class AboutPageContent extends StatelessWidget {
  const AboutPageContent({super.key});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('About')),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          const Text(
            'Flutter Boilerplate',
            style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Text(
            'A production-ready Flutter mobile application',
            style: TextStyle(fontSize: 16, color: colors.fgMuted),
          ),
          const SizedBox(height: 24),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Tech Stack', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 12),
                  _TechItem(label: 'Framework', value: 'Flutter 3.x'),
                  _TechItem(label: 'State Management', value: 'Riverpod 3.x'),
                  _TechItem(label: 'Routing', value: 'GoRouter 17.x'),
                  _TechItem(label: 'HTTP Client', value: 'Dio'),
                  _TechItem(label: 'Payments', value: 'Stripe'),
                  _TechItem(label: 'Realtime', value: 'WebSocket'),
                  _TechItem(label: 'Auth', value: 'JWT + Secure Storage'),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Architecture', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 12),
                  Text(
                    'This boilerplate mirrors the Next.js web application structure '
                    'page-by-page in Flutter. It follows a two-layer API pattern '
                    '(server + client modules), tier-gated views via TierGate, '
                    'and a GoRouter-based navigation with 114+ route definitions.',
                    style: TextStyle(color: colors.fgMuted, height: 1.5),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Features', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 12),
                  _FeatureItem(text: 'Auth (login, register, MFA, password reset, email verify)'),
                  _FeatureItem(text: 'Tier-gated views (Free, Basic, Medium, Premium)'),
                  _FeatureItem(text: 'Stripe billing integration with card form'),
                  _FeatureItem(text: 'Realtime updates via WebSocket'),
                  _FeatureItem(text: 'Two-layer API pattern (server + client)'),
                  _FeatureItem(text: 'Admin panel with user search & tier management'),
                  _FeatureItem(text: 'Audit logs with filters, pagination & diff view'),
                  _FeatureItem(text: 'Premium analytics dashboard'),
                  _FeatureItem(text: 'Form validation framework'),
                  _FeatureItem(text: '60+ UI component demo pages'),
                  _FeatureItem(text: 'Settings (account, billing, sessions, API keys)'),
                  _FeatureItem(text: 'Dark/light theme support'),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _TechItem extends StatelessWidget {
  final String label;
  final String value;

  const _TechItem({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          SizedBox(
            width: 140,
            child: Text(label, style: TextStyle(color: colors.fgMuted, fontWeight: FontWeight.w500)),
          ),
          Expanded(child: Text(value)),
        ],
      ),
    );
  }
}

class _FeatureItem extends StatelessWidget {
  final String text;

  const _FeatureItem({required this.text});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.check_circle, size: 18, color: colors.success),
          const SizedBox(width: 8),
          Expanded(child: Text(text, style: TextStyle(color: colors.fgMuted))),
        ],
      ),
    );
  }
}
