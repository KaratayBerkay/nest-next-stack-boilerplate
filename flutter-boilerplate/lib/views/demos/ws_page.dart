import 'package:flutter/material.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

class WsDemoPage extends StatefulWidget {
  final String lang;
  const WsDemoPage({super.key, required this.lang});

  @override
  State<WsDemoPage> createState() => _WsDemoPageState();
}

class _WsDemoPageState extends State<WsDemoPage> {
  WebSocketChannel? _channel;
  final _messages = <String>[];
  final _controller = TextEditingController();
  String _status = 'Disconnected';

  @override
  void initState() {
    super.initState();
    _connect();
  }

  void _connect() {
    try {
      _channel = WebSocketChannel.connect(Uri.parse('ws://localhost:3001/ws'));
      _channel!.stream.listen(
        (data) {
          setState(() {
            _messages.add('Received: $data');
            _status = 'Connected';
          });
        },
        onError: (Object error) {
          setState(() {
            _messages.add('Error: $error');
            _status = 'Error';
          });
        },
        onDone: () {
          setState(() {
            _status = 'Disconnected';
          });
        },
      );
    } catch (e) {
      setState(() {
        _messages.add('Connection failed: $e');
        _status = 'Error';
      });
    }
  }

  void _send() {
    if (_controller.text.isNotEmpty && _channel != null) {
      _channel!.sink.add(_controller.text);
      setState(() => _messages.add('Sent: ${_controller.text}'));
      _controller.clear();
    }
  }

  @override
  void dispose() {
    _channel?.sink.close();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('WebSocket Demo')),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            color: _status == 'Connected'
                ? Colors.green.shade100
                : Colors.red.shade100,
            child: Text('Status: $_status'),
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length,
              itemBuilder: (_, i) => Padding(
                padding: const EdgeInsets.symmetric(vertical: 2),
                child: Text(_messages[i]),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    decoration: const InputDecoration(
                      hintText: 'Type a message...',
                      border: OutlineInputBorder(),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                FilledButton(onPressed: _send, child: const Text('Send')),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
