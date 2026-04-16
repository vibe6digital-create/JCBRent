import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import 'package:geolocator/geolocator.dart';
import '../../config/app_config.dart';
import '../../config/theme.dart';
import '../../models/machine.dart';
import '../../models/booking.dart';
import '../../services/machine_service.dart';
import '../../services/booking_service.dart';
import '../../services/api_service.dart';
import '../search/search_screen.dart';
import '../booking/bookings_list_screen.dart';
import '../booking/booking_detail_screen.dart';
import '../estimate/estimate_screen.dart';
import '../profile/profile_screen.dart';
import '../notifications/notifications_screen.dart';
import '../machine/machine_detail_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;
  int _unreadCount = 0;

  @override
  void initState() {
    super.initState();
    _loadUnreadCount();
  }

  Future<void> _loadUnreadCount() async {
    try {
      final response = await ApiService().get('/notifications');
      final List data = response['notifications'] ?? response['data'] ?? [];
      if (mounted) {
        setState(() {
          _unreadCount = data.where((n) => !(n['isRead'] ?? n['read'] ?? false)).length;
        });
      }
    } catch (_) {}
  }

  void _refreshNotificationCount() => _loadUnreadCount();

  @override
  Widget build(BuildContext context) {
    final screens = [
      _HomeBody(onRefreshNotifications: _refreshNotificationCount),
      const SearchScreen(),
      const BookingsListScreen(),
      const ProfileScreen(),
    ];

    return Scaffold(
      appBar: _currentIndex == 0
          ? AppBar(
              title: const Row(
                children: [
                  Icon(Icons.construction, size: 28),
                  SizedBox(width: 8),
                  Text('HeavyRent', style: TextStyle(fontWeight: FontWeight.bold)),
                ],
              ),
              actions: [
                IconButton(
                  icon: Stack(
                    clipBehavior: Clip.none,
                    children: [
                      const Icon(Icons.notifications_outlined, size: 28),
                      if (_unreadCount > 0)
                        Positioned(
                          right: -4, top: -4,
                          child: Container(
                            padding: const EdgeInsets.all(3),
                            constraints: const BoxConstraints(minWidth: 18, minHeight: 18),
                            decoration: const BoxDecoration(
                              color: Colors.red,
                              shape: BoxShape.circle,
                            ),
                            child: Text(
                              _unreadCount > 99 ? '99+' : '$_unreadCount',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ),
                        ),
                    ],
                  ),
                  onPressed: () async {
                    await Navigator.push(context,
                      MaterialPageRoute(builder: (_) => const NotificationsScreen()));
                    _loadUnreadCount(); // refresh count after viewing
                  },
                ),
              ],
            )
          : null,
      body: screens[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (i) => setState(() => _currentIndex = i),
        type: BottomNavigationBarType.fixed,
        selectedItemColor: AppTheme.primaryColor,
        unselectedItemColor: Colors.grey,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home_filled), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.search), label: 'Search'),
          BottomNavigationBarItem(icon: Icon(Icons.calendar_today), label: 'Bookings'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }
}

class _HomeBody extends StatefulWidget {
  final VoidCallback? onRefreshNotifications;
  const _HomeBody({this.onRefreshNotifications});

  @override
  State<_HomeBody> createState() => _HomeBodyState();
}

class _HomeBodyState extends State<_HomeBody> {
  final _machineService = MachineService();
  final _bookingService = BookingService();
  List<Machine> _featuredMachines = [];
  List<Booking> _recentBookings = [];
  bool _loading = true;
  String? _detectedCity;
  bool _locationLoading = false;

  static const _defaultCategories = [
    {'name': 'JCB',       'icon': Icons.construction},
    {'name': 'Excavator', 'icon': Icons.precision_manufacturing},
    {'name': 'Crane',     'icon': Icons.height},
    {'name': 'Bulldozer', 'icon': Icons.agriculture},
    {'name': 'Roller',    'icon': Icons.roller_shades},
    {'name': 'Pokelane',  'icon': Icons.engineering},
  ];

