import 'package:flutter/material.dart';

class GlobalErrorPage extends StatelessWidget {
  final String message;
  final String? digest;
  final VoidCallback? onRetry;

  const GlobalErrorPage({
    super.key,
    this.message = 'Something went wrong',
    this.digest,
    this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Something went wrong',
                style: TextStyle(
                  color: Colors.red.shade700,
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                message,
                style: TextStyle(color: Colors.grey.shade600, fontSize: 14),
                textAlign: TextAlign.center,
              ),
              if (digest != null) ...[
                const SizedBox(height: 8),
                Text(
                  'Reference: $digest',
                  style: TextStyle(color: Colors.grey.shade500, fontSize: 12),
                ),
              ],
              if (onRetry != null) ...[
                const SizedBox(height: 16),
                TextButton(
                  onPressed: onRetry,
                  child: const Text('Try again'),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
