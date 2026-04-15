import 'package:flutter/material.dart';
import '../../config/theme.dart';
import '../../services/booking_service.dart';
import '../../services/location_service.dart';
import '../../models/booking.dart';
import 'vendor_map_screen.dart';

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

  void _openMap(Booking booking) {
    Navigator.push(context, MaterialPageRoute(
      builder: (_) => VendorMapScreen(booking: booking),
    )).then((_) => _loadBookings()); // Refresh after returning
  }

  Future<void> _loadBookings() async {
    try {
      final bookings = await _service.getVendorBookings();
      if (mounted) setState(() { _allBookings = bookings; _isLoading = false; });

      // Auto-start GPS broadcasting if there's an active booking
      final active = bookings.where((b) => b.isAccepted || b.isArrived || b.isInProgress).toList();
      if (active.isNotEmpty) {
        LocationService().startBroadcasting(active.first.id);
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  List<Booking> _pending() => _allBookings.where((b) => b.isPending).toList();
  List<Booking> _active() => _allBookings.where((b) => b.isAccepted || b.isArrived || b.isInProgress).toList();
  List<Booking> _done() => _allBookings.where((b) => b.isCompleted).toList();
  List<Booking> _rejected() => _allBookings.where((b) => b.isRejected).toList();

  Future<void> _doAction(String id, String action) async {
    if (action == 'arrive') {
      await _service.markArrived(id);
      await _loadBookings();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('Arrival marked. OTP sent to customer.'),
          backgroundColor: AppTheme.successColor,
          behavior: SnackBarBehavior.floating,
        ));
      }
      return;
    }

    if (action == 'verify_otp') {
      await _showOtpDialog(id);
      return;
    }

    switch (action) {
      case 'accept': await _service.acceptBooking(id); break;
      case 'reject': await _service.rejectBooking(id); break;
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

  Future<void> _showOtpDialog(String bookingId) async {
    final otpController = TextEditingController();
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Enter Start OTP'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Ask the customer for their 4-digit OTP to start work.',
              style: TextStyle(color: Colors.grey[600], fontSize: 14)),
            const SizedBox(height: 16),
            TextField(
              controller: otpController,
              keyboardType: TextInputType.number,
              maxLength: 4,
              textAlign: TextAlign.center,
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
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.successColor,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            child: const Text('Start Work'),
          ),
        ],
      ),
    );

    if (confirmed == true && otpController.text.length == 4) {
      try {
        await _service.verifyStartOtp(bookingId, otpController.text);
        await _loadBookings();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
            content: Text('OTP verified! Work has started.'),
            backgroundColor: AppTheme.successColor,
            behavior: SnackBarBehavior.floating,
          ));
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text(e.toString().replaceFirst('Exception: ', '')),
            backgroundColor: AppTheme.errorColor,
            behavior: SnackBarBehavior.floating,
          ));
        }
      }
    }
    otpController.dispose();
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
              _BookingList(bookings: _pending(), onAction: _doAction, onOpenMap: _openMap, type: 'pending'),
              _BookingList(bookings: _active(), onAction: _doAction, onOpenMap: _openMap, type: 'active'),
              _BookingList(bookings: _done(), onAction: _doAction, onOpenMap: _openMap, type: 'done'),
              _BookingList(bookings: _rejected(), onAction: _doAction, onOpenMap: _openMap, type: 'rejected'),
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
  final void Function(Booking b) onOpenMap;
  final String type;

  const _BookingList({required this.bookings, required this.onAction, required this.onOpenMap, required this.type});

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
      itemBuilder: (_, i) => _BookingCard(booking: bookings[i], onAction: onAction, onOpenMap: onOpenMap),
    );
  }
}

class _BookingCard extends StatelessWidget {
  final Booking booking;
  final Future<void> Function(String id, String action) onAction;
  final void Function(Booking b) onOpenMap;

  const _BookingCard({required this.booking, required this.onAction, required this.onOpenMap});

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
              Row(
                children: [
                  Expanded(
                    child: SizedBox(
                      height: 44,
                      child: ElevatedButton.icon(
                        onPressed: () => onAction(booking.id, 'arrive'),
                        icon: const Icon(Icons.location_on_rounded, size: 18),
                        label: const Text('Mark Arrived'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.infoColor,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  SizedBox(
                    height: 44,
                    child: OutlinedButton.icon(
                      onPressed: () => onOpenMap(booking),
                      icon: const Icon(Icons.map_rounded, size: 18, color: AppTheme.primaryColor),
                      label: const Text('Navigate', style: TextStyle(color: AppTheme.primaryColor)),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: AppTheme.primaryColor, width: 1.5),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ),
                ],
              ),
            ],
            if (booking.isArrived) ...[
              const SizedBox(height: 14),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppTheme.warningColor.withAlpha(15),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppTheme.warningColor.withAlpha(60)),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.info_outline_rounded, color: AppTheme.warningColor, size: 18),
                    SizedBox(width: 8),
                    Expanded(
                      child: Text('Waiting for customer OTP to start work',
                        style: TextStyle(color: AppTheme.warningColor, fontSize: 13, fontWeight: FontWeight.w500)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 10),
              // Step 2: Enter OTP from customer to start work
              SizedBox(
                width: double.infinity, height: 44,
                child: ElevatedButton.icon(
                  onPressed: () => onAction(booking.id, 'verify_otp'),
                  icon: const Icon(Icons.lock_open_rounded, size: 20),
                  label: const Text('Enter Customer OTP'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.successColor,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),
            ],
            if (booking.isInProgress) ...[
              const SizedBox(height: 14),
              Row(
                children: [
                  Expanded(
                    child: Container(
                      height: 44,
                      decoration: BoxDecoration(
                        gradient: AppTheme.accentGradient,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: ElevatedButton.icon(
                        onPressed: () => onAction(booking.id, 'complete'),
                        icon: const Icon(Icons.check_circle_rounded, size: 18),
                        label: const Text('Mark Complete'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.transparent,
                          shadowColor: Colors.transparent,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  SizedBox(
                    height: 44,
                    child: OutlinedButton.icon(
                      onPressed: () => onOpenMap(booking),
                      icon: const Icon(Icons.map_rounded, size: 18, color: AppTheme.primaryColor),
                      label: const Text('Map', style: TextStyle(color: AppTheme.primaryColor)),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: AppTheme.primaryColor, width: 1.5),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}
