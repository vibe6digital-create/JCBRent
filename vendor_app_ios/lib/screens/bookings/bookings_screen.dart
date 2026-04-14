import 'package:flutter/material.dart';
import '../../config/theme.dart';
import '../../services/booking_service.dart';
import '../../models/booking.dart';

const _months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
String _fmtDate(DateTime d) => '${d.day} ${_months[d.month - 1]}';

String _fmtCurrency(double amount) {
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

class BookingsScreen extends StatefulWidget {
  const BookingsScreen({super.key});

  @override
  State<BookingsScreen> createState() => _BookingsScreenState();
}

class _BookingsScreenState extends State<BookingsScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _service = BookingService();
  List<Booking> _allBookings = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    _loadBookings();
  }

  Future<void> _loadBookings() async {
    final bookings = await _service.getVendorBookings();
    if (mounted) setState(() { _allBookings = bookings; _isLoading = false; });
  }

  List<Booking> _pending() => _allBookings.where((b) => b.isPending).toList();
  List<Booking> _active() => _allBookings.where((b) => b.isAccepted || b.isInProgress).toList();
  List<Booking> _done() => _allBookings.where((b) => b.isCompleted).toList();
  List<Booking> _rejected() => _allBookings.where((b) => b.isRejected).toList();

  Future<void> _doAction(String id, String action) async {
    switch (action) {
      case 'accept': await _service.acceptBooking(id); break;
      case 'reject': await _service.rejectBooking(id); break;
      case 'start': await _service.startBooking(id); break;
      case 'complete': await _service.completeBooking(id); break;
    }
    await _loadBookings();
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text('Booking ${action}ed successfully'),
        backgroundColor: AppTheme.successColor,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      appBar: AppBar(
        title: const Text('Bookings'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(56),
          child: Container(
            margin: const EdgeInsets.fromLTRB(16, 0, 16, 8),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              boxShadow: [AppTheme.softShadow],
            ),
            child: TabBar(
              controller: _tabController,
              indicatorSize: TabBarIndicatorSize.tab,
              indicator: BoxDecoration(
                color: AppTheme.accentColor,
                borderRadius: BorderRadius.circular(14),
              ),
              labelColor: Colors.white,
              unselectedLabelColor: AppTheme.textSecondary,
              labelStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
              unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.w500, fontSize: 13),
              dividerColor: Colors.transparent,
              tabs: [
                Tab(text: 'Pending (${_pending().length})'),
                Tab(text: 'Active (${_active().length})'),
                Tab(text: 'Done (${_done().length})'),
                Tab(text: 'Rejected'),
              ],
            ),
          ),
        ),
      ),
      body: _isLoading
        ? const Center(child: CircularProgressIndicator(color: AppTheme.accentColor))
        : TabBarView(
            controller: _tabController,
            children: [
              _BookingList(bookings: _pending(), onAction: _doAction, type: 'pending'),
              _BookingList(bookings: _active(), onAction: _doAction, type: 'active'),
              _BookingList(bookings: _done(), onAction: _doAction, type: 'done'),
              _BookingList(bookings: _rejected(), onAction: _doAction, type: 'rejected'),
            ],
          ),
    );
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }
}

class _BookingList extends StatelessWidget {
  final List<Booking> bookings;
  final Future<void> Function(String id, String action) onAction;
  final String type;

  const _BookingList({required this.bookings, required this.onAction, required this.type});

  @override
  Widget build(BuildContext context) {
    if (bookings.isEmpty) {
      final icons = {'pending': Icons.pending_actions_rounded, 'active': Icons.check_circle_rounded,
        'done': Icons.done_all_rounded, 'rejected': Icons.cancel_rounded};
      final colors = {'pending': AppTheme.warningColor, 'active': AppTheme.successColor,
        'done': AppTheme.infoColor, 'rejected': AppTheme.errorColor};
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 80, height: 80,
              decoration: BoxDecoration(
                color: (colors[type] ?? AppTheme.textLight).withAlpha(20),
                borderRadius: BorderRadius.circular(24),
              ),
              child: Icon(icons[type] ?? Icons.inbox_rounded, size: 40, color: colors[type]),
            ),
            const SizedBox(height: 18),
            Text('No $type bookings', style: const TextStyle(color: AppTheme.textSecondary, fontSize: 16, fontWeight: FontWeight.w500)),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: bookings.length,
      itemBuilder: (_, i) => _BookingCard(booking: bookings[i], onAction: onAction),
    );
  }
}

class _BookingCard extends StatelessWidget {
  final Booking booking;
  final Future<void> Function(String id, String action) onAction;

