import 'dart:async';
import 'package:geolocator/geolocator.dart';
import 'booking_service.dart';

/// Singleton that periodically broadcasts vendor's GPS to the backend.
/// Call [startBroadcasting] when a booking becomes accepted/in_progress.
/// Call [stopBroadcasting] when done.
class LocationService {
  static final LocationService _instance = LocationService._internal();
  factory LocationService() => _instance;
  LocationService._internal();

  final _bookingService = BookingService();
  Timer? _timer;
  String? _activeBookingId;

  Future<bool> requestPermission() async {
    bool enabled = await Geolocator.isLocationServiceEnabled();
    if (!enabled) return false;

    LocationPermission perm = await Geolocator.checkPermission();
    if (perm == LocationPermission.denied) {
      perm = await Geolocator.requestPermission();
      if (perm == LocationPermission.denied) return false;
    }
    if (perm == LocationPermission.deniedForever) return false;
    return true;
  }

  Future<Position?> getCurrentPosition() async {
    final hasPermission = await requestPermission();
    if (!hasPermission) return null;
    try {
      return await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 8),
        ),
      );
    } catch (_) {
      return null;
    }
  }

  /// Start broadcasting GPS every [intervalSeconds] seconds for [bookingId].
  void startBroadcasting(String bookingId, {int intervalSeconds = 10}) {
    if (_activeBookingId == bookingId && _timer != null) return;
    stopBroadcasting();
    _activeBookingId = bookingId;

    _broadcastOnce(bookingId);
    _timer = Timer.periodic(Duration(seconds: intervalSeconds), (_) {
      _broadcastOnce(bookingId);
    });
  }

  void stopBroadcasting() {
    _timer?.cancel();
    _timer = null;
    _activeBookingId = null;
  }

  bool get isBroadcasting => _timer != null;

  Future<void> _broadcastOnce(String bookingId) async {
    try {
      final pos = await getCurrentPosition();
      if (pos == null) return;
      await _bookingService.updateLocation(bookingId, pos.latitude, pos.longitude);
    } catch (_) {
      // Silently fail — network errors should not crash the app
    }
  }
}
