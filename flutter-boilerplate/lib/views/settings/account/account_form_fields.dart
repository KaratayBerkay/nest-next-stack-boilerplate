import 'package:flutter/material.dart';

class AccountFormFields extends StatelessWidget {
  final TextEditingController nameController;
  final TextEditingController emailController;
  final TextEditingController? bioController;
  final int? bioMaxLines;

  const AccountFormFields({
    super.key,
    required this.nameController,
    required this.emailController,
    this.bioController,
    this.bioMaxLines = 3,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        TextField(
          controller: nameController,
          decoration: const InputDecoration(labelText: 'Display Name'),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: emailController,
          decoration: const InputDecoration(labelText: 'Email'),
          keyboardType: TextInputType.emailAddress,
        ),
        if (bioController != null) ...[
          const SizedBox(height: 12),
          TextField(
            controller: bioController,
            decoration: const InputDecoration(labelText: 'Bio'),
            maxLines: bioMaxLines,
          ),
        ],
      ],
    );
  }
}