  @override
  void initState() {
    super.initState();
    _detectLocationAndLoad();
  }

  Future<void> _detectLocationAndLoad() async {
    setState(() => _locationLoading = true);
    try {
      LocationPermission perm = await Geolocator.checkPermission();
      if (perm == LocationPermission.denied) {
        perm = await Geolocator.requestPermission();
      }
      if (perm == LocationPermission.whileInUse || perm == LocationPermission.always) {
        final pos = await Geolocator.getCurrentPosition(
          locationSettings: const LocationSettings(
            accuracy: LocationAccuracy.low,
            timeLimit: Duration(seconds: 8),
          ),
        );
        final city = await _reverseGeocode(pos.latitude, pos.longitude);
        if (mounted && city != null) setState(() => _detectedCity = city);
      }
    } catch (_) {}
    if (mounted) setState(() => _locationLoading = false);
    await _loadData();
  }

  Future<String?> _reverseGeocode(double lat, double lng) async {
    try {
      final url = Uri.parse(
        'https://maps.googleapis.com/maps/api/geocode/json'
        '?latlng=$lat,$lng'
        '&result_type=locality'
        '&key=${AppConfig.googleMapsApiKey}',
      );
      final resp = await http.get(url).timeout(const Duration(seconds: 5));
      final data = jsonDecode(resp.body);
      final results = data['results'] as List? ?? [];
      if (results.isNotEmpty) {
        final components = results[0]['address_components'] as List? ?? [];
        for (final c in components) {
          final types = (c['types'] as List).cast<String>();
          if (types.contains('locality')) return c['long_name'] as String?;
        }
      }
    } catch (_) {}
    return null;
  }

