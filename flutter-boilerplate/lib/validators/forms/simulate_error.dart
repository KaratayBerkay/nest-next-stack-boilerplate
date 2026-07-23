class SimulateErrorValidator {
  static String? validateScenarioId(String? value) {
    if (value == null || value.isEmpty) return 'scenarioId is required';
    return null;
  }

  static String? validateDelayMs(String? value) {
    if (value == null || value.isEmpty) return null;
    final delay = int.tryParse(value);
    if (delay == null) return 'delayMs must be a number';
    if (delay < 0) return 'delayMs must be >= 0';
    if (delay > 10000) return 'delayMs must be <= 10000';
    return null;
  }

  static String? validateFailRate(String? value) {
    if (value == null || value.isEmpty) return null;
    final rate = double.tryParse(value);
    if (rate == null) return 'failRate must be a number';
    if (rate < 0 || rate > 1) return 'failRate must be between 0 and 1';
    return null;
  }
}
