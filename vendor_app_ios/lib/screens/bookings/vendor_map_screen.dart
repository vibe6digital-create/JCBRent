import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../../config/theme.dart';
import '../../models/booking.dart';
import '../../services/booking_service.dart';
import '../../services/location_service.dart';

class VendorMapScreen extends StatefulWidget {
  final Booking booking;
  const VendorMapScreen({super.key, required this.booking});

  @override
  State<VendorMapScreen> createState() => _VendorMapScreenState();
}

class _VendorMapScreenState extends State<VendorMapScreen> {
  late Booking _booking;
  GoogleMapController? _mapController;
  final _locationService = LocationService();
  final _bookingService = BookingService();

  LatLng? _vendorPosition;
  final Set<Marker> _markers = {};
  bool _isActionLoading = false;
  final _otpController = TextEditingController();

  // India center fallback
  static const _defaultCenter = LatLng(20.5937, 78.9629);

  @override
  void initState() {
    super.initState();
    _booking = widget.booking;
    _initLocation();
  }

  Future<void> _initLocation() async {
    final pos = await _locationService.getCurrentPosition();
    if (!mounted) return;

    if (pos != null) {
      final myLatLng = LatLng(pos.latitude, pos.longitude);
      setState(() {
        _vendorPosition = myLatLng;
        _updateMarkers(myLatLng);
      });
      _mapController?.animateCamera(CameraUpdate.newLatLngZoom(myLatLng, 14));

      // Start broadcasting GPS to backend
      if (_booking.isAccepted || _booking.isArrived || _booking.isInProgress) {
        _locationService.startBroadcasting(_booking.id);
      }
    }
  }

  void _updateMarkers(LatLng vendorPos) {
    _markers.clear();

    // Vendor marker (current GPS)
    _markers.add(Marker(
      markerId: const MarkerId('vendor'),
      position: vendorPos,
      icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueOrange),
      infoWindow: const InfoWindow(title: 'Your Location'),
    ));

