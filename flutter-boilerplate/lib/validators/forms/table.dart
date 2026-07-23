class TableValidator {
  static String? validateDescription(String? value) {
    if (value == null || value.isEmpty) return 'Required';
    return null;
  }

  static String? validateQuantity(String? value) {
    if (value == null || value.isEmpty) return 'Required';
    final qty = int.tryParse(value);
    if (qty == null || qty < 1) return 'Min 1';
    return null;
  }

  static String? validateUnitPrice(String? value) {
    if (value == null || value.isEmpty) return null;
    final price = double.tryParse(value);
    if (price == null || price < 0) return 'Must be positive';
    return null;
  }

  static String? validateTaxClass(String? value) {
    if (value == null || value.isEmpty) return 'Select tax class';
    return null;
  }
}
