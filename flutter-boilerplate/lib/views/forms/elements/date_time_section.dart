import 'package:flutter/material.dart';

class DateTimeSection extends StatefulWidget {
  const DateTimeSection({super.key});

  @override
  State<DateTimeSection> createState() => _DateTimeSectionState();
}

class _DateTimeSectionState extends State<DateTimeSection> {
  DateTime? _selectedDate;
  TimeOfDay? _selectedTime;
  DateTimeRange? _dateRange;

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate ?? DateTime.now(),
      firstDate: DateTime(2020),
      lastDate: DateTime(2030),
    );
    if (picked != null) setState(() => _selectedDate = picked);
  }

  Future<void> _pickTime() async {
    final picked = await showTimePicker(
      context: context,
      initialTime: _selectedTime ?? TimeOfDay.now(),
    );
    if (picked != null) setState(() => _selectedTime = picked);
  }

  Future<void> _pickRange() async {
    final picked = await showDateRangePicker(
      context: context,
      initialDateRange: _dateRange,
      firstDate: DateTime(2020),
      lastDate: DateTime(2030),
    );
    if (picked != null) setState(() => _dateRange = picked);
  }

  @override
  Widget build(BuildContext context) {
    String fmt(DateTime d) => '${d.day}/${d.month}/${d.year}';
    String tfmt(TimeOfDay t) => '${t.hour}:${t.minute.toString().padLeft(2, '0')}';
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        OutlinedButton.icon(
          onPressed: _pickDate,
          icon: const Icon(Icons.calendar_today, size: 18),
          label: Text(_selectedDate != null ? fmt(_selectedDate!) : 'Pick Date'),
        ),
        const SizedBox(height: 8),
        OutlinedButton.icon(
          onPressed: _pickTime,
          icon: const Icon(Icons.access_time, size: 18),
          label: Text(_selectedTime != null ? tfmt(_selectedTime!) : 'Pick Time'),
        ),
        const SizedBox(height: 8),
        OutlinedButton.icon(
          onPressed: _pickRange,
          icon: const Icon(Icons.date_range, size: 18),
          label: Text(
            _dateRange != null
                ? '${fmt(_dateRange!.start)} - ${fmt(_dateRange!.end)}'
                : 'Pick Date Range',
          ),
        ),
      ],
    );
  }
}
