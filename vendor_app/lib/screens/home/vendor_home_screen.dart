import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../../config/theme.dart';
import '../../services/auth_service.dart';
import '../../services/booking_service.dart';
import '../../services/machine_service.dart';
import '../../models/booking.dart';
import '../machines/machines_list_screen.dart';
import '../machines/add_edit_machine_screen.dart';
import '../bookings/bookings_screen.dart';
import '../earnings/earnings_screen.dart';
import '../profile/profile_screen.dart';

class VendorHomeScreen extends StatefulWidget {
  const VendorHomeScreen({super.key});

  @override
  State<VendorHomeScreen> createState() => _VendorHomeScreenState();
}

class _VendorHomeScreenState extends State<VendorHomeScreen> {
  int _currentIndex = 0;

  final _screens = const [
    _DashboardBody(),
    MachinesListScreen(),
    BookingsScreen(),
    EarningsScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_currentIndex],
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(color: Colors.black.withAlpha(8), blurRadius: 20, offset: const Offset(0, -4)),
          ],
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (i) => setState(() => _currentIndex = i),
          items: const [
            BottomNavigationBarItem(icon: Icon(Icons.dashboard_rounded), label: 'Dashboard'),
            BottomNavigationBarItem(icon: Icon(Icons.construction_rounded), label: 'Machines'),
            BottomNavigationBarItem(icon: Icon(Icons.calendar_month_rounded), label: 'Bookings'),
            BottomNavigationBarItem(icon: Icon(Icons.account_balance_wallet_rounded), label: 'Earnings'),
            BottomNavigationBarItem(icon: Icon(Icons.person_rounded), label: 'Profile'),
          ],
        ),
      ),
    );
  }
}

String _formatCurrency(double amount) {
  String numStr = amount.toInt().toString();
  if (numStr.length <= 3) return '₹$numStr';
  String last3 = numStr.substring(numStr.length - 3);
  String remaining = numStr.substring(0, numStr.length - 3);
  String formatted = '';
  for (int i = remaining.length; i > 0; i -= 2) {
    int start = i - 2 < 0 ? 0 : i - 2;
    if (formatted.isEmpty) {
      formatted = remaining.substring(start, i);
    } else {
      formatted = '${remaining.substring(start, i)},$formatted';
    }
  }
  return '₹$formatted,$last3';
}

const _months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
String _formatDate(DateTime d) => '${d.day} ${_months[d.month - 1]}';

class _DashboardBody extends StatefulWidget {
  const _DashboardBody();

  @override
  State<_DashboardBody> createState() => _DashboardBodyState();
}

class _DashboardBodyState extends State<_DashboardBody> {
  final _bookingService = BookingService();
  final _machineService = MachineService();
  final _authService = AuthService();

