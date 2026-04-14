import 'package:flutter/material.dart';
import '../../config/theme.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  final List<Map<String, dynamic>> _notifications = [
    {
      'title': 'Booking Approved!',
      'body': 'Your JCB 3DX Plus booking has been approved by Sharma Equipment. Machine will arrive on schedule.',
      'type': 'booking_approved',
      'isRead': false,
      'time': '2 min ago',
    },
    {
      'title': 'Machine Dispatched',
      'body': 'JCB 3DX Plus is on its way to your work site. Track the vehicle in real-time.',
      'type': 'machine_dispatched',
      'isRead': false,
      'time': '15 min ago',
    },
    {
      'title': 'Booking Request Sent',
      'body': 'Your booking request for Komatsu PC200 has been sent to Patel Constructions. Waiting for approval.',
      'type': 'booking_request',
      'isRead': false,
      'time': '1 hour ago',
    },
    {
      'title': 'Work Completed',
      'body': 'Your crane rental (ACE FX150) has been marked as completed. Rate your experience!',
      'type': 'booking_completed',
      'isRead': true,
      'time': '2 days ago',
    },
    {
      'title': 'Booking Rejected',
      'body': 'Unfortunately, your Pokelane booking was rejected. Machine unavailable for requested dates. Try other vendors.',
      'type': 'booking_rejected',
      'isRead': true,
      'time': '3 days ago',
    },
    {
      'title': 'Welcome to HeavyRent!',
      'body': 'Start exploring heavy equipment available near you. Use Smart Estimate to get instant cost predictions.',
      'type': 'welcome',
      'isRead': true,
      'time': '5 days ago',
    },
  ];

  int get _unreadCount => _notifications.where((n) => !(n['isRead'] ?? true)).length;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Notifications${_unreadCount > 0 ? ' ($_unreadCount)' : ''}'),
        actions: [
          if (_unreadCount > 0)
            TextButton(
              onPressed: () {
                setState(() {
                  for (var n in _notifications) { n['isRead'] = true; }
                });
              },
              child: const Text('Mark all read', style: TextStyle(color: Colors.white)),
            ),
        ],
      ),
      body: _notifications.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.notifications_none, size: 64, color: Colors.grey[300]),
                  const SizedBox(height: 16),
                  Text('No notifications', style: TextStyle(fontSize: 18, color: Colors.grey[500])),
                ],
              ),
            )
          : ListView.separated(
              padding: const EdgeInsets.all(8),
              itemCount: _notifications.length,
              separatorBuilder: (_, __) => const SizedBox(height: 2),
              itemBuilder: (_, i) {
                final n = _notifications[i];
                final isRead = n['isRead'] ?? false;
                return Card(
                  elevation: isRead ? 0 : 1,
                  color: isRead ? Colors.white : AppTheme.primaryColor.withAlpha(8),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  child: ListTile(
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    leading: Container(
                      width: 44, height: 44,
                      decoration: BoxDecoration(
                        color: _getColor(n['type']).withAlpha(20),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(_getIcon(n['type']), color: _getColor(n['type']), size: 22),
                    ),
                    title: Row(
                      children: [
                        Expanded(
                          child: Text(n['title'] ?? '',
                            style: TextStyle(fontWeight: isRead ? FontWeight.w500 : FontWeight.bold, fontSize: 15)),
                        ),
                        if (!isRead)
                          Container(
                            width: 8, height: 8,
                            decoration: const BoxDecoration(color: AppTheme.primaryColor, shape: BoxShape.circle),
                          ),
                      ],
                    ),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 4),
                        Text(n['body'] ?? '', style: TextStyle(color: Colors.grey[600], fontSize: 13)),
                        const SizedBox(height: 6),
                        Text(n['time'] ?? '', style: TextStyle(color: Colors.grey[400], fontSize: 12)),
                      ],
                    ),
                    onTap: () => setState(() => n['isRead'] = true),
                  ),
                );
              },
            ),
    );
  }

  Color _getColor(String? type) {
    switch (type) {
      case 'booking_approved': return AppTheme.successColor;
      case 'booking_rejected': return AppTheme.errorColor;
      case 'booking_completed': return Colors.blue;
      case 'machine_dispatched': return Colors.purple;
      case 'booking_request': return Colors.orange;
      case 'welcome': return AppTheme.primaryColor;
      default: return Colors.grey;
    }
  }

  IconData _getIcon(String? type) {
    switch (type) {
      case 'booking_approved': return Icons.check_circle;
      case 'booking_rejected': return Icons.cancel;
      case 'booking_completed': return Icons.done_all;
      case 'machine_dispatched': return Icons.local_shipping;
      case 'booking_request': return Icons.send;
      case 'welcome': return Icons.celebration;
      default: return Icons.notifications;
    }
  }
}
