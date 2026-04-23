import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../config/theme.dart';
import '../../services/booking_service.dart';

const _months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
String _fmt(String iso) {
  final d = DateTime.tryParse(iso);
  if (d == null) return iso;
  return '${d.day} ${_months[d.month - 1]}';
}

String _fmtAmount(dynamic val) {
  final n = (val is num ? val : double.tryParse(val.toString()) ?? 0).toInt();
  final s = n.toString();
  if (s.length <= 3) return '₹$s';
  final last3 = s.substring(s.length - 3);
  final rem = s.substring(0, s.length - 3);
  final buf = StringBuffer();
  for (var i = rem.length; i > 0; i -= 2) {
    final st = i - 2 < 0 ? 0 : i - 2;
    if (buf.isEmpty) buf.write(rem.substring(st, i));
    else buf.write('${rem.substring(st, i)},$buf');
  }
  return '₹$buf,$last3';
}

/// Shows the incoming booking overlay. Call from FCMService when a new booking arrives.
Future<void> showIncomingBookingOverlay({
  required BuildContext context,
  required Map<String, dynamic> data,
  required VoidCallback onRefreshBookings,
}) {
  return showDialog(
    context: context,
    barrierDismissible: false,
    barrierColor: Colors.black.withAlpha(160),
    builder: (_) => _IncomingBookingDialog(data: data, onRefreshBookings: onRefreshBookings),
  );
}

class _IncomingBookingDialog extends StatefulWidget {
  final Map<String, dynamic> data;
  final VoidCallback onRefreshBookings;
  const _IncomingBookingDialog({required this.data, required this.onRefreshBookings});

  @override
  State<_IncomingBookingDialog> createState() => _IncomingBookingDialogState();
}

class _IncomingBookingDialogState extends State<_IncomingBookingDialog>
    with SingleTickerProviderStateMixin {
  late AnimationController _pulse;
  late Animation<double> _scale;
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    _pulse = AnimationController(vsync: this, duration: const Duration(milliseconds: 900))
      ..repeat(reverse: true);
    _scale = Tween<double>(begin: 1.0, end: 1.18).animate(
      CurvedAnimation(parent: _pulse, curve: Curves.easeInOut),
    );
    // Vibrate on open
    HapticFeedback.heavyImpact();
    Future.delayed(const Duration(milliseconds: 400), HapticFeedback.heavyImpact);
    Future.delayed(const Duration(milliseconds: 800), HapticFeedback.heavyImpact);
  }

  @override
  void dispose() {
    _pulse.dispose();
    super.dispose();
  }

  Future<void> _act(String action) async {
    final bookingId = widget.data['bookingId'] ?? '';
    if (bookingId.isEmpty) { Navigator.pop(context); return; }
    setState(() => _loading = true);
    try {
      if (action == 'accept') await BookingService().acceptBooking(bookingId);
      if (action == 'reject') await BookingService().rejectBooking(bookingId);
      widget.onRefreshBookings();
      if (mounted) Navigator.pop(context);
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final d = widget.data;
    final customerName = d['customerName'] ?? 'Customer';
    final machineCategory = d['machineCategory'] ?? '';
    final machineModel = d['machineModel'] ?? '';
    final startDate = _fmt(d['startDate'] ?? '');
    final endDate = _fmt(d['endDate'] ?? '');
    final amount = _fmtAmount(d['estimatedCost'] ?? 0);
    final location = d['workAddress'] ?? d['location'] ?? '';

    return Center(
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(28),
          boxShadow: [
            BoxShadow(color: Colors.black.withAlpha(40), blurRadius: 40, offset: const Offset(0, 16)),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Header
            Container(
              width: double.infinity,
              padding: const EdgeInsets.fromLTRB(24, 28, 24, 20),
              decoration: BoxDecoration(
                gradient: AppTheme.accentGradient,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
              ),
              child: Column(
                children: [
                  ScaleTransition(
                    scale: _scale,
                    child: Container(
                      width: 64, height: 64,
                      decoration: BoxDecoration(
                        color: Colors.white.withAlpha(30),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.notifications_active_rounded, color: Colors.white, size: 32),
                    ),
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'New Booking Request!',
                    style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w800, letterSpacing: 0.3),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Please respond within 10 minutes',
                    style: TextStyle(color: Colors.white.withAlpha(200), fontSize: 13),
                  ),
                ],
              ),
            ),

            // Details
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  _DetailRow(icon: Icons.person_rounded, color: AppTheme.accentColor, label: 'Customer', value: customerName),
                  const SizedBox(height: 12),
                  _DetailRow(icon: Icons.construction_rounded, color: AppTheme.primaryColor, label: 'Machine', value: '$machineCategory${machineModel.isNotEmpty ? ' — $machineModel' : ''}'),
                  const SizedBox(height: 12),
                  _DetailRow(icon: Icons.calendar_today_rounded, color: AppTheme.infoColor, label: 'Period', value: '$startDate → $endDate'),
                  const SizedBox(height: 12),
                  if (location.isNotEmpty) ...[
                    _DetailRow(icon: Icons.location_on_rounded, color: AppTheme.errorColor, label: 'Location', value: location),
                    const SizedBox(height: 12),
                  ],
                  _DetailRow(icon: Icons.currency_rupee_rounded, color: AppTheme.successColor, label: 'Amount', value: amount),
                ],
              ),
            ),

            // Buttons
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
              child: _loading
                  ? const Center(child: CircularProgressIndicator(color: AppTheme.accentColor))
                  : Column(
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: SizedBox(
                                height: 50,
                                child: ElevatedButton.icon(
                                  onPressed: () => _act('accept'),
                                  icon: const Icon(Icons.check_circle_rounded, size: 20),
                                  label: const Text('Accept', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: AppTheme.successColor,
                                    foregroundColor: Colors.white,
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                                    elevation: 0,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: SizedBox(
                                height: 50,
                                child: OutlinedButton.icon(
                                  onPressed: () => _act('reject'),
                                  icon: const Icon(Icons.cancel_rounded, size: 20, color: AppTheme.errorColor),
                                  label: const Text('Reject', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppTheme.errorColor)),
                                  style: OutlinedButton.styleFrom(
                                    side: const BorderSide(color: AppTheme.errorColor, width: 1.5),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        TextButton(
                          onPressed: () => Navigator.pop(context),
                          child: const Text('View Later in Bookings Tab', style: TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
                        ),
                      ],
                    ),
            ),
          ],
        ),
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String label;
  final String value;
  const _DetailRow({required this.icon, required this.color, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 36, height: 36,
          decoration: BoxDecoration(color: color.withAlpha(20), borderRadius: BorderRadius.circular(10)),
          child: Icon(icon, color: color, size: 18),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 11, fontWeight: FontWeight.w500)),
              const SizedBox(height: 2),
              Text(value, style: const TextStyle(color: AppTheme.textPrimary, fontSize: 14, fontWeight: FontWeight.w600)),
            ],
          ),
        ),
      ],
    );
  }
}