    // Work site marker
    _markers.add(Marker(
      markerId: const MarkerId('worksite'),
      position: LatLng(vendorPos.latitude + 0.01, vendorPos.longitude + 0.01),
      icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed),
      infoWindow: InfoWindow(
        title: 'Work Site',
        snippet: _booking.workAddress.isNotEmpty ? _booking.workAddress : 'Customer location',
      ),
    ));
  }

  void _onMapCreated(GoogleMapController controller) {
    _mapController = controller;
    if (_vendorPosition != null) {
      controller.animateCamera(CameraUpdate.newLatLngZoom(_vendorPosition!, 14));
    }
  }

  Future<void> _doAction(String action) async {
    setState(() => _isActionLoading = true);
    try {
      switch (action) {
        case 'arrive':
          await _bookingService.markArrived(_booking.id);
          _showSnack('Arrival marked! OTP sent to customer.', AppTheme.successColor);
          break;
        case 'complete':
          await _bookingService.completeBooking(_booking.id);
          _locationService.stopBroadcasting();
          _showSnack('Booking completed!', AppTheme.successColor);
          break;
      }
      final updated = await _bookingService.getBookingById(_booking.id);
      if (mounted && updated != null) setState(() => _booking = updated);
    } catch (e) {
      _showSnack(e.toString().replaceFirst('Exception: ', ''), AppTheme.errorColor);
    } finally {
      if (mounted) setState(() => _isActionLoading = false);
    }
  }

  Future<void> _showOtpDialog() async {
    _otpController.clear();
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Enter Customer OTP'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Ask the customer for their 4-digit OTP to start work.',
              style: TextStyle(color: Colors.grey[600], fontSize: 14)),
            const SizedBox(height: 16),
            TextField(
              controller: _otpController,
              keyboardType: TextInputType.number,
              maxLength: 4,
              textAlign: TextAlign.center,
              autofocus: true,
              style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, letterSpacing: 8),
              decoration: InputDecoration(
                counterText: '',
                hintText: '----',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: const BorderSide(color: AppTheme.accentColor, width: 2),
                ),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.successColor,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
            child: const Text('Start Work'),
          ),
        ],
      ),
    );

    if (confirmed == true && _otpController.text.length == 4) {
      setState(() => _isActionLoading = true);
      try {
        await _bookingService.verifyStartOtp(_booking.id, _otpController.text);
        _showSnack('OTP verified! Work has started.', AppTheme.successColor);
        final updated = await _bookingService.getBookingById(_booking.id);
        if (mounted && updated != null) setState(() => _booking = updated);
      } catch (e) {
        _showSnack(e.toString().replaceFirst('Exception: ', ''), AppTheme.errorColor);
      } finally {
        if (mounted) setState(() => _isActionLoading = false);
      }
    }
  }

  void _showSnack(String msg, Color color) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg),
      backgroundColor: color,
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    ));
  }

  void _centerOnMe() {
    if (_vendorPosition != null) {
      _mapController?.animateCamera(CameraUpdate.newLatLngZoom(_vendorPosition!, 15));
    }
  }

  @override
  void dispose() {
    _mapController?.dispose();
    _otpController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isActive = _booking.isAccepted || _booking.isArrived || _booking.isInProgress;

    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // Full-screen Google Map
          GoogleMap(
            onMapCreated: _onMapCreated,
            initialCameraPosition: CameraPosition(
              target: _vendorPosition ?? _defaultCenter,
              zoom: _vendorPosition != null ? 14 : 5,
            ),
            markers: _markers,
            myLocationEnabled: true,
            myLocationButtonEnabled: false,
            mapToolbarEnabled: false,
            zoomControlsEnabled: false,
            compassEnabled: true,
          ),

          // Back button
          Positioned(
            top: MediaQuery.of(context).padding.top + 12,
            left: 16,
            child: SafeArea(
              child: GestureDetector(
                onTap: () => Navigator.pop(context),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [BoxShadow(color: Colors.black.withAlpha(30), blurRadius: 8)],
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.arrow_back_ios, size: 14, color: Colors.black87),
                      SizedBox(width: 4),
                      Text('Back', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
              ),
            ),
          ),

          // GPS broadcasting indicator
          Positioned(
            top: MediaQuery.of(context).padding.top + 12,
            right: 16,
            child: SafeArea(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: _locationService.isBroadcasting ? AppTheme.successColor : Colors.grey,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [BoxShadow(color: Colors.black.withAlpha(30), blurRadius: 8)],
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.location_on, color: Colors.white, size: 14),
                    const SizedBox(width: 4),
                    Text(
                      _locationService.isBroadcasting ? 'GPS Live' : 'GPS Off',
                      style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Center on me button
          Positioned(
            right: 16,
            bottom: 260,
            child: FloatingActionButton.small(
              onPressed: _centerOnMe,
              backgroundColor: Colors.white,
              child: const Icon(Icons.my_location, color: AppTheme.primaryColor),
            ),
          ),

          // Bottom Info + Action Panel
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
                boxShadow: [BoxShadow(color: Colors.black.withAlpha(40), blurRadius: 20, offset: const Offset(0, -4))],
              ),
              padding: EdgeInsets.fromLTRB(20, 16, 20, MediaQuery.of(context).padding.bottom + 20),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Handle
                  Center(
                    child: Container(
                      width: 40, height: 4,
                      decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(2)),
                    ),
                  ),
                  const SizedBox(height: 14),

                  // Booking info
                  Row(
                    children: [
                      Container(
                        width: 48, height: 48,
                        decoration: BoxDecoration(
                          color: AppTheme.accentColor.withAlpha(20),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(Icons.construction, color: AppTheme.accentColor, size: 24),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('${_booking.machineCategory} — ${_booking.machineModel}',
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                            Text(_booking.customerName,
                              style: TextStyle(color: Colors.grey[600], fontSize: 13)),
                          ],
                        ),
                      ),
                      // Status badge
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(
                          color: _statusColor.withAlpha(20),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(_booking.statusLabel,
                          style: TextStyle(color: _statusColor, fontWeight: FontWeight.bold, fontSize: 11)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Work address
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: Colors.grey[50],
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: Colors.grey[200]!),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.location_on, color: Colors.red, size: 16),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            _booking.workAddress.isNotEmpty ? _booking.workAddress : 'Work location',
                            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Action buttons
                  if (_isActionLoading)
                    const Center(child: CircularProgressIndicator(color: AppTheme.accentColor))
                  else if (isActive)
                    _buildActionButtons(),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButtons() {
    if (_booking.isAccepted) {
      return SizedBox(
        width: double.infinity,
        height: 50,
        child: ElevatedButton.icon(
          onPressed: () => _doAction('arrive'),
          icon: const Icon(Icons.location_on_rounded, size: 20),
          label: const Text('Mark as Arrived at Site', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
          style: ElevatedButton.styleFrom(
            backgroundColor: AppTheme.infoColor,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          ),
        ),
      );
    }

    if (_booking.isArrived) {
      return Column(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            margin: const EdgeInsets.only(bottom: 10),
            decoration: BoxDecoration(
              color: AppTheme.warningColor.withAlpha(15),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppTheme.warningColor.withAlpha(60)),
            ),
            child: const Row(
              children: [
                Icon(Icons.info_outline, color: AppTheme.warningColor, size: 16),
                SizedBox(width: 8),
                Text('Waiting for customer OTP',
                  style: TextStyle(color: AppTheme.warningColor, fontWeight: FontWeight.w500)),
              ],
            ),
          ),
          SizedBox(
            width: double.infinity, height: 50,
            child: ElevatedButton.icon(
              onPressed: _showOtpDialog,
              icon: const Icon(Icons.lock_open_rounded, size: 20),
              label: const Text('Enter Customer OTP', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.successColor,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
            ),
          ),
        ],
      );
    }

    if (_booking.isInProgress) {
      return SizedBox(
        width: double.infinity, height: 50,
        child: ElevatedButton.icon(
          onPressed: () => _doAction('complete'),
          icon: const Icon(Icons.check_circle_rounded, size: 20),
          label: const Text('Mark Work Complete', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
          style: ElevatedButton.styleFrom(
            backgroundColor: AppTheme.accentColor,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          ),
        ),
      );
    }

    return const SizedBox.shrink();
  }

  Color get _statusColor {
    switch (_booking.status) {
      case 'accepted': return AppTheme.infoColor;
      case 'arrived': return AppTheme.warningColor;
      case 'in_progress': return AppTheme.successColor;
      default: return AppTheme.textLight;
    }
  }
}
