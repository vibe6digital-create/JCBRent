import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../config/theme.dart';
import '../../models/booking.dart';
import '../../services/booking_service.dart';
import 'booking_detail_screen.dart';

class BookingsListScreen extends StatefulWidget {
  const BookingsListScreen({super.key});

  @override
  State<BookingsListScreen> createState() => _BookingsListScreenState();
}

class _BookingsListScreenState extends State<BookingsListScreen> with SingleTickerProviderStateMixin {
  final _bookingService = BookingService();
  late TabController _tabController;
  List<Booking> _bookings = [];
  bool _isLoading = true;

  final _tabs = ['All', 'Active', 'Completed'];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _tabs.length, vsync: this);
    _loadBookings();
  }

  Future<void> _loadBookings() async {
    setState(() => _isLoading = true);
    try {
      _bookings = await _bookingService.getMyBookings();
    } catch (_) {}
    if (mounted) setState(() => _isLoading = false);
  }

  List<Booking> get _filteredBookings {
    switch (_tabController.index) {
      case 1: return _bookings.where((b) => ['pending', 'accepted', 'in_progress'].contains(b.status)).toList();
      case 2: return _bookings.where((b) => ['completed', 'rejected', 'cancelled'].contains(b.status)).toList();
      default: return _bookings;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: _buildAppBar(),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _filteredBookings.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.calendar_today, size: 64, color: Colors.grey[300]),
                      const SizedBox(height: 16),
                      Text('No bookings found', style: TextStyle(fontSize: 18, color: Colors.grey[500])),
                      const SizedBox(height: 8),
                      Text('Your bookings will appear here', style: TextStyle(color: Colors.grey[400])),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _loadBookings,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _filteredBookings.length,
                    itemBuilder: (_, i) {
                      final b = _filteredBookings[i];
                      return _BookingCard(
                        booking: b,
                        onTap: () async {
                          await Navigator.push(context,
                            MaterialPageRoute(builder: (_) => BookingDetailScreen(booking: b)));
                          _loadBookings();
                        },
                      );
                    },
                  ),
                ),
    );
  }

  PreferredSizeWidget? _buildAppBar() {
    // Only show appbar when used as standalone (with initialCategory style)
    // In bottom nav, the home screen handles the appbar
    return AppBar(
      title: const Text('My Bookings'),
      automaticallyImplyLeading: false,
      bottom: TabBar(
        controller: _tabController,
        onTap: (_) => setState(() {}),
        indicatorColor: Colors.white,
        indicatorWeight: 3,
        labelColor: Colors.white,
        unselectedLabelColor: Colors.white70,
        labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
        unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.normal, fontSize: 14),
        tabs: _tabs.map((t) => Tab(text: t)).toList(),
      ),
    );
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }
}

class _BookingCard extends StatelessWidget {
  final Booking booking;
  final VoidCallback onTap;
  const _BookingCard({required this.booking, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 48, height: 48,
                    decoration: BoxDecoration(
                      color: _getStatusColor(booking.status).withAlpha(20),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(_getStatusIcon(booking.status), color: _getStatusColor(booking.status)),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(booking.machineModel,
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                        Text(booking.machineCategory,
                          style: TextStyle(color: Colors.grey[600], fontSize: 13)),
                      ],
                    ),
                  ),
                  _StatusBadge(status: booking.status, label: booking.statusLabel),
                ],
              ),
              const SizedBox(height: 12),
              const Divider(height: 1),
              const SizedBox(height: 12),
              Row(
                children: [
                  Icon(Icons.calendar_today, size: 15, color: Colors.grey[500]),
                  const SizedBox(width: 6),
                  Text(
                    '${DateFormat('dd MMM').format(booking.startDate)} - ${DateFormat('dd MMM yyyy').format(booking.endDate)}',
                    style: TextStyle(color: Colors.grey[600], fontSize: 13),
                  ),
                  const Spacer(),
                  Text('Rs ${booking.estimatedCost.toInt()}',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppTheme.secondaryColor)),
                ],
              ),
              if (booking.status == 'in_progress') ...[
                const SizedBox(height: 10),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed: onTap,
                    icon: const Icon(Icons.location_on, size: 18),
                    label: const Text('Track Vehicle'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.blue,
                      side: const BorderSide(color: Colors.blue),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                ),
              ],
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
      case 'cancelled': return Colors.red[700]!;
      case 'completed': return Colors.blue;
      case 'in_progress': return Colors.purple;
      default: return Colors.orange;
    }
  }

  IconData _getStatusIcon(String status) {
    switch (status) {
      case 'accepted': return Icons.check_circle_outline;
      case 'rejected': return Icons.cancel_outlined;
      case 'cancelled': return Icons.cancel_outlined;
      case 'completed': return Icons.done_all;
      case 'in_progress': return Icons.local_shipping;
      default: return Icons.hourglass_empty;
    }
  }
}

class _StatusBadge extends StatelessWidget {
  final String status;
  final String label;
  const _StatusBadge({required this.status, required this.label});

  @override
  Widget build(BuildContext context) {
    Color color;
    switch (status) {
      case 'accepted': color = AppTheme.successColor;
      case 'rejected': color = AppTheme.errorColor;
      case 'cancelled': color = Colors.red[700]!;
      case 'completed': color = Colors.blue;
      case 'in_progress': color = Colors.purple;
      default: color = Colors.orange;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withAlpha(20),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(label, style: TextStyle(color: color, fontWeight: FontWeight.w600, fontSize: 12)),
    );
  }
}
