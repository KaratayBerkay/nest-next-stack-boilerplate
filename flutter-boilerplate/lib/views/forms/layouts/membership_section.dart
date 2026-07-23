import 'package:flutter/material.dart';

class MembershipSection extends StatefulWidget {
  const MembershipSection({super.key});

  @override
  State<MembershipSection> createState() => _MembershipSectionState();
}

class _MembershipSectionState extends State<MembershipSection> {
  String _selected = 'free';

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Membership Type', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
        const SizedBox(height: 8),
        _tier(icon: Icons.person_outline, title: 'Free', subtitle: 'Basic access', value: 'free'),
        const SizedBox(height: 4),
        _tier(icon: Icons.star_outline, title: 'Basic', subtitle: 'Additional features', value: 'basic'),
        const SizedBox(height: 4),
        _tier(icon: Icons.workspace_premium_outlined, title: 'Premium', subtitle: 'All features included', value: 'premium'),
      ],
    );
  }

  Widget _tier({required IconData icon, required String title, required String subtitle, required String value}) {
    final selected = _selected == value;
    return InkWell(
      onTap: () => setState(() => _selected = value),
      borderRadius: BorderRadius.circular(8),
      child: Container(
        decoration: BoxDecoration(
          border: Border.all(color: selected ? Colors.indigo : Colors.grey.shade300, width: selected ? 2 : 1),
          borderRadius: BorderRadius.circular(8),
        ),
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            Icon(icon, color: selected ? Colors.indigo : Colors.grey.shade600),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: TextStyle(fontWeight: FontWeight.w500, color: selected ? Colors.indigo : null)),
                  Text(subtitle, style: TextStyle(fontSize: 12, color: Colors.grey.shade500)),
                ],
              ),
            ),
            Radio<String>(value: value, groupValue: _selected, onChanged: (v) => setState(() => _selected = v!)),
          ],
        ),
      ),
    );
  }
}
