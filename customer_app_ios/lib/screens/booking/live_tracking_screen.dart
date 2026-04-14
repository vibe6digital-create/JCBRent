import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import '../../config/theme.dart';
import '../../models/booking.dart';

class LiveTrackingScreen extends StatefulWidget {
  final Booking booking;
  const LiveTrackingScreen({super.key, required this.booking});

  @override
  State<LiveTrackingScreen> createState() => _LiveTrackingScreenState();
}

class _LiveTrackingScreenState extends State<LiveTrackingScreen> with SingleTickerProviderStateMixin {
  late AnimationController _animController;
  Timer? _locationTimer;
  double _vehicleProgress = 0.0; // 0 to 1
  String _eta = '15 min';
  String _distance = '4.2 km';
  bool _isVehicleMoving = true;

  // Simulated route points (vendor to work location)
  final List<Offset> _routePoints = [];

  @override
  void initState() {
    super.initState();
    _generateRoute();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    )..repeat(reverse: true);

    // Simulate vehicle movement
    _locationTimer = Timer.periodic(const Duration(seconds: 2), (_) {
      if (mounted && _vehicleProgress < 1.0) {
        setState(() {
          _vehicleProgress += 0.03 + Random().nextDouble() * 0.02;
          if (_vehicleProgress > 1.0) _vehicleProgress = 1.0;

          final remaining = (1.0 - _vehicleProgress) * 15;
          _eta = '${remaining.toInt()} min';
          _distance = '${((1.0 - _vehicleProgress) * 4.2).toStringAsFixed(1)} km';

          if (_vehicleProgress >= 1.0) {
            _isVehicleMoving = false;
            _eta = 'Arrived';
            _distance = '0.0 km';
          }
        });
      }
    });
  }

  void _generateRoute() {
    // Generate a curved route between two points
    for (int i = 0; i <= 20; i++) {
      final t = i / 20.0;
      final x = 0.2 + t * 0.6;
      final y = 0.7 - t * 0.4 + sin(t * pi * 2) * 0.05;
      _routePoints.add(Offset(x, y));
    }
  }

  @override
  void dispose() {
    _animController.dispose();
    _locationTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Live Tracking'),
        backgroundColor: AppTheme.secondaryColor,
      ),
      body: Column(
        children: [
          // Map area
          Expanded(
            flex: 3,
            child: Container(
              color: const Color(0xFFE8F5E9),
              child: CustomPaint(
                painter: _MapPainter(
                  routePoints: _routePoints,
                  vehicleProgress: _vehicleProgress,
                  pulseAnimation: _animController,
                ),
                child: Stack(
                  children: [
                    // Road lines decoration
                    ..._buildMapDecorations(),

                    // Vendor label
                    Positioned(
                      left: 20,
                      bottom: 40,
                      child: _MapLabel(
                        icon: Icons.store,
                        label: widget.booking.vendorName.isNotEmpty ? widget.booking.vendorName : 'Vendor',
                        color: Colors.blue,
                      ),
                    ),

                    // Work site label
                    Positioned(
                      right: 20,
                      top: 60,
                      child: _MapLabel(
                        icon: Icons.location_on,
                        label: 'Work Site',
                        color: Colors.red,
                      ),
                    ),

                    // Vehicle arrived overlay
                    if (!_isVehicleMoving)
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
                              Text('Vehicle Arrived!',
                                style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ),
          ),

          // Info panel
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
              boxShadow: [BoxShadow(color: Colors.black.withAlpha(20), blurRadius: 10, offset: const Offset(0, -4))],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Handle bar
                Container(
                  width: 40, height: 4,
                  decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(2)),
                ),
                const SizedBox(height: 16),

                // Machine info
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
                          Text(widget.booking.machineModel,
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 17)),
                          Text(widget.booking.vendorName,
                            style: TextStyle(color: Colors.grey[600])),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: AppTheme.primaryColor,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.phone, color: Colors.white, size: 22),
                    ),
                  ],
                ),
                const SizedBox(height: 20),

                // ETA and Distance
                Row(
                  children: [
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: Colors.blue.withAlpha(15),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Column(
                          children: [
                            const Icon(Icons.access_time, color: Colors.blue, size: 22),
                            const SizedBox(height: 6),
                            Text(_eta, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.blue)),
                            const Text('ETA', style: TextStyle(color: Colors.blue, fontSize: 12)),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: AppTheme.primaryColor.withAlpha(15),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Column(
                          children: [
                            const Icon(Icons.route, color: AppTheme.primaryColor, size: 22),
                            const SizedBox(height: 6),
                            Text(_distance, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppTheme.primaryColor)),
                            const Text('Distance', style: TextStyle(color: AppTheme.primaryColor, fontSize: 12)),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: AppTheme.successColor.withAlpha(15),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Column(
                          children: [
                            Icon(_isVehicleMoving ? Icons.local_shipping : Icons.check_circle,
                              color: AppTheme.successColor, size: 22),
                            const SizedBox(height: 6),
                            Text(_isVehicleMoving ? 'Moving' : 'Arrived',
                              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.successColor)),
                            const Text('Status', style: TextStyle(color: AppTheme.successColor, fontSize: 12)),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // Progress bar
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Trip Progress', style: TextStyle(fontWeight: FontWeight.w600)),
                        Text('${(_vehicleProgress * 100).toInt()}%', style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primaryColor)),
                      ],
                    ),
                    const SizedBox(height: 8),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(6),
                      child: LinearProgressIndicator(
                        value: _vehicleProgress,
                        minHeight: 8,
                        backgroundColor: Colors.grey[200],
                        color: _isVehicleMoving ? AppTheme.primaryColor : AppTheme.successColor,
                      ),
                    ),
                  ],
                ),

                if (widget.booking.workAddress != null) ...[
                  const SizedBox(height: 14),
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
                          child: Text(widget.booking.workAddress!,
                            style: TextStyle(color: Colors.grey[700], fontSize: 13)),
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  List<Widget> _buildMapDecorations() {
    return [
      // Simulated grid lines for map feel
      Positioned.fill(
        child: CustomPaint(
          painter: _GridPainter(),
        ),
      ),
    ];
  }
}

