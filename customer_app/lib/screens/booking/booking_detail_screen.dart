import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import '../../config/theme.dart';
import '../../models/booking.dart';
import '../../services/booking_service.dart';
import 'live_tracking_screen.dart';
import 'rating_review_screen.dart';
import '../../services/receipt_service.dart';

class BookingDetailScreen extends StatefulWidget {
  final Booking booking;
  const BookingDetailScreen({super.key, required this.booking});

  @override
  State<BookingDetailScreen> createState() => _BookingDetailScreenState();
}

class _BookingDetailScreenState extends State<BookingDetailScreen> {
  late Booking _booking;
  final _bookingService = BookingService();
  bool _isCancelling = false;

  @override
  void initState() {
    super.initState();
    _booking = widget.booking;
  }

  Future<void> _showCancelDialog() async {
    final reasonController = TextEditingController();
    const reasons = [
      'Change of plans',
      'Found a better option',
      'Work postponed',
      'Wrong booking details',
      'Other',
    ];
    String selectedReason = reasons.first;

    final confirmed = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (ctx, setModalState) => Padding(
            padding: EdgeInsets.fromLTRB(24, 20, 24, MediaQuery.of(ctx).viewInsets.bottom + 24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 40, height: 4,
                    decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(2)),
                  ),
                ),
                const SizedBox(height: 20),
                const Row(
                  children: [
                    Icon(Icons.cancel_outlined, color: Colors.red, size: 22),
                    SizedBox(width: 10),
                    Text('Cancel Booking', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  'This action cannot be undone. Please select a reason.',
                  style: TextStyle(color: Colors.grey[600], fontSize: 13),
                ),
                const SizedBox(height: 20),
                ...reasons.map((r) => RadioListTile<String>(
                  value: r,
                  groupValue: selectedReason,
                  onChanged: (v) => setModalState(() => selectedReason = v!),
                  title: Text(r, style: const TextStyle(fontSize: 14)),
                  dense: true,
                  contentPadding: EdgeInsets.zero,
                  activeColor: AppTheme.primaryColor,
                )),
                if (selectedReason == 'Other') ...[
                  const SizedBox(height: 8),
                  TextField(
                    controller: reasonController,
                    maxLines: 2,
                    autofocus: true,
                    decoration: InputDecoration(
                      hintText: 'Please specify your reason...',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    ),
                  ),
                ],
                const SizedBox(height: 20),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => Navigator.pop(ctx, false),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: const Text('Keep Booking'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: () {
                          final reason = selectedReason == 'Other'
                              ? reasonController.text.trim()
                              : selectedReason;
                          if (reason.isEmpty) return;
                          Navigator.pop(ctx, true);
                          // Store reason for use after dialog closes
                          reasonController.text = reason;
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.red,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: const Text('Cancel Booking', style: TextStyle(fontWeight: FontWeight.bold)),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );

    if (confirmed == true && mounted) {
      final reason = reasonController.text.isEmpty ? selectedReason : reasonController.text;
      await _performCancel(reason);
    }
  }

  // We need a different approach — store the selected reason outside the dialog
  String _selectedCancelReason = 'Change of plans';

  Future<void> _showCancelDialogV2() async {
    _selectedCancelReason = 'Change of plans';
    final reasonController = TextEditingController();
    const reasons = [
      'Change of plans',
      'Found a better option',
      'Work postponed',
      'Wrong booking details',
      'Other',
    ];

    final result = await showModalBottomSheet<String?>(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        String selectedReason = reasons.first;
        return StatefulBuilder(
          builder: (ctx, setModalState) => Padding(
            padding: EdgeInsets.fromLTRB(24, 20, 24, MediaQuery.of(ctx).viewInsets.bottom + 24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 40, height: 4,
                    decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(2)),
                  ),
                ),
                const SizedBox(height: 20),
                const Row(
                  children: [
                    Icon(Icons.cancel_outlined, color: Colors.red, size: 22),
                    SizedBox(width: 10),
                    Text('Cancel Booking', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  'This cannot be undone. Please select a reason.',
                  style: TextStyle(color: Colors.grey[600], fontSize: 13),
                ),
                const SizedBox(height: 20),
                ...reasons.map((r) => RadioListTile<String>(
                  value: r,
                  groupValue: selectedReason,
                  onChanged: (v) => setModalState(() => selectedReason = v!),
                  title: Text(r, style: const TextStyle(fontSize: 14)),
                  dense: true,
                  contentPadding: EdgeInsets.zero,
                  activeColor: AppTheme.primaryColor,
                )),
                if (selectedReason == 'Other') ...[
                  const SizedBox(height: 8),
                  TextField(
                    controller: reasonController,
                    maxLines: 2,
                    autofocus: true,
                    decoration: InputDecoration(
                      hintText: 'Describe your reason...',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    ),
                  ),
                ],
                const SizedBox(height: 20),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => Navigator.pop(ctx, null),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: const Text('Keep Booking'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: () {
                          final finalReason = selectedReason == 'Other'
                              ? reasonController.text.trim()
                              : selectedReason;
                          if (finalReason.isEmpty) return;
                          Navigator.pop(ctx, finalReason);
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.red,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: const Text('Cancel Booking', style: TextStyle(fontWeight: FontWeight.bold)),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );

    if (result != null && mounted) {
      await _performCancel(result);
    }
  }

  Future<void> _performCancel(String reason) async {
    setState(() => _isCancelling = true);
    try {
      await _bookingService.cancelBooking(_booking.id, reason);
      if (mounted) {
        // Refresh booking from server to get updated status
        final updated = await _bookingService.getBookingById(_booking.id);
        setState(() => _booking = updated);
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('Booking cancelled successfully'),
          backgroundColor: Colors.red,
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
    } finally {
      if (mounted) setState(() => _isCancelling = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final fmt = DateFormat('dd MMM yyyy');

    return Scaffold(
      appBar: AppBar(
        title: const Text('Booking Details'),
        actions: [
          if (_booking.status == 'in_progress' || _booking.status == 'arrived')
            TextButton.icon(
              onPressed: () => Navigator.push(context,
                MaterialPageRoute(builder: (_) => LiveTrackingScreen(booking: _booking))),
              icon: const Icon(Icons.location_on, color: Colors.white),
              label: const Text('Track / OTP', style: TextStyle(color: Colors.white)),
            ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Status header
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: _getStatusColor(_booking.status),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                children: [
                  Icon(_getStatusIcon(_booking.status), size: 48, color: Colors.white),
                  const SizedBox(height: 10),
                  Text(
                    _booking.statusLabel,
                    style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _getStatusMessage(_booking.status),
                    style: TextStyle(color: Colors.white.withAlpha(200), fontSize: 14),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Cancellation info box
            if (_booking.status == 'cancelled' && _booking.cancellationReason != null) ...[
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.red.withAlpha(10),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.red.withAlpha(60)),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.info_outline, color: Colors.red, size: 18),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Cancellation Reason',
                            style: TextStyle(fontWeight: FontWeight.bold, color: Colors.red, fontSize: 13)),
                          const SizedBox(height: 4),
                          Text(_booking.cancellationReason!,
                            style: TextStyle(color: Colors.red[700], fontSize: 13)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
            ],

            // Status Timeline
            const Text('Booking Timeline', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            _StatusTimeline(currentStatus: _booking.status),
            const SizedBox(height: 20),

            // Machine info
            const Text('Machine Details', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    Container(
                      width: 56, height: 56,
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
                          Text(_booking.machineModel, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 17)),
                          const SizedBox(height: 2),
                          Text(_booking.machineCategory, style: TextStyle(color: Colors.grey[600])),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Vendor info
            const Text('Vendor', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Card(
              child: ListTile(
                leading: CircleAvatar(
                  backgroundColor: AppTheme.secondaryColor.withAlpha(20),
                  child: const Icon(Icons.store, color: AppTheme.secondaryColor),
                ),
                title: Text(_booking.vendorName.isNotEmpty ? _booking.vendorName : 'Vendor',
                  style: const TextStyle(fontWeight: FontWeight.w600)),
                subtitle: const Text('Equipment Provider'),
                trailing: IconButton(
                  icon: const Icon(Icons.phone, color: AppTheme.primaryColor),
                  onPressed: () {},
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Booking details
            const Text('Schedule & Location', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    _DetailRow(icon: Icons.calendar_today, label: 'Start Date', value: fmt.format(_booking.startDate)),
                    const Divider(),
                    _DetailRow(icon: Icons.event, label: 'End Date', value: fmt.format(_booking.endDate)),
                    const Divider(),
                    _DetailRow(icon: Icons.timer, label: 'Rate Type', value: _booking.rateType == 'daily' ? 'Daily' : 'Hourly'),
                    const Divider(),
                    _DetailRow(icon: Icons.currency_rupee, label: 'Rate', value: 'Rs ${_booking.rate.toInt()}/${_booking.rateType == "daily" ? "day" : "hr"}'),
                    if (_booking.workAddress != null) ...[
                      const Divider(),
                      _DetailRow(icon: Icons.location_on, label: 'Work Location', value: _booking.workAddress!),
                    ],
                    if (_booking.notes != null && _booking.notes!.isNotEmpty) ...[
                      const Divider(),
                      _DetailRow(icon: Icons.notes, label: 'Notes', value: _booking.notes!),
                    ],
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Cost
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppTheme.secondaryColor,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Total Estimated Cost', style: TextStyle(color: Colors.white, fontSize: 16)),
                  Text('Rs ${_booking.estimatedCost.toInt()}',
                    style: const TextStyle(color: AppTheme.accentColor, fontSize: 24, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Rating
            if (_booking.rating != null) ...[
              const Text('Your Review', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: List.generate(5, (i) => Icon(
                          i < _booking.rating!.round() ? Icons.star : Icons.star_border,
                          color: Colors.amber, size: 28,
                        )),
                      ),
                      if (_booking.review != null && _booking.review!.isNotEmpty) ...[
                        const SizedBox(height: 8),
                        Text(_booking.review!, style: TextStyle(color: Colors.grey[700])),
                      ],
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
            ],

            // Action buttons
            if (_booking.status == 'arrived') ...[
              Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF00897B), Color(0xFF00695C)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.teal.withAlpha(80),
                      blurRadius: 12, offset: const Offset(0, 4)),
                  ],
                ),
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    children: [
                      const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.directions_car, color: Colors.white, size: 22),
                          SizedBox(width: 8),
                          Text('Machine Has Arrived!',
                            style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 18)),
                        ],
                      ),
                      const SizedBox(height: 6),
                      const Text(
                        'Show this OTP to the operator to start work',
                        style: TextStyle(color: Colors.white70, fontSize: 13),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 16),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Column(
                          children: [
                            const Text('YOUR START OTP',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 2,
                                color: Colors.grey,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              _booking.startOtp ?? '----',
                              style: const TextStyle(
                                fontSize: 48,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 16,
                                color: Color(0xFF00695C),
                              ),
                            ),
                            const SizedBox(height: 12),
                            SizedBox(
                              width: double.infinity,
                              child: OutlinedButton.icon(
                                onPressed: () {
                                  Clipboard.setData(ClipboardData(
                                    text: _booking.startOtp ?? ''));
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content: Text('OTP copied!'),
                                      duration: Duration(seconds: 2),
                                      behavior: SnackBarBehavior.floating,
                                    ),
                                  );
                                },
                                icon: const Icon(Icons.copy, size: 16),
                                label: const Text('Copy OTP'),
                                style: OutlinedButton.styleFrom(
                                  foregroundColor: const Color(0xFF00695C),
                                  side: const BorderSide(color: Color(0xFF00695C)),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(8)),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 12),
            ],
            if (_booking.status == 'in_progress') ...[
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton.icon(
                  onPressed: () => Navigator.push(context,
                    MaterialPageRoute(builder: (_) => LiveTrackingScreen(booking: _booking))),
                  icon: const Icon(Icons.location_on),
                  label: const Text('Track Vehicle Live', style: TextStyle(fontSize: 16)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.blue,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),
              const SizedBox(height: 12),
            ],
            if (_booking.status == 'completed') ...[
              // Receipt button
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton.icon(
                  onPressed: () => ReceiptService().showReceipt(null, _booking),
                  icon: const Icon(Icons.receipt_long),
                  label: const Text('View / Print Receipt', style: TextStyle(fontSize: 16)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green[700],
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),
              const SizedBox(height: 12),
            ],
            if (_booking.status == 'completed' && _booking.rating == null) ...[
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton.icon(
                  onPressed: () => Navigator.push(context,
                    MaterialPageRoute(builder: (_) => RatingReviewScreen(booking: _booking))),
                  icon: const Icon(Icons.star),
                  label: const Text('Rate & Review', style: TextStyle(fontSize: 16)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.amber[700],
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),
              const SizedBox(height: 12),
            ],

            // Cancel button — only for pending/accepted
            if (_booking.isCancellable) ...[
              _isCancelling
                ? const Center(child: Padding(
                    padding: EdgeInsets.symmetric(vertical: 8),
                    child: CircularProgressIndicator(color: Colors.red),
                  ))
                : SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: OutlinedButton.icon(
                      onPressed: _showCancelDialogV2,
                      icon: const Icon(Icons.cancel_outlined, color: Colors.red),
                      label: const Text('Cancel Booking',
                        style: TextStyle(color: Colors.red, fontSize: 16, fontWeight: FontWeight.w600)),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Colors.red, width: 1.5),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ),
            ],
            const SizedBox(height: 24),
          ],
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
      case 'arrived': return Colors.teal;
      default: return Colors.orange;
    }
  }

  IconData _getStatusIcon(String status) {
    switch (status) {
      case 'accepted': return Icons.check_circle;
      case 'rejected': return Icons.cancel;
      case 'cancelled': return Icons.cancel;
      case 'completed': return Icons.done_all;
      case 'in_progress': return Icons.local_shipping;
      case 'arrived': return Icons.location_on;
      default: return Icons.hourglass_empty;
    }
  }

  String _getStatusMessage(String status) {
    switch (status) {
      case 'pending': return 'Waiting for vendor to accept your booking';
      case 'accepted': return 'Vendor has accepted! Machine will arrive on schedule';
      case 'rejected': return 'Vendor could not accept this booking';
      case 'cancelled': return 'This booking was cancelled';
      case 'arrived': return 'Machine has arrived! Share your OTP with the operator to start work';
      case 'in_progress': return 'Work is in progress';
      case 'completed': return 'Work has been completed successfully';
      default: return '';
    }
  }
}

class _StatusTimeline extends StatelessWidget {
  final String currentStatus;
  const _StatusTimeline({required this.currentStatus});

  @override
  Widget build(BuildContext context) {
    final steps = [
      {'key': 'pending', 'label': 'Booking Requested', 'icon': Icons.send},
      {'key': 'accepted', 'label': 'Vendor Accepted', 'icon': Icons.check_circle},
      {'key': 'arrived', 'label': 'Machine Arrived', 'icon': Icons.location_on},
      {'key': 'in_progress', 'label': 'Work In Progress', 'icon': Icons.local_shipping},
      {'key': 'completed', 'label': 'Completed', 'icon': Icons.done_all},
    ];

    final statusOrder = ['pending', 'accepted', 'arrived', 'in_progress', 'completed'];
    final currentIndex = statusOrder.indexOf(currentStatus);
    final isRejected = currentStatus == 'rejected';
    final isCancelled = currentStatus == 'cancelled';

    if (isCancelled) {
      return Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.red.withAlpha(10),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: Colors.red.withAlpha(40)),
        ),
        child: const Row(
          children: [
            Icon(Icons.cancel, color: Colors.red, size: 20),
            SizedBox(width: 10),
            Text('Booking was cancelled before work started',
              style: TextStyle(color: Colors.red, fontSize: 14, fontWeight: FontWeight.w500)),
          ],
        ),
      );
    }

    return Column(
      children: List.generate(steps.length, (i) {
        final isCompleted = !isRejected && currentIndex >= i;
        final isCurrent = !isRejected && currentIndex == i;

        return Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(
              width: 40,
              child: Column(
                children: [
                  Container(
                    width: 32, height: 32,
                    decoration: BoxDecoration(
                      color: isCompleted
                          ? AppTheme.primaryColor
                          : isRejected && i == 1
                              ? AppTheme.errorColor
                              : Colors.grey[300],
                      shape: BoxShape.circle,
                      boxShadow: isCurrent
                          ? [BoxShadow(color: AppTheme.primaryColor.withAlpha(80), blurRadius: 8)]
                          : null,
                    ),
                    child: Icon(
                      isRejected && i == 1 ? Icons.cancel : steps[i]['icon'] as IconData,
                      size: 18,
                      color: isCompleted || (isRejected && i == 1) ? Colors.white : Colors.grey[500],
                    ),
                  ),
                  if (i < steps.length - 1)
                    Container(
                      width: 2, height: 32,
                      color: isCompleted && !isRejected && currentIndex > i
                          ? AppTheme.primaryColor
                          : Colors.grey[300],
                    ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.only(top: 4, bottom: 16),
                child: Text(
                  isRejected && i == 1 ? 'Vendor Rejected' : steps[i]['label'] as String,
                  style: TextStyle(
                    fontWeight: isCurrent || (isRejected && i == 1) ? FontWeight.bold : FontWeight.normal,
                    color: isCompleted || (isRejected && i == 1) ? Colors.black87 : Colors.grey[500],
                    fontSize: 15,
                  ),
                ),
              ),
            ),
          ],
        );
      }),
    );
  }
}

class _DetailRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  const _DetailRow({required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 18, color: AppTheme.primaryColor),
          const SizedBox(width: 10),
          SizedBox(width: 100, child: Text(label, style: TextStyle(color: Colors.grey[600], fontSize: 14))),
          Expanded(child: Text(value, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14))),
        ],
      ),
    );
  }
}
