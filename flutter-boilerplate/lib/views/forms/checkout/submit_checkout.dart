import 'package:flutter/material.dart';

Map<String, dynamic> collectCheckoutData({
  required TextEditingController nameCtrl,
  required TextEditingController addressCtrl,
  required TextEditingController cityCtrl,
  required TextEditingController zipCtrl,
}) {
  return {
    'fullName': nameCtrl.text,
    'address': addressCtrl.text,
    'city': cityCtrl.text,
    'zip': zipCtrl.text,
  };
}

bool validateCheckoutForm(GlobalKey<FormState> formKey) {
  return formKey.currentState?.validate() ?? false;
}

void submitCheckout(
  BuildContext context,
  GlobalKey<FormState> formKey, {
  required TextEditingController nameCtrl,
  required TextEditingController addressCtrl,
  required TextEditingController cityCtrl,
  required TextEditingController zipCtrl,
}) {
  if (!validateCheckoutForm(formKey)) return;

  final data = collectCheckoutData(
    nameCtrl: nameCtrl,
    addressCtrl: addressCtrl,
    cityCtrl: cityCtrl,
    zipCtrl: zipCtrl,
  );

  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(
      content: Row(
        children: [
          const Icon(Icons.check_circle, size: 18),
          const SizedBox(width: 8),
          Text('Order placed — shipping to ${data['fullName']}'),
        ],
      ),
    ),
  );
}

void clearCheckoutForm({
  required TextEditingController nameCtrl,
  required TextEditingController addressCtrl,
  required TextEditingController cityCtrl,
  required TextEditingController zipCtrl,
}) {
  nameCtrl.clear();
  addressCtrl.clear();
  cityCtrl.clear();
  zipCtrl.clear();
}