  List<Booking> _allBookings = [];
  int _machineCount = 0;
  Map<String, dynamic> _earnings = {};
  String _vendorName = '';
  bool _isLoading = true;
  String? _error;
  bool _isOnline = false;
  bool _isUpdatingStatus = false;
  List<Map<String, dynamic>> _trafficPoints = [];
  bool _isLoadingTraffic = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() { _isLoading = true; _error = null; });

    // Fetch each piece independently — one failure doesn't kill the dashboard
    List<Booking> bookings = [];
    List machines = [];
    Map<String, dynamic> profile = {};
    Map<String, dynamic> earnings = {};

    String? criticalError;

    try {
      profile = await _authService.getProfile();
    } catch (e) {
      final msg = e.toString();
      // User authenticated but no Firestore doc yet — auto-register as vendor
      if (msg.contains('User not found') || msg.contains('404')) {
        try {
          await _authService.registerVendor(name: 'Vendor');
          profile = await _authService.getProfile();
        } catch (regError) {
          criticalError = 'Registration failed. Please sign out and log in again.';
        }
      } else {
        criticalError = msg;
      }
    }

    // If profile still fails (token issue, network, etc.), show error
    if (criticalError != null) {
      setState(() { _error = criticalError; _isLoading = false; });
      return;
    }

    // Non-critical calls — failures show defaults (0 / empty list)
    try {
      await Future.wait([
        _bookingService.getVendorBookings()
            .then((v) => bookings = v)
            .catchError((e) { bookings = []; }),
        _machineService.getMyMachines()
            .then((v) => machines = v)
            .catchError((e) { machines = []; }),
        _bookingService.getEarningsSummary()
            .then((v) => earnings = v)
            .catchError((e) { earnings = {}; }),
      ]);
    } catch (_) {
      // Future.wait error — individual errors already handled above
    }

    final sorted = List<Booking>.from(bookings)
      ..sort((a, b) => b.startDate.compareTo(a.startDate));

    setState(() {
      _allBookings = sorted;
      _machineCount = machines.length;
      _vendorName = profile['user']?['name'] ?? profile['name'] ?? '';
      _isOnline = profile['user']?['isOnline'] ?? profile['isOnline'] ?? false;
      _earnings = earnings;
      _isLoading = false;
    });

    _loadTraffic();
  }

  Future<void> _loadTraffic() async {
    if (!mounted) return;
    setState(() => _isLoadingTraffic = true);
    try {
      final points = await _bookingService.getTrafficHeatmap(days: 90);
      if (!mounted) return;
      setState(() {
        _trafficPoints = points;
        _isLoadingTraffic = false;
      });
    } catch (_) {
      if (mounted) {
        setState(() {
          _trafficPoints = [];
          _isLoadingTraffic = false;
        });
      }
    }
  }

  Future<void> _toggleOnlineStatus() async {
    setState(() => _isUpdatingStatus = true);
    try {
      await _authService.updateOnlineStatus(!_isOnline);
      setState(() => _isOnline = !_isOnline);
    } catch (_) {
      // revert on error
    } finally {
      setState(() => _isUpdatingStatus = false);
    }
  }

  int get _pendingCount => _allBookings.where((b) => b.isPending).length;
  int get _activeCount => _allBookings.where((b) => b.isAccepted || b.isInProgress).length;
  int get _completedCount => _allBookings.where((b) => b.isCompleted).length;
  List<Booking> get _recentBookings => _allBookings.take(3).toList();

  double get _totalEarnings =>
      (_earnings['total'] ?? 0).toDouble();
  double get _monthEarnings =>
      (_earnings['month'] ?? _earnings['thisMonth'] ?? 0).toDouble();

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator(color: AppTheme.accentColor));
    }

    if (_error != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 48, color: Colors.red),
            const SizedBox(height: 12),
            Text(_error!, textAlign: TextAlign.center),
            const SizedBox(height: 16),
            ElevatedButton(onPressed: _loadData, child: const Text('Retry')),
          ],
        ),
      );
    }

    return SafeArea(
      child: RefreshIndicator(
        color: AppTheme.accentColor,
        onRefresh: _loadData,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Welcome back,',
                          style: TextStyle(fontSize: 15, color: AppTheme.textSecondary)),
                        const SizedBox(height: 4),
                        Text(
                          _vendorName.isNotEmpty ? _vendorName : 'Vendor',
                          style: const TextStyle(
                            fontSize: 22, fontWeight: FontWeight.w800,
                            color: AppTheme.textPrimary, letterSpacing: -0.5,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  Container(
                    width: 48, height: 48,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(14),
                      boxShadow: [AppTheme.softShadow],
                    ),
                    child: IconButton(
                      icon: const Icon(Icons.notifications_none_rounded, color: AppTheme.textPrimary),
                      onPressed: () {},
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Online / Offline toggle
              GestureDetector(
                onTap: _isUpdatingStatus ? null : _toggleOnlineStatus,
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
                  padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
                  decoration: BoxDecoration(
                    color: _isOnline
                        ? AppTheme.successColor.withAlpha(20)
                        : Colors.grey.withAlpha(15),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: _isOnline ? AppTheme.successColor.withAlpha(80) : Colors.grey.withAlpha(50),
                    ),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 12, height: 12,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: _isOnline ? AppTheme.successColor : Colors.grey,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Text(
                        _isOnline ? 'You are Online — accepting bookings' : 'You are Offline',
                        style: TextStyle(
                          fontWeight: FontWeight.w700,
                          fontSize: 14,
                          color: _isOnline ? AppTheme.successColor : Colors.grey[600],
                        ),
                      ),
                      const Spacer(),
                      _isUpdatingStatus
                        ? const SizedBox(width: 22, height: 22,
                            child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.accentColor))
                        : Switch(
                            value: _isOnline,
                            onChanged: (_) => _toggleOnlineStatus(),
                            activeColor: AppTheme.successColor,
                            materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                          ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Earnings banner
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(22),
                decoration: BoxDecoration(
                  gradient: AppTheme.primaryGradient,
                  borderRadius: BorderRadius.circular(22),
                  boxShadow: [AppTheme.mediumShadow],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.account_balance_wallet_rounded, color: Colors.white, size: 22),
                        SizedBox(width: 8),
                        Text('Total Earnings',
                          style: TextStyle(color: Colors.white70, fontSize: 14, fontWeight: FontWeight.w500)),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Text(_formatCurrency(_totalEarnings),
                      style: const TextStyle(
                        fontSize: 34, fontWeight: FontWeight.w800,
                        color: Colors.white, letterSpacing: -1,
                      )),
                    const SizedBox(height: 6),
                    Text('This month: ${_formatCurrency(_monthEarnings)}',
                      style: const TextStyle(color: Colors.white60, fontSize: 13)),
                  ],
                ),
              ),
              const SizedBox(height: 22),

              // Stats grid
              GridView.count(
                crossAxisCount: 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisSpacing: 14,
                mainAxisSpacing: 14,
                childAspectRatio: 1.25,
                children: [
                  _StatCard(icon: Icons.construction_rounded, label: 'My Machines',
                    value: '$_machineCount', color: AppTheme.accentColor),
                  _StatCard(icon: Icons.pending_actions_rounded, label: 'Pending',
                    value: '$_pendingCount', color: AppTheme.warningColor),
                  _StatCard(icon: Icons.check_circle_rounded, label: 'Active',
                    value: '$_activeCount', color: AppTheme.successColor),
                  _StatCard(icon: Icons.done_all_rounded, label: 'Completed',
                    value: '$_completedCount', color: AppTheme.infoColor),
                ],
              ),
              const SizedBox(height: 28),

              // Customer demand heatmap
              const Text('Customer Demand',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
              const SizedBox(height: 4),
              Text('Areas with the most bookings over the last 90 days',
                style: TextStyle(fontSize: 13, color: Colors.grey[600])),
              const SizedBox(height: 12),
              _TrafficHeatmapCard(
                points: _trafficPoints,
                isLoading: _isLoadingTraffic,
              ),
              const SizedBox(height: 28),

              // Recent bookings
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Recent Bookings',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
                  GestureDetector(
                    onTap: () => Navigator.push(context,
                      MaterialPageRoute(builder: (_) => const BookingsScreen())),
                    child: const Text('View All',
                      style: TextStyle(color: AppTheme.accentColor, fontWeight: FontWeight.w600, fontSize: 14)),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              if (_recentBookings.isEmpty)
                Center(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 24),
                    child: Text('No bookings yet', style: TextStyle(color: Colors.grey[500])),
                  ),
                )
              else
                ..._recentBookings.map((b) => _RecentBookingCard(booking: b)),

              const SizedBox(height: 24),

              // Quick actions
              const Text('Quick Actions',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
              const SizedBox(height: 14),

              _QuickAction(
                icon: Icons.add_circle_rounded,
                label: 'Add New Machine',
                subtitle: 'List a new machine for rent',
                color: AppTheme.accentColor,
                onTap: () => Navigator.push(context,
                  MaterialPageRoute(builder: (_) => const AddEditMachineScreen())),
              ),
              const SizedBox(height: 10),
              _QuickAction(
                icon: Icons.pending_actions_rounded,
                label: 'Pending Bookings',
                subtitle: '$_pendingCount requests waiting',
                color: AppTheme.warningColor,
                onTap: () => Navigator.push(context,
                  MaterialPageRoute(builder: (_) => const BookingsScreen())),
              ),
              const SizedBox(height: 10),
              _QuickAction(
                icon: Icons.bar_chart_rounded,
                label: 'View Earnings',
                subtitle: 'Track your revenue and payouts',
                color: AppTheme.successColor,
                onTap: () => Navigator.push(context,
                  MaterialPageRoute(builder: (_) => const EarningsScreen())),
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}

class _RecentBookingCard extends StatelessWidget {
  final Booking booking;
  const _RecentBookingCard({required this.booking});

  Color get _statusColor {
    switch (booking.status) {
      case 'pending': return AppTheme.warningColor;
      case 'accepted': return AppTheme.infoColor;
      case 'arrived': return AppTheme.warningColor;
      case 'in_progress': return AppTheme.successColor;
      case 'completed': return AppTheme.infoColor;
      case 'rejected': return AppTheme.errorColor;
      default: return AppTheme.textLight;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        boxShadow: [AppTheme.softShadow],
      ),
      child: Row(
        children: [
          Container(
            width: 50, height: 50,
            decoration: BoxDecoration(
              color: _statusColor.withAlpha(20),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(Icons.construction_rounded, color: _statusColor, size: 24),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(booking.customerName.isNotEmpty ? booking.customerName : 'Customer',
                  style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15, color: AppTheme.textPrimary)),
                const SizedBox(height: 3),
                Text('${booking.machineCategory} • ${_formatDate(booking.startDate)} - ${_formatDate(booking.endDate)}',
                  style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(
              color: _statusColor.withAlpha(20),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(booking.statusLabel,
              style: TextStyle(color: _statusColor, fontWeight: FontWeight.w700, fontSize: 11)),
          ),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  const _StatCard({required this.icon, required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [AppTheme.softShadow],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Container(
            width: 40, height: 40,
            decoration: BoxDecoration(
              color: color.withAlpha(20),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: color, size: 22),
          ),
          const Spacer(),
          Text(value, style: TextStyle(fontSize: 26, fontWeight: FontWeight.w800, color: color)),
          Text(label, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}

class _TrafficHeatmapCard extends StatelessWidget {
  final List<Map<String, dynamic>> points;
  final bool isLoading;
  const _TrafficHeatmapCard({required this.points, required this.isLoading});

  // India centroid — used as the initial camera target.
  static const CameraPosition _initialCamera = CameraPosition(
    target: LatLng(22.5937, 78.9629),
    zoom: 4.2,
  );

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return Container(
        height: 240,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [AppTheme.softShadow],
        ),
        child: const Center(child: CircularProgressIndicator(color: AppTheme.accentColor)),
      );
    }

    if (points.isEmpty) {
      return Container(
        height: 180,
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [AppTheme.softShadow],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.location_off_outlined, size: 36, color: Colors.grey[400]),
            const SizedBox(height: 10),
            Text('No demand data yet',
              style: TextStyle(color: Colors.grey[700], fontWeight: FontWeight.w600, fontSize: 14)),
            const SizedBox(height: 4),
            Text('Customer bookings will appear here as they come in',
              style: TextStyle(color: Colors.grey[500], fontSize: 12),
              textAlign: TextAlign.center),
          ],
        ),
      );
    }

    // Max count is used to scale circle size & opacity.
    final maxCount = points.map((p) => (p['count'] as num).toInt()).reduce((a, b) => a > b ? a : b);

    final circles = <Circle>{};
    final markers = <Marker>{};
    for (final p in points) {
      final lat = (p['lat'] as num).toDouble();
      final lng = (p['lng'] as num).toDouble();
      final count = (p['count'] as num).toInt();
      final city = (p['city'] ?? '') as String;
      final intensity = maxCount == 0 ? 0.0 : count / maxCount;
      // Radius 12km baseline + up to ~50km for the hottest city.
      final radiusMeters = 12000 + intensity * 50000;
      final fillAlpha = (38 + 115 * intensity).round().clamp(0, 255);
      circles.add(Circle(
        circleId: CircleId('c_$city'),
        center: LatLng(lat, lng),
        radius: radiusMeters,
        fillColor: AppTheme.accentColor.withAlpha(fillAlpha),
        strokeColor: AppTheme.accentColor.withAlpha(150),
        strokeWidth: 1,
      ));
      markers.add(Marker(
        markerId: MarkerId('m_$city'),
        position: LatLng(lat, lng),
        infoWindow: InfoWindow(title: city, snippet: '$count booking${count == 1 ? '' : 's'}'),
      ));
    }

    // Build camera that frames all points.
    final lats = points.map((p) => (p['lat'] as num).toDouble());
    final lngs = points.map((p) => (p['lng'] as num).toDouble());
    final south = lats.reduce((a, b) => a < b ? a : b);
    final north = lats.reduce((a, b) => a > b ? a : b);
    final west = lngs.reduce((a, b) => a < b ? a : b);
    final east = lngs.reduce((a, b) => a > b ? a : b);
    final bounds = LatLngBounds(
      southwest: LatLng(south, west),
      northeast: LatLng(north, east),
    );

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [AppTheme.softShadow],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ClipRRect(
            borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
            child: SizedBox(
              height: 240,
              child: GoogleMap(
                initialCameraPosition: _initialCamera,
                circles: circles,
                markers: markers,
                myLocationButtonEnabled: false,
                zoomControlsEnabled: false,
                mapToolbarEnabled: false,
                onMapCreated: (controller) {
                  if (points.length > 1) {
                    Future.delayed(const Duration(milliseconds: 300), () {
                      controller.animateCamera(CameraUpdate.newLatLngBounds(bounds, 48));
                    });
                  } else {
                    controller.animateCamera(
                      CameraUpdate.newLatLngZoom(LatLng(
                        (points.first['lat'] as num).toDouble(),
                        (points.first['lng'] as num).toDouble(),
                      ), 9),
                    );
                  }
                },
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 10, height: 10,
                      decoration: const BoxDecoration(
                        shape: BoxShape.circle,
                        color: AppTheme.accentColor,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text('${points.length} hot area${points.length == 1 ? '' : 's'}',
                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppTheme.textPrimary)),
                    const SizedBox(width: 10),
                    Text('• bigger circle = more demand',
                      style: TextStyle(fontSize: 12, color: Colors.grey[600])),
                  ],
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: points.take(5).map((p) {
                    final city = (p['city'] ?? '') as String;
                    final count = (p['count'] as num).toInt();
                    return Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: AppTheme.accentColor.withAlpha(26),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text('$city · $count',
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppTheme.accentColor)),
                    );
                  }).toList(),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _QuickAction extends StatelessWidget {
  final IconData icon;
  final String label;
  final String subtitle;
  final Color color;
  final VoidCallback onTap;

  const _QuickAction({required this.icon, required this.label, required this.subtitle, required this.color, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [AppTheme.softShadow],
        ),
        child: Row(
          children: [
            Container(
              width: 48, height: 48,
              decoration: BoxDecoration(
                color: color.withAlpha(20),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Icon(icon, color: color, size: 24),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15, color: AppTheme.textPrimary)),
                  const SizedBox(height: 2),
                  Text(subtitle, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
                ],
              ),
            ),
            const Icon(Icons.chevron_right_rounded, color: AppTheme.textLight, size: 24),
          ],
        ),
      ),
    );
  }
}
