import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../../config/theme.dart';
import '../../models/booking.dart';
import '../../services/booking_service.dart';

class LiveTrackingScreen extends StatefulWidget {
  final Booking booking;
  const LiveTrackingScreen({super.key, required this.booking});

  @override
  State<LiveTrackingScreen> createState() => _LiveTrackingScreenState();
}

class _LiveTrackingScreenState extends State<LiveTrackingScreen> {
  late Booking _booking;
  GoogleMapController? _mapController;
  final _bookingService = BookingService();
  Timer? _pollTimer;

  Set<Marker> _markers = {};
  bool _arrived = false;

  // Default to India center if no GPS available yet
  static const _defaultCenter = LatLng(20.5937, 78.9629);
  LatLng? _vendorLatLng;

  @override
  void initState() {
    super.initState();
    _booking = widget.booking;
    _arrived = _booking.status == 'arrived' || _booking.status == 'in_progress';
    _applyBookingToMap(_booking);

    // Poll every 5 seconds for vendor GPS updates
    _pollTimer = Timer.periodic(const Duration(seconds: 5), (_) => _pollBooking());
  }

  Future<void> _pollBooking() async {
    try {
      final updated = await _bookingService.getBookingById(_booking.id);
      if (!mounted) return;
      setState(() {
        _booking = updated;
        _arrived = updated.status == 'arrived' || updated.status == 'in_progress';
        _applyBookingToMap(updated);
      });
    } catch (_) {}
  }

  void _applyBookingToMap(Booking b) {
    final newMarkers = <Marker>{};

    // Vendor marker (real GPS from backend)
    if (b.vendorLat != null && b.vendorLng != null) {
      final vendorPos = LatLng(b.vendorLat!, b.vendorLng!);
      _vendorLatLng = vendorPos;

      newMarkers.add(Marker(
        markerId: const MarkerId('vendor'),
        position: vendorPos,
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueOrange),
        infoWindow: InfoWindow(
          title: b.vendorName.isNotEmpty ? b.vendorName : 'Operator',
          snippet: _arrived ? 'Arrived at site' : 'En route to your site',
        ),
      ));

      // Animate camera to vendor's real position
      _mapController?.animateCamera(CameraUpdate.newLatLng(vendorPos));
    }

