import 'package:flutter/material.dart';

class SliderDemoPage extends StatefulWidget {
  final String lang;
  const SliderDemoPage({super.key, required this.lang});

  @override
  State<SliderDemoPage> createState() => _SliderDemoPageState();
}

class _SliderDemoPageState extends State<SliderDemoPage> {
  double _value = 0.5;
  RangeValues _range = const RangeValues(0.2, 0.8);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Slider')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text('Basic Slider', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          Slider(value: _value, onChanged: (v) => setState(() => _value = v)),
          Text('Value: ${_value.toStringAsFixed(2)}'),
          const SizedBox(height: 24),
          const Text('Range Slider', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          RangeSlider(values: _range, onChanged: (v) => setState(() => _range = v)),
          Text('Range: ${_range.start.toStringAsFixed(2)} - ${_range.end.toStringAsFixed(2)}'),
        ],
      ),
    );
  }
}
