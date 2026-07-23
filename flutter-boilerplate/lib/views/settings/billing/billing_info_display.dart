import 'package:flutter/material.dart';

import '../../../constants/theme.dart';

class BillingInfoDisplay extends StatelessWidget {
  final String? name;
  final String? email;
  final String? addressLine1;
  final String? addressLine2;
  final String? city;
  final String? state;
  final String? zip;
  final String? country;

  const BillingInfoDisplay({
    super.key,
    this.name,
    this.email,
    this.addressLine1,
    this.addressLine2,
    this.city,
    this.state,
    this.zip,
    this.country,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (name != null) ...[
          Text(name!, style: const TextStyle(fontWeight: FontWeight.w500)),
          const SizedBox(height: 4),
        ],
        if (email != null)
          Text(email!, style: TextStyle(color: colors.fgMuted, fontSize: 13)),
        if (addressLine1 != null) ...[
          const SizedBox(height: 8),
          Text(addressLine1!, style: TextStyle(color: colors.fgMuted, fontSize: 13)),
        ],
        if (addressLine2 != null)
          Text(addressLine2!, style: TextStyle(color: colors.fgMuted, fontSize: 13)),
        if (city != null || state != null || zip != null)
          Text(
            [city, state, zip].where((s) => s != null && s.isNotEmpty).join(', '),
            style: TextStyle(color: colors.fgMuted, fontSize: 13),
          ),
        if (country != null)
          Text(country!, style: TextStyle(color: colors.fgMuted, fontSize: 13)),
      ],
    );
  }
}