    // Work site marker (if we have coordinates)
    if (b.workLat != null && b.workLng != null) {
      newMarkers.add(Marker(
        markerId: const MarkerId('worksite'),
        position: LatLng(b.workLat!, b.workLng!),
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed),
        infoWindow: InfoWindow(
          title: 'Work Site',
          snippet: b.workAddress ?? '',
        ),
      ));
    }

    _markers = newMarkers;
  }

  void _onMapCreated(GoogleMapController controller) {
    _mapController = controller;
    if (_vendorLatLng != null) {
      controller.animateCamera(CameraUpdate.newLatLngZoom(_vendorLatLng!, 14));
    }
  }

  void _showEmergencyDialog() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(width: 40, height: 4,
              decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(2))),
            const SizedBox(height: 20),
            const Text('Emergency', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text('Select an option for immediate help',
              style: TextStyle(color: Colors.grey[600], fontSize: 14)),
            const SizedBox(height: 20),
            _EmergencyOption(
              icon: Icons.local_police_rounded,
              label: 'Call Police',
              subtitle: 'Dial 100 immediately',
              color: Colors.red,
              onTap: () {
                Navigator.pop(ctx);
                // url_launcher would open dialer — show snackbar for now
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Calling Police: 100'), backgroundColor: Colors.red));
              },
            ),
            const SizedBox(height: 12),
            _EmergencyOption(
              icon: Icons.support_agent_rounded,
              label: 'Customer Care',
              subtitle: 'HeavyRent 24x7 support',
              color: AppTheme.primaryColor,
              onTap: () {
                Navigator.pop(ctx);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Connecting to Customer Care...'),
                    backgroundColor: AppTheme.primaryColor));
              },
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    _mapController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Live Tracking'),
        backgroundColor: AppTheme.secondaryColor,
        systemOverlayStyle: SystemUiOverlayStyle.light,
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 8),
            child: TextButton.icon(
              onPressed: _showEmergencyDialog,
              icon: const Icon(Icons.warning_amber_rounded, color: Colors.white, size: 18),
              label: const Text('SOS', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              style: TextButton.styleFrom(
                backgroundColor: Colors.red.withAlpha(180),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              ),
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          // Google Map
          Expanded(
            flex: 3,
            child: Stack(
              children: [
                GoogleMap(
                  onMapCreated: _onMapCreated,
                  initialCameraPosition: CameraPosition(
                    target: _vendorLatLng ?? _defaultCenter,
                    zoom: _vendorLatLng != null ? 14 : 5,
                  ),
                  markers: _markers,
                  myLocationEnabled: false,
                  myLocationButtonEnabled: false,
                  zoomControlsEnabled: false,
                  mapToolbarEnabled: false,
                  compassEnabled: true,
                ),

                // Live GPS badge (top-left)
                Positioned(
                  top: 12,
                  left: 12,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [BoxShadow(color: Colors.black.withAlpha(25), blurRadius: 8)],
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 8, height: 8,
                          decoration: BoxDecoration(
                            color: _vendorLatLng != null ? AppTheme.successColor : Colors.grey,
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 6),
                        Text(
                          _vendorLatLng != null ? 'GPS Live' : 'Waiting for GPS...',
                          style: TextStyle(
                            fontSize: 12, fontWeight: FontWeight.bold,
                            color: _vendorLatLng != null ? AppTheme.successColor : Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                // Arrived overlay
                if (_arrived)
                  Center(
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                      decoration: BoxDecoration(
                        color: AppTheme.successColor,
                        borderRadius: BorderRadius.circular(30),
                        boxShadow: [BoxShadow(color: Colors.black.withAlpha(50), blurRadius: 10)],
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.check_circle, color: Colors.white),
                          SizedBox(width: 8),
                          Text('Machine Arrived!',
                            style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
          ),

          // Info panel
          Container(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
              boxShadow: [BoxShadow(color: Colors.black.withAlpha(20), blurRadius: 10, offset: const Offset(0, -4))],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(width: 40, height: 4,
                  decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(2))),
                const SizedBox(height: 16),

                // Machine + vendor info
                Row(
                  children: [
                    Container(
                      width: 52, height: 52,
                      decoration: BoxDecoration(
                        color: AppTheme.primaryColor.withAlpha(20),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.construction, color: AppTheme.primaryColor, size: 28),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(_booking.machineModel,
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 17)),
                          Text(_booking.vendorName,
                            style: TextStyle(color: Colors.grey[600])),
                        ],
                      ),
                    ),
                    // GPS coordinates display (small, useful for debugging)
                    if (_vendorLatLng != null)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppTheme.successColor.withAlpha(15),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text('${_vendorLatLng!.latitude.toStringAsFixed(4)}',
                              style: const TextStyle(fontSize: 10, color: AppTheme.successColor, fontFamily: 'monospace')),
                            Text('${_vendorLatLng!.longitude.toStringAsFixed(4)}',
                              style: const TextStyle(fontSize: 10, color: AppTheme.successColor, fontFamily: 'monospace')),
                          ],
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 16),

                // Status pills
                Row(
                  children: [
                    Expanded(child: _StatPill(
                      icon: Icons.info_outline,
                      label: 'Status',
                      value: _booking.statusLabel,
                      color: _statusColor,
                    )),
                    const SizedBox(width: 10),
                    Expanded(child: _StatPill(
                      icon: Icons.location_on,
                      label: 'GPS',
                      value: _vendorLatLng != null ? 'Live' : 'Pending',
                      color: _vendorLatLng != null ? AppTheme.successColor : Colors.grey,
                    )),
                    const SizedBox(width: 10),
                    Expanded(child: _StatPill(
                      icon: _arrived ? Icons.check_circle : Icons.local_shipping,
                      label: 'Vehicle',
                      value: _arrived ? 'Arrived' : 'En Route',
                      color: _arrived ? AppTheme.successColor : Colors.blue,
                    )),
                  ],
                ),
                const SizedBox(height: 14),

                // Work address
                if (_booking.workAddress != null && _booking.workAddress!.isNotEmpty)
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.grey[50],
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.location_on, color: Colors.red, size: 18),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(_booking.workAddress!,
                            style: TextStyle(color: Colors.grey[700], fontSize: 13)),
                        ),
                      ],
                    ),
                  ),

                // OTP section when arrived
                if (_arrived) ...[
                  const SizedBox(height: 14),
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppTheme.successColor.withAlpha(15),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppTheme.successColor.withAlpha(80)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Row(
                          children: [
                            Icon(Icons.check_circle, color: AppTheme.successColor, size: 20),
                            SizedBox(width: 8),
                            Text('Machine Has Arrived!',
                              style: TextStyle(fontWeight: FontWeight.bold, color: AppTheme.successColor, fontSize: 15)),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text('Share your Start OTP with the operator to begin work.',
                          style: TextStyle(color: Colors.grey[700], fontSize: 13)),
                        const SizedBox(height: 12),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: AppTheme.successColor.withAlpha(80)),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Your OTP', style: TextStyle(color: Colors.grey, fontSize: 13)),
                              Text(
                                _booking.startOtp ?? '----',
                                style: const TextStyle(
                                  fontSize: 26, fontWeight: FontWeight.bold,
                                  letterSpacing: 8, color: AppTheme.successColor,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],

                const SizedBox(height: 14),
                SizedBox(
                  width: double.infinity, height: 48,
                  child: OutlinedButton.icon(
                    onPressed: _showEmergencyDialog,
                    icon: const Icon(Icons.warning_amber_rounded, color: Colors.red),
                    label: const Text('Emergency', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Colors.red, width: 1.5),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Color get _statusColor {
    switch (_booking.status) {
      case 'accepted': return Colors.blue;
      case 'arrived': return AppTheme.accentColor;
      case 'in_progress': return AppTheme.successColor;
      default: return Colors.grey;
    }
  }
}

class _StatPill extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;
  const _StatPill({required this.icon, required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withAlpha(15),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(height: 4),
          Text(value, style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: color)),
          Text(label, style: TextStyle(color: color.withAlpha(170), fontSize: 11)),
        ],
      ),
    );
  }
}

class _EmergencyOption extends StatelessWidget {
  final IconData icon;
  final String label;
  final String subtitle;
  final Color color;
  final VoidCallback onTap;
  const _EmergencyOption({required this.icon, required this.label, required this.subtitle, required this.color, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: color.withAlpha(12),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: color.withAlpha(60)),
        ),
        child: Row(
          children: [
            Container(
              width: 48, height: 48,
              decoration: BoxDecoration(color: color.withAlpha(20), borderRadius: BorderRadius.circular(12)),
              child: Icon(icon, color: color, size: 24),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: color)),
                  Text(subtitle, style: TextStyle(fontSize: 12, color: Colors.grey[600])),
                ],
              ),
            ),
            Icon(Icons.chevron_right, color: color.withAlpha(150)),
          ],
        ),
      ),
    );
  }
}
