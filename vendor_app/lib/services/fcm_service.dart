import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'api_service.dart';

/// Top-level handler for background FCM messages (must be outside any class)
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  // Background messages handled by system notification tray
}

class FCMService {
  static final _messaging = FirebaseMessaging.instance;

  /// Call once after Firebase.initializeApp()
  static Future<void> init() async {
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

    await _messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    final token = await _messaging.getToken();
    if (token != null) await _saveToken(token);

    _messaging.onTokenRefresh.listen((newToken) async {
      await _saveToken(newToken);
    });
  }

  /// Show in-app banner when app is in foreground
  static void listenForeground(BuildContext context) {
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      final notification = message.notification;
      if (notification == null) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(notification.title ?? '',
                  style: const TextStyle(fontWeight: FontWeight.w700, color: Colors.white)),
              if ((notification.body ?? '').isNotEmpty)
                Text(notification.body!,
                    style: const TextStyle(fontSize: 13, color: Colors.white70)),
            ],
          ),
          duration: const Duration(seconds: 4),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
    });
  }

  static Future<void> _saveToken(String token) async {
    try {
      await ApiService().patch('/auth/fcm-token', body: {'fcmToken': token});
    } catch (_) {}
  }
}