  const _BookingCard({required this.booking, required this.onAction});

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
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [AppTheme.softShadow],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              children: [
                Container(
                  width: 44, height: 44,
                  decoration: BoxDecoration(
                    color: _statusColor.withAlpha(20),
                    borderRadius: BorderRadius.circular(13),
                  ),
                  child: Icon(Icons.person_rounded, color: _statusColor, size: 22),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(booking.customerName,
                        style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16, color: AppTheme.textPrimary)),
                      const SizedBox(height: 2),
                      Row(
                        children: [
                          const Icon(Icons.phone_rounded, size: 13, color: AppTheme.textLight),
                          const SizedBox(width: 4),
                          Text(booking.customerPhone,
                            style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
                        ],
                      ),
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
            const SizedBox(height: 14),

            // Machine info
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppTheme.backgroundColor,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  const Icon(Icons.construction_rounded, size: 18, color: AppTheme.accentColor),
                  const SizedBox(width: 8),
                  Text('${booking.machineCategory} - ${booking.machineModel}',
                    style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14, color: AppTheme.textPrimary)),
                ],
              ),
            ),
            const SizedBox(height: 10),

            // Date & Location
            Row(
              children: [
                const Icon(Icons.calendar_today_rounded, size: 14, color: AppTheme.textLight),
                const SizedBox(width: 6),
                Text('${_fmtDate(booking.startDate)} - ${_fmtDate(booking.endDate)}',
                  style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
              ],
            ),
            const SizedBox(height: 6),
            Row(
              children: [
                const Icon(Icons.location_on_rounded, size: 14, color: AppTheme.textLight),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(booking.workAddress,
                    style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
                ),
              ],
            ),
            const SizedBox(height: 10),

            // Rate info
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: AppTheme.accentColor.withAlpha(12),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text('${_fmtCurrency(booking.rate)}/${booking.rateType}',
                    style: const TextStyle(color: AppTheme.accentColor, fontWeight: FontWeight.w700, fontSize: 12)),
                ),
                const SizedBox(width: 10),
                Text('Total: ${_fmtCurrency(booking.estimatedCost)}',
                  style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: AppTheme.textPrimary)),
              ],
            ),

            // Notes
            if (booking.notes != null && booking.notes!.isNotEmpty) ...[
              const SizedBox(height: 10),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.note_rounded, size: 14, color: AppTheme.textLight),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(booking.notes!,
                      style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13, fontStyle: FontStyle.italic)),
                  ),
                ],
              ),
            ],

            // Rating for completed
            if (booking.isCompleted && booking.rating != null) ...[
              const SizedBox(height: 10),
              Row(
                children: [
                  ...List.generate(5, (i) => Icon(
                    i < booking.rating!.round() ? Icons.star_rounded : Icons.star_border_rounded,
                    size: 18, color: AppTheme.warningColor,
                  )),
                  const SizedBox(width: 6),
                  Text('${booking.rating}', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: AppTheme.textPrimary)),
                ],
              ),
              if (booking.review != null && booking.review!.isNotEmpty) ...[
                const SizedBox(height: 4),
                Text('"${booking.review}"',
                  style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13, fontStyle: FontStyle.italic)),
              ],
            ],

            // Action buttons
            if (booking.isPending) ...[
              const SizedBox(height: 14),
              Row(
                children: [
                  Expanded(
                    child: SizedBox(
                      height: 44,
                      child: ElevatedButton.icon(
                        onPressed: () => onAction(booking.id, 'accept'),
                        icon: const Icon(Icons.check_rounded, size: 18),
                        label: const Text('Accept'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.successColor,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: SizedBox(
                      height: 44,
                      child: OutlinedButton.icon(
                        onPressed: () => onAction(booking.id, 'reject'),
                        icon: const Icon(Icons.close_rounded, size: 18, color: AppTheme.errorColor),
                        label: const Text('Reject', style: TextStyle(color: AppTheme.errorColor)),
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: AppTheme.errorColor, width: 1.5),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
            if (booking.isAccepted) ...[
              const SizedBox(height: 14),
              SizedBox(
                width: double.infinity, height: 44,
                child: ElevatedButton.icon(
                  onPressed: () => onAction(booking.id, 'start'),
                  icon: const Icon(Icons.play_arrow_rounded, size: 20),
                  label: const Text('Start Work'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.infoColor,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),
            ],
            if (booking.isInProgress) ...[
              const SizedBox(height: 14),
              SizedBox(
                width: double.infinity, height: 44,
                child: Container(
                  decoration: BoxDecoration(
                    gradient: AppTheme.accentGradient,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: ElevatedButton.icon(
                    onPressed: () => onAction(booking.id, 'complete'),
                    icon: const Icon(Icons.check_circle_rounded, size: 20),
                    label: const Text('Mark Complete'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.transparent,
                      shadowColor: Colors.transparent,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
