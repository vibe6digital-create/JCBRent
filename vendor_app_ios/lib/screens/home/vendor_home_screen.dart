import 'package:flutter/material.dart';
import '../../config/theme.dart';
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
  List<Booking> _recentBookings = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    await _bookingService.getVendorBookings();
    await _machineService.getMyMachines();
    if (mounted) {
      setState(() {
        _recentBookings = _bookingService.getRecentBookings();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator(color: AppTheme.accentColor));
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
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Welcome back,',
                        style: TextStyle(fontSize: 15, color: AppTheme.textSecondary)),
                      SizedBox(height: 4),
                      Text('Suryaprakash Equipment',
                        style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: AppTheme.textPrimary, letterSpacing: -0.5)),
                    ],
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
              const SizedBox(height: 24),

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
                        Text('Total Earnings', style: TextStyle(color: Colors.white70, fontSize: 14, fontWeight: FontWeight.w500)),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Text(_formatCurrency(_bookingService.totalEarnings),
                      style: const TextStyle(fontSize: 34, fontWeight: FontWeight.w800, color: Colors.white, letterSpacing: -1)),
                    const SizedBox(height: 6),
                    Text('This month: ${_formatCurrency(_bookingService.monthEarnings)}',
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
                    value: '${_machineService.machineCount}', color: AppTheme.accentColor),
                  _StatCard(icon: Icons.pending_actions_rounded, label: 'Pending',
                    value: '${_bookingService.pendingCount}', color: AppTheme.warningColor),
                  _StatCard(icon: Icons.check_circle_rounded, label: 'Active',
                    value: '${_bookingService.activeCount}', color: AppTheme.successColor),
                  _StatCard(icon: Icons.done_all_rounded, label: 'Completed',
                    value: '${_bookingService.completedCount}', color: AppTheme.infoColor),
                ],
              ),
              const SizedBox(height: 28),

              // Recent bookings
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Recent Bookings',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
                  GestureDetector(
                    onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const BookingsScreen())),
                    child: const Text('View All', style: TextStyle(color: AppTheme.accentColor, fontWeight: FontWeight.w600, fontSize: 14)),
                  ),
                ],
              ),
              const SizedBox(height: 14),

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
                subtitle: '${_bookingService.pendingCount} requests waiting',
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
                Text(booking.customerName,
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