  Future<void> _loadData() async {
    try {
      final results = await Future.wait([
        _machineService.searchMachines(city: _detectedCity),
        _bookingService.getMyBookings(),
      ]);
      if (mounted) {
        final machines = results[0] as List<Machine>;
        final bookings = results[1] as List<Booking>;
        setState(() {
          _featuredMachines = machines.take(6).toList();
          final sorted = List<Booking>.from(bookings)
            ..sort((a, b) => b.startDate.compareTo(a.startDate));
          _recentBookings = sorted.take(3).toList();
          _loading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: () async {
        await _detectLocationAndLoad();
        widget.onRefreshNotifications?.call();
      },
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Location chip + search bar
            Row(
              children: [
                if (_locationLoading)
                  const Row(children: [
                    SizedBox(width: 14, height: 14,
                      child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.primaryColor)),
                    SizedBox(width: 6),
                    Text('Detecting location...', style: TextStyle(fontSize: 13, color: Colors.grey)),
                    SizedBox(width: 8),
                  ])
                else if (_detectedCity != null)
                  GestureDetector(
                    onTap: () => Navigator.push(context, MaterialPageRoute(
                      builder: (_) => SearchScreen(initialCity: _detectedCity))),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                      margin: const EdgeInsets.only(right: 8, bottom: 8),
                      decoration: BoxDecoration(
                        color: AppTheme.primaryColor.withAlpha(15),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: AppTheme.primaryColor.withAlpha(60)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.location_on, size: 14, color: AppTheme.primaryColor),
                          const SizedBox(width: 4),
                          Text(_detectedCity!,
                            style: const TextStyle(fontSize: 13, color: AppTheme.primaryColor, fontWeight: FontWeight.w600)),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
            GestureDetector(
              onTap: () {
                final homeState = context.findAncestorStateOfType<_HomeScreenState>();
                homeState?.setState(() => homeState._currentIndex = 1);
              },
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey[300]!),
                ),
                child: Row(
                  children: [
                    Icon(Icons.search, color: Colors.grey[400]),
                    const SizedBox(width: 12),
                    Text(
                      _detectedCity != null
                          ? 'Search machines in $_detectedCity...'
                          : 'Search by machine type or city...',
                      style: TextStyle(color: Colors.grey[400], fontSize: 16),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Smart Estimate banner
            GestureDetector(
              onTap: () => Navigator.push(context,
                MaterialPageRoute(builder: (_) => const EstimateScreen())),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [AppTheme.secondaryColor, Color(0xFF16213E)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppTheme.accentColor,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: const Text('AI Powered', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                          ),
                          const SizedBox(height: 10),
                          const Text('Smart Estimate',
                            style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 4),
                          Text('Get instant time & cost estimate',
                            style: TextStyle(color: Colors.white.withAlpha(180), fontSize: 14)),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.white.withAlpha(25),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.auto_awesome, color: AppTheme.accentColor, size: 36),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Categories
            const Text('Equipment Categories',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            GridView.count(
              crossAxisCount: 3,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              children: _defaultCategories.map((cat) => _CategoryCard(
                icon: cat['icon'] as IconData,
                label: cat['name'] as String,
                onTap: () => _searchCategory(cat['name'] as String),
              )).toList(),
            ),
            const SizedBox(height: 24),

            // Featured Machines
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  _detectedCity != null ? 'Machines near $_detectedCity' : 'Available Machines',
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                TextButton(
                  onPressed: () {
                    final homeState = context.findAncestorStateOfType<_HomeScreenState>();
                    homeState?.setState(() => homeState._currentIndex = 1);
                  },
                  child: const Text('View All'),
                ),
              ],
            ),
            const SizedBox(height: 8),
            _loading
                ? SizedBox(
                    height: 220,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: 3,
                      separatorBuilder: (_, __) => const SizedBox(width: 12),
                      itemBuilder: (_, __) => Container(
                        width: 180,
                        decoration: BoxDecoration(
                          color: Colors.grey[200],
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
                    ),
                  )
                : _featuredMachines.isEmpty
                    ? Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(28),
                        decoration: BoxDecoration(
                          color: Colors.grey[100],
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Column(
                          children: [
                            Icon(Icons.construction_outlined, size: 48, color: Colors.grey[400]),
                            const SizedBox(height: 12),
                            Text(
                              _detectedCity != null
                                  ? 'No machines in $_detectedCity yet'
                                  : 'No machines available yet',
                              style: TextStyle(color: Colors.grey[600], fontWeight: FontWeight.w600)),
                            const SizedBox(height: 4),
                            Text('Check back soon or search by category above',
                              style: TextStyle(color: Colors.grey[400], fontSize: 13),
                              textAlign: TextAlign.center),
                          ],
                        ),
                      )
                    : SizedBox(
                        height: 230,
                        child: ListView.separated(
                          scrollDirection: Axis.horizontal,
                          itemCount: _featuredMachines.length,
                          separatorBuilder: (_, __) => const SizedBox(width: 12),
                          itemBuilder: (_, i) => _FeaturedMachineCard(
                            machine: _featuredMachines[i],
                            onTap: () => Navigator.push(context,
                              MaterialPageRoute(builder: (_) => MachineDetailScreen(machine: _featuredMachines[i]))),
                          ),
                        ),
                      ),

            // Recent Bookings
            if (_recentBookings.isNotEmpty) ...[
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Recent Bookings',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  TextButton(
                    onPressed: () {
                      final homeState = context.findAncestorStateOfType<_HomeScreenState>();
                      homeState?.setState(() => homeState._currentIndex = 2);
                    },
                    child: const Text('View All'),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              ...(_recentBookings.map((b) => _RecentBookingCard(
                booking: b,
                onTap: () => Navigator.push(context,
                  MaterialPageRoute(builder: (_) => BookingDetailScreen(booking: b))),
              ))),
            ],

            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  void _searchCategory(String category) {
    Navigator.push(context, MaterialPageRoute(
      builder: (_) => SearchScreen(initialCategory: category, initialCity: _detectedCity),
    ));
  }
}

// ── Category Card ─────────────────────────────────────────────────────────────

class _CategoryCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _CategoryCard({required this.icon, required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [BoxShadow(color: Colors.black.withAlpha(13), blurRadius: 8, offset: const Offset(0, 2))],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: AppTheme.primaryColor.withAlpha(20),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, size: 28, color: AppTheme.primaryColor),
            ),
            const SizedBox(height: 8),
            Text(label, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
          ],
        ),
      ),
    );
  }
}

// ── Featured Machine Card ─────────────────────────────────────────────────────

class _FeaturedMachineCard extends StatelessWidget {
  final Machine machine;
  final VoidCallback onTap;

  const _FeaturedMachineCard({required this.machine, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 180,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [BoxShadow(color: Colors.black.withAlpha(15), blurRadius: 10, offset: const Offset(0, 4))],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image or icon fallback
            ClipRRect(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
              child: SizedBox(
                height: 110,
                width: double.infinity,
                child: machine.images.isNotEmpty
                    ? Image.network(
                        machine.images.first,
                        fit: BoxFit.cover,
                        loadingBuilder: (_, child, progress) => progress == null
                            ? child
                            : Container(
                                color: AppTheme.primaryColor.withAlpha(15),
                                child: const Center(child: CircularProgressIndicator(strokeWidth: 2)),
                              ),
                        errorBuilder: (_, __, ___) => Container(
                          color: AppTheme.primaryColor.withAlpha(15),
                          child: Center(child: Icon(_getCategoryIcon(machine.category), size: 44, color: AppTheme.primaryColor)),
                        ),
                      )
                    : Container(
                        color: AppTheme.primaryColor.withAlpha(15),
                        child: Center(child: Icon(_getCategoryIcon(machine.category), size: 44, color: AppTheme.primaryColor)),
                      ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(10, 8, 10, 8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(machine.category,
                    style: const TextStyle(color: AppTheme.primaryColor, fontSize: 11, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 2),
                  Text(machine.model,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                    maxLines: 1, overflow: TextOverflow.ellipsis),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.location_on, size: 12, color: Colors.grey),
                      const SizedBox(width: 2),
                      Expanded(child: Text(machine.location.city,
                        style: const TextStyle(color: Colors.grey, fontSize: 12),
                        maxLines: 1, overflow: TextOverflow.ellipsis)),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text('Rs ${machine.hourlyRate.toInt()}/hr',
                    style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.secondaryColor, fontSize: 15)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  IconData _getCategoryIcon(String cat) {
    switch (cat) {
      case 'JCB': return Icons.construction;
      case 'Excavator': return Icons.precision_manufacturing;
      case 'Crane': return Icons.height;
      case 'Bulldozer': return Icons.agriculture;
      case 'Roller': return Icons.roller_shades;
      case 'Pokelane': return Icons.engineering;
      default: return Icons.construction;
    }
  }
}

// ── Recent Booking Card ───────────────────────────────────────────────────────

class _RecentBookingCard extends StatelessWidget {
  final Booking booking;
  final VoidCallback onTap;

  const _RecentBookingCard({required this.booking, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            children: [
              Container(
                width: 48, height: 48,
                decoration: BoxDecoration(
                  color: _getStatusColor(booking.status).withAlpha(25),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(_getStatusIcon(booking.status), color: _getStatusColor(booking.status)),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('${booking.machineCategory} - ${booking.machineModel}',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                    const SizedBox(height: 2),
                    Text('${DateFormat('dd MMM').format(booking.startDate)} - ${DateFormat('dd MMM').format(booking.endDate)}',
                      style: TextStyle(color: Colors.grey[600], fontSize: 13)),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: _getStatusColor(booking.status).withAlpha(25),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  booking.statusLabel,
                  style: TextStyle(
                    color: _getStatusColor(booking.status),
                    fontWeight: FontWeight.w600,
                    fontSize: 12,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'accepted': return AppTheme.successColor;
      case 'rejected': return AppTheme.errorColor;
      case 'completed': return Colors.blue;
      case 'in_progress': return Colors.purple;
      default: return Colors.orange;
    }
  }

  IconData _getStatusIcon(String status) {
    switch (status) {
      case 'accepted': return Icons.check_circle_outline;
      case 'rejected': return Icons.cancel_outlined;
      case 'completed': return Icons.done_all;
      case 'in_progress': return Icons.local_shipping;
      default: return Icons.hourglass_empty;
    }
  }
}
