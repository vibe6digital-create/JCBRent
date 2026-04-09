import 'package:flutter/material.dart';
import '../../config/theme.dart';
import '../../services/api_service.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  final ApiService _api = ApiService();
  List<Map<String, dynamic>> _notifications = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadNotifications();
  }

  Future<void> _loadNotifications() async {
    try {
      final response = await _api.get('/notifications');
      final List data = response['notifications'] ?? response['data'] ?? [];
      setState(() {
        _notifications = data.cast<Map<String, dynamic>>();
        _isLoading = false;
      });
    } catch (e) {
      setState(() { _error = e.toString(); _isLoading = false; });
    }
  }

  int get _unreadCount =>
      _notifications.where((n) => !(n['isRead'] ?? n['read'] ?? false)).length;

  Future<void> _markAllRead() async {
    try {
      await _api.post('/notifications/mark-all-read');
      setState(() {
        for (var n in _notifications) {
          n['isRead'] = true;
          n['read'] = true;
        }
      });
    } catch (_) {}
  }

  Future<void> _markRead(Map<String, dynamic> n) async {
    final id = n['id'] ?? n['_id'];
    if (id == null) return;
    try {
      await _api.patch('/notifications/$id/read');
      setState(() { n['isRead'] = true; n['read'] = true; });
    } catch (_) {
      setState(() { n['isRead'] = true; n['read'] = true; });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Notifications${_unreadCount > 0 ? ' ($_unreadCount)' : ''}'),
        actions: [
          if (_unreadCount > 0)
            TextButton(
              onPressed: _markAllRead,
              child: const Text('Mark all read', style: TextStyle(color: Colors.white)),
            ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.error_outline, size: 48, color: Colors.red),
                      const SizedBox(height: 12),
                      Text(_error!, textAlign: TextAlign.center),
                      const SizedBox(height: 16),
                      ElevatedButton(onPressed: _loadNotifications, child: const Text('Retry')),
                    ],
                  ),
                )
              : _notifications.isEmpty
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
                  : RefreshIndicator(
                      onRefresh: _loadNotifications,
                      child: ListView.separated(
                        padding: const EdgeInsets.all(8),
                        itemCount: _notifications.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 2),
                        itemBuilder: (_, i) {
                          final n = _notifications[i];
                          final isRead = n['isRead'] ?? n['read'] ?? false;
                          final type = n['type'] ?? '';
                          final createdAt = n['createdAt'];
                          final timeStr = createdAt != null
                              ? _formatTime(createdAt.toString())
                              : '';
                          return Card(
                            elevation: isRead ? 0 : 1,
                            color: isRead
                                ? Colors.white
                                : AppTheme.primaryColor.withAlpha(8),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            child: ListTile(
                              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                              leading: Container(
                                width: 44, height: 44,
                                decoration: BoxDecoration(
                                  color: _getColor(type).withAlpha(20),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Icon(_getIcon(type), color: _getColor(type), size: 22),
                              ),
                              title: Row(
                                children: [
                                  Expanded(
                                    child: Text(
                                      n['title'] ?? '',
                                      style: TextStyle(
                                        fontWeight: isRead ? FontWeight.w500 : FontWeight.bold,
                                        fontSize: 15,
                                      ),
                                    ),
                                  ),
                                  if (!isRead)
                                    Container(
                                      width: 8, height: 8,
                                      decoration: const BoxDecoration(
                                        color: AppTheme.primaryColor,
                                        shape: BoxShape.circle,
                                      ),
                                    ),
                                ],
                              ),
                              subtitle: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const SizedBox(height: 4),
                                  Text(
                                    n['body'] ?? n['message'] ?? '',
                                    style: TextStyle(color: Colors.grey[600], fontSize: 13),
                                  ),
                                  if (timeStr.isNotEmpty) ...[
                                    const SizedBox(height: 6),
                                    Text(timeStr, style: TextStyle(color: Colors.grey[400], fontSize: 12)),
                                  ],
                                ],
                              ),
                              onTap: () => _markRead(n),
                            ),
                          );
                        },
                      ),
                    ),
    );
  }

  String _formatTime(String isoString) {
    try {
      final dt = DateTime.parse(isoString).toLocal();
      final diff = DateTime.now().difference(dt);
      if (diff.inMinutes < 1) return 'Just now';
      if (diff.inMinutes < 60) return '${diff.inMinutes} min ago';
      if (diff.inHours < 24) return '${diff.inHours} hours ago';
      if (diff.inDays == 1) return 'Yesterday';
      return '${diff.inDays} days ago';
    } catch (_) {
      return '';
    }
  }

  Color _getColor(String type) {
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

  IconData _getIcon(String type) {
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
