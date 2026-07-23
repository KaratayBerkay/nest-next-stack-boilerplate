import 'package:flutter/material.dart';

class CalendarWidget extends StatefulWidget {
  final DateTime? selectedDate;
  final void Function(DateTime)? onDateSelected;
  final DateTime? firstDate;
  final DateTime? lastDate;

  const CalendarWidget({
    super.key,
    this.selectedDate,
    this.onDateSelected,
    this.firstDate,
    this.lastDate,
  });

  @override
  State<CalendarWidget> createState() => _CalendarWidgetState();
}

class _CalendarWidgetState extends State<CalendarWidget> {
  late DateTime _focusedMonth;

  @override
  void initState() {
    super.initState();
    _focusedMonth = DateTime(
      widget.selectedDate?.year ?? DateTime.now().year,
      widget.selectedDate?.month ?? DateTime.now().month,
      1,
    );
  }

  List<DateTime> _daysInMonth(DateTime month) {
    final first = DateTime(month.year, month.month, 1);
    final last = DateTime(month.year, month.month + 1, 0);
    final days = <DateTime>[];
    for (int d = 1; d <= last.day; d++) {
      days.add(DateTime(month.year, month.month, d));
    }
    return days;
  }

  @override
  Widget build(BuildContext context) {
    final days = _daysInMonth(_focusedMonth);
    final startWeekday = days.first.weekday % 7;

    final weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            IconButton(
              icon: const Icon(Icons.chevron_left),
              onPressed: () {
                setState(() {
                  _focusedMonth = DateTime(_focusedMonth.year, _focusedMonth.month - 1, 1);
                });
              },
            ),
            Text(
              '${_focusedMonth.year} ${_monthName(_focusedMonth.month)}',
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
            IconButton(
              icon: const Icon(Icons.chevron_right),
              onPressed: () {
                setState(() {
                  _focusedMonth = DateTime(_focusedMonth.year, _focusedMonth.month + 1, 1);
                });
              },
            ),
          ],
        ),
        GridView.count(
          crossAxisCount: 7,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          children: [
            ...weekDays.map((d) => Center(child: Text(d, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500)))),
            ...List.generate(startWeekday, (_) => const SizedBox.shrink()),
            ...days.map((day) {
              final isSelected = widget.selectedDate != null &&
                  widget.selectedDate!.year == day.year &&
                  widget.selectedDate!.month == day.month &&
                  widget.selectedDate!.day == day.day;
              return InkWell(
                onTap: () => widget.onDateSelected?.call(day),
                child: Container(
                  decoration: BoxDecoration(
                    color: isSelected ? Theme.of(context).colorScheme.primary : null,
                    shape: BoxShape.circle,
                  ),
                  child: Center(
                    child: Text(
                      '${day.day}',
                      style: TextStyle(
                        color: isSelected ? Theme.of(context).colorScheme.onPrimary : null,
                        fontWeight: isSelected ? FontWeight.w600 : null,
                      ),
                    ),
                  ),
                ),
              );
            }),
          ],
        ),
      ],
    );
  }

  String _monthName(int month) {
    const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return names[month - 1];
  }
}
