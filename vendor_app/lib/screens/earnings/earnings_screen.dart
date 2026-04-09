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

class EarningsScreen extends StatefulWidget {
  const EarningsScreen({super.key});

  @override
  State<EarningsScreen> createState() => _EarningsScreenState();
}

class _EarningsScreenState extends State<EarningsScreen> {
  final _service = BookingService();
  List<Booking> _completedBookings = [];
  bool _isLoading = true;

  double get _totalEarnings => _completedBookings.fold(0, (s, b) => s + b.estimatedCost);

  double get _todayEarnings {
    final now = DateTime.now();
    return _completedBookings
        .where((b) => b.endDate.year == now.year && b.endDate.month == now.month && b.endDate.day == now.day)
        .fold(0, (s, b) => s + b.estimatedCost);
  }

  double get _weekEarnings {
    final cutoff = DateTime.now().subtract(const Duration(days: 7));
    return _completedBookings
        .where((b) => b.endDate.isAfter(cutoff))
        .fold(0, (s, b) => s + b.estimatedCost);
  }

  double get _monthEarnings {
    final now = DateTime.now();
    return _completedBookings
        .where((b) => b.endDate.year == now.year && b.endDate.month == now.month)
        .fold(0, (s, b) => s + b.estimatedCost);
  }

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final all = await _service.getVendorBookings();
    if (mounted) {
      setState(() {
        _completedBookings = all.where((b) => b.isCompleted).toList();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        backgroundColor: AppTheme.backgroundColor,
        appBar: AppBar(title: const Text('Earnings')),
        body: const Center(child: CircularProgressIndicator(color: AppTheme.accentColor)),
      );
    }

    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      appBar: AppBar(title: const Text('Earnings')),
      body: RefreshIndicator(
        color: AppTheme.accentColor,
        onRefresh: _loadData,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Total earnings banner
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
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
                        Icon(Icons.account_balance_wallet_rounded, color: Colors.white, size: 24),
                        SizedBox(width: 8),
                        Text('Total Earnings', style: TextStyle(color: Colors.white70, fontSize: 15)),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(_fmtCurrency(_totalEarnings),
                      style: const TextStyle(fontSize: 38, fontWeight: FontWeight.w800, color: Colors.white, letterSpacing: -1)),
                    const SizedBox(height: 4),
                    Text('${_completedBookings.length} bookings completed',
                      style: const TextStyle(color: Colors.white60, fontSize: 14)),
                  ],
                ),
              ),
              const SizedBox(height: 18),

              // Period cards
              Row(
                children: [
                  Expanded(child: _PeriodCard(label: 'Today', amount: _todayEarnings, icon: Icons.today_rounded, color: AppTheme.successColor)),
                  const SizedBox(width: 10),
                  Expanded(child: _PeriodCard(label: 'This Week', amount: _weekEarnings, icon: Icons.date_range_rounded, color: AppTheme.infoColor)),
                  const SizedBox(width: 10),
                  Expanded(child: _PeriodCard(label: 'Month', amount: _monthEarnings, icon: Icons.calendar_month_rounded, color: AppTheme.warningColor)),
                ],
              ),
              const SizedBox(height: 28),

              const Text('Completed Bookings',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
              const SizedBox(height: 14),

              if (_completedBookings.isEmpty)
                Center(
                  child: Padding(
                    padding: const EdgeInsets.all(40),
                    child: Column(
                      children: [
                        Container(
                          width: 72, height: 72,
                          decoration: BoxDecoration(
                            color: AppTheme.textLight.withAlpha(20),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: const Icon(Icons.receipt_long_rounded, size: 36, color: AppTheme.textLight),
                        ),
                        const SizedBox(height: 16),
                        const Text('No completed bookings yet',
                          style: TextStyle(color: AppTheme.textSecondary, fontSize: 15, fontWeight: FontWeight.w500)),
                      ],
                    ),
                  ),
                )
              else
                ..._completedBookings.map((b) => _CompletedBookingCard(booking: b)),
            ],
          ),
        ),
      ),
    );
  }
}

class _PeriodCard extends StatelessWidget {
  final String label;
  final double amount;
  final IconData icon;
  final Color color;

  const _PeriodCard({required this.label, required this.amount, required this.icon, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        boxShadow: [AppTheme.softShadow],
      ),
      child: Column(
        children: [
          Container(
            width: 38, height: 38,
            decoration: BoxDecoration(
              color: color.withAlpha(20),
              borderRadius: BorderRadius.circular(11),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(height: 8),
          Text(_fmtCurrency(amount),
            style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: color)),
          const SizedBox(height: 2),
          Text(label, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 11)),
        ],
      ),
    );
  }
}

class _CompletedBookingCard extends StatelessWidget {
  final Booking booking;
  const _CompletedBookingCard({required this.booking});

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
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 44, height: 44,
                decoration: BoxDecoration(
                  color: AppTheme.successColor.withAlpha(20),
                  borderRadius: BorderRadius.circular(13),
                ),
                child: const Icon(Icons.check_circle_rounded, color: AppTheme.successColor, size: 22),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(booking.customerName,
                      style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15, color: AppTheme.textPrimary)),
                    const SizedBox(height: 2),
                    Text('${booking.machineCategory} - ${booking.machineModel}',
                      style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
                  ],
                ),
              ),
              Text(_fmtCurrency(booking.estimatedCost),
                style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: AppTheme.successColor)),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              const Icon(Icons.calendar_today_rounded, size: 13, color: AppTheme.textLight),
              const SizedBox(width: 4),
              Text('Completed on ${_fmtDate(booking.endDate)}',
                style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
            ],
          ),
          if (booking.rating != null) ...[
            const SizedBox(height: 8),
            Row(
              children: [
                ...List.generate(5, (i) => Icon(
                  i < booking.rating!.round() ? Icons.star_rounded : Icons.star_border_rounded,
                  size: 16, color: AppTheme.warningColor,
                )),
                const SizedBox(width: 6),
                Text('${booking.rating}', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: AppTheme.textPrimary)),
              ],
            ),
          ],
          if (booking.review != null && booking.review!.isNotEmpty) ...[
            const SizedBox(height: 6),
            Text('"${booking.review}"',
              style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13, fontStyle: FontStyle.italic)),
          ],
        ],
      ),
    );
  }
}