class _MapPainter extends CustomPainter {
  final List<Offset> routePoints;
  final double vehicleProgress;
  final Animation<double> pulseAnimation;

  _MapPainter({
    required this.routePoints,
    required this.vehicleProgress,
    required this.pulseAnimation,
  }) : super(repaint: pulseAnimation);

  @override
  void paint(Canvas canvas, Size size) {
    if (routePoints.isEmpty) return;

    // Draw route path
    final routePaint = Paint()
      ..color = Colors.blue.withAlpha(80)
      ..strokeWidth = 5
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final completedPaint = Paint()
      ..color = Colors.blue
      ..strokeWidth = 5
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final path = Path();
    final completedPath = Path();

    for (int i = 0; i < routePoints.length; i++) {
      final point = Offset(routePoints[i].dx * size.width, routePoints[i].dy * size.height);
      if (i == 0) {
        path.moveTo(point.dx, point.dy);
        completedPath.moveTo(point.dx, point.dy);
      } else {
        path.lineTo(point.dx, point.dy);
        if (i / routePoints.length <= vehicleProgress) {
          completedPath.lineTo(point.dx, point.dy);
        }
      }
    }

    // Draw dashed remaining route
    canvas.drawPath(path, routePaint);
    // Draw completed route (solid)
    canvas.drawPath(completedPath, completedPaint);

    // Draw start point (vendor)
    final startPoint = Offset(routePoints.first.dx * size.width, routePoints.first.dy * size.height);
    canvas.drawCircle(startPoint, 10, Paint()..color = Colors.blue);
    canvas.drawCircle(startPoint, 6, Paint()..color = Colors.white);

    // Draw end point (work site)
    final endPoint = Offset(routePoints.last.dx * size.width, routePoints.last.dy * size.height);
    canvas.drawCircle(endPoint, 10, Paint()..color = Colors.red);
    canvas.drawCircle(endPoint, 6, Paint()..color = Colors.white);

    // Draw vehicle
    final vehicleIndex = (vehicleProgress * (routePoints.length - 1)).round().clamp(0, routePoints.length - 1);
    final vehiclePoint = Offset(
      routePoints[vehicleIndex].dx * size.width,
      routePoints[vehicleIndex].dy * size.height,
    );

    // Pulse effect
    final pulseRadius = 16 + pulseAnimation.value * 8;
    canvas.drawCircle(
      vehiclePoint,
      pulseRadius,
      Paint()..color = AppTheme.primaryColor.withAlpha(40),
    );

    // Vehicle dot
    canvas.drawCircle(vehiclePoint, 12, Paint()..color = AppTheme.primaryColor);
    canvas.drawCircle(vehiclePoint, 8, Paint()..color = Colors.white);

    // Vehicle icon (small truck shape)
    final iconPaint = Paint()
      ..color = AppTheme.primaryColor
      ..style = PaintingStyle.fill;
    canvas.drawCircle(vehiclePoint, 5, iconPaint);
  }

  @override
  bool shouldRepaint(covariant _MapPainter oldDelegate) =>
      vehicleProgress != oldDelegate.vehicleProgress;
}

class _GridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.green.withAlpha(15)
      ..strokeWidth = 1;

    for (double x = 0; x < size.width; x += 40) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
    }
    for (double y = 0; y < size.height; y += 40) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _MapLabel extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  const _MapLabel({required this.icon, required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(color: Colors.black.withAlpha(25), blurRadius: 6)],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: color, size: 16),
          const SizedBox(width: 6),
          Text(label, style: TextStyle(fontWeight: FontWeight.w600, color: color, fontSize: 13)),
        ],
      ),
    );
  }
}
