import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../config/theme.dart';
import '../../models/booking.dart';
import 'live_tracking_screen.dart';
import 'rating_review_screen.dart';

class BookingDetailScreen extends StatelessWidget {
  final Booking booking;
  const BookingDetailScreen({super.key, required this.booking});

  @override
  Widget build(BuildContext context) {
    final fmt = DateFormat('dd MMM yyyy');

    return Scaffold(
      appBar: AppBar(
        title: const Text('Booking Details'),
        actions: [
          if (booking.status == 'in_progress')
            TextButton.icon(
              onPressed: () => Navigator.push(context,
                MaterialPageRoute(builder: (_) => LiveTrackingScreen(booking: booking))),
              icon: const Icon(Icons.location_on, color: Colors.white),
              label: const Text('Track', style: TextStyle(color: Colors.white)),
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
                color: _getStatusColor(booking.status),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                children: [
                  Icon(_getStatusIcon(booking.status), size: 48, color: Colors.white),
                  const SizedBox(height: 10),
                  Text(
                    booking.statusLabel,
                    style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _getStatusMessage(booking.status),
                    style: TextStyle(color: Colors.white.withAlpha(200), fontSize: 14),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Status Timeline
            const Text('Booking Timeline', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            _StatusTimeline(currentStatus: booking.status),
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
                          Text(booking.machineModel, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 17)),
                          const SizedBox(height: 2),
                          Text(booking.machineCategory, style: TextStyle(color: Colors.grey[600])),
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
                title: Text(booking.vendorName.isNotEmpty ? booking.vendorName : 'Vendor',
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
                    _DetailRow(icon: Icons.calendar_today, label: 'Start Date', value: fmt.format(booking.startDate)),
                    const Divider(),
                    _DetailRow(icon: Icons.event, label: 'End Date', value: fmt.format(booking.endDate)),
                    const Divider(),
                    _DetailRow(icon: Icons.timer, label: 'Rate Type', value: booking.rateType == 'daily' ? 'Daily' : 'Hourly'),
                    const Divider(),
                    _DetailRow(icon: Icons.currency_rupee, label: 'Rate', value: 'Rs ${booking.rate.toInt()}/${booking.rateType == "daily" ? "day" : "hr"}'),
                    if (booking.workAddress != null) ...[
                      const Divider(),
                      _DetailRow(icon: Icons.location_on, label: 'Work Location', value: booking.workAddress!),
                    ],
                    if (booking.notes != null && booking.notes!.isNotEmpty) ...[
                      const Divider(),
                      _DetailRow(icon: Icons.notes, label: 'Notes', value: booking.notes!),
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
                  Text('Rs ${booking.estimatedCost.toInt()}',
                    style: const TextStyle(color: AppTheme.accentColor, fontSize: 24, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Rating
            if (booking.rating != null) ...[
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
                          i < booking.rating!.round() ? Icons.star : Icons.star_border,
                          color: Colors.amber, size: 28,
                        )),
                      ),
                      if (booking.review != null && booking.review!.isNotEmpty) ...[
                        const SizedBox(height: 8),
                        Text(booking.review!, style: TextStyle(color: Colors.grey[700])),
                      ],
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
            ],

            // Action buttons
            if (booking.status == 'in_progress') ...[
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton.icon(
                  onPressed: () => Navigator.push(context,
                    MaterialPageRoute(builder: (_) => LiveTrackingScreen(booking: booking))),
                  icon: const Icon(Icons.location_on),
                  label: const Text('Track Vehicle Live', style: TextStyle(fontSize: 16)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.blue,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),
            ],
            if (booking.status == 'completed' && booking.rating == null) ...[
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton.icon(
                  onPressed: () => Navigator.push(context,
                    MaterialPageRoute(builder: (_) => RatingReviewScreen(booking: booking))),
                  icon: const Icon(Icons.star),
                  label: const Text('Rate & Review', style: TextStyle(fontSize: 16)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.amber[700],
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
      case 'completed': return Colors.blue;
      case 'in_progress': return Colors.purple;
      default: return Colors.orange;
    }
  }

  IconData _getStatusIcon(String status) {
    switch (status) {
      case 'accepted': return Icons.check_circle;
      case 'rejected': return Icons.cancel;
      case 'completed': return Icons.done_all;
      case 'in_progress': return Icons.local_shipping;
      default: return Icons.hourglass_empty;
    }
  }

  String _getStatusMessage(String status) {
    switch (status) {
      case 'pending': return 'Waiting for vendor to accept your booking';
      case 'accepted': return 'Vendor has accepted! Machine will arrive on schedule';
      case 'rejected': return 'Vendor could not accept this booking';
      case 'in_progress': return 'Machine is on its way / Work is in progress';
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
      {'key': 'in_progress', 'label': 'Work In Progress', 'icon': Icons.local_shipping},
      {'key': 'completed', 'label': 'Completed', 'icon': Icons.done_all},
    ];

    final statusOrder = ['pending', 'accepted', 'in_progress', 'completed'];
    final currentIndex = statusOrder.indexOf(currentStatus);
    final isRejected = currentStatus == 'rejected';

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
                      isRejected && i == 1
                          ? Icons.cancel
                          : steps[i]['icon'] as IconData,
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
                    color: isCompleted || (isRejected && i == 1)
                        ? Colors.black87
                        : Colors.grey[500],
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
