import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../config/theme.dart';
import '../../models/machine.dart';
import '../../services/booking_service.dart';

class CreateBookingScreen extends StatefulWidget {
  final Machine machine;
  final String? estimateId;
  const CreateBookingScreen({super.key, required this.machine, this.estimateId});

  @override
  State<CreateBookingScreen> createState() => _CreateBookingScreenState();
}

class _CreateBookingScreenState extends State<CreateBookingScreen> {
  final _bookingService = BookingService();
  final _addressController = TextEditingController();
  final _notesController = TextEditingController();

  DateTime _startDate = DateTime.now().add(const Duration(days: 1));
  DateTime _endDate = DateTime.now().add(const Duration(days: 2));
  TimeOfDay _startTime = const TimeOfDay(hour: 9, minute: 0);
  String _rateType = 'daily';
  bool _isLoading = false;
  int _currentStep = 0;

  double get _estimatedCost {
    final diff = _endDate.difference(_startDate);
    if (_rateType == 'daily') {
      return widget.machine.dailyRate * diff.inDays.clamp(1, 999);
    }
    return widget.machine.hourlyRate * diff.inHours.clamp(1, 99999);
  }

  double get _rate => _rateType == 'daily' ? widget.machine.dailyRate : widget.machine.hourlyRate;

  @override
  Widget build(BuildContext context) {
    final fmt = DateFormat('dd MMM yyyy');

    return Scaffold(
      appBar: AppBar(title: const Text('Book Machine')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Machine summary card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [AppTheme.secondaryColor, AppTheme.secondaryColor.withAlpha(200)],
                ),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                children: [
                  Container(
                    width: 56, height: 56,
                    decoration: BoxDecoration(
                      color: Colors.white.withAlpha(30),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.construction, color: Colors.white, size: 28),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(widget.machine.model,
                          style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 2),
                        Text('${widget.machine.category} - ${widget.machine.vendorName}',
                          style: TextStyle(color: Colors.white.withAlpha(180), fontSize: 14)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Step indicator
            Row(
              children: [
                _StepDot(index: 1, label: 'Schedule', isActive: _currentStep >= 0),
                Expanded(child: Container(height: 2, color: _currentStep >= 1 ? AppTheme.primaryColor : Colors.grey[300])),
                _StepDot(index: 2, label: 'Location', isActive: _currentStep >= 1),
                Expanded(child: Container(height: 2, color: _currentStep >= 2 ? AppTheme.primaryColor : Colors.grey[300])),
                _StepDot(index: 3, label: 'Confirm', isActive: _currentStep >= 2),
              ],
            ),
            const SizedBox(height: 24),

            // Step 0: Schedule
            if (_currentStep == 0) ...[
              const Text('Rate Type', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              const SizedBox(height: 8),
              SegmentedButton<String>(
                segments: [
                  ButtonSegment(
                    value: 'hourly',
                    label: Text('Hourly\nRs ${widget.machine.hourlyRate.toInt()}', textAlign: TextAlign.center),
                    icon: const Icon(Icons.access_time),
                  ),
                  ButtonSegment(
                    value: 'daily',
                    label: Text('Daily\nRs ${widget.machine.dailyRate.toInt()}', textAlign: TextAlign.center),
                    icon: const Icon(Icons.calendar_today),
                  ),
                ],
                selected: {_rateType},
                onSelectionChanged: (v) => setState(() => _rateType = v.first),
              ),
              const SizedBox(height: 20),

              const Text('Start Date & Time', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: _DatePicker(
                      label: 'Start Date',
                      formatted: fmt.format(_startDate),
                      onTap: () async {
                        final d = await showDatePicker(
                          context: context,
                          initialDate: _startDate,
                          firstDate: DateTime.now(),
                          lastDate: DateTime.now().add(const Duration(days: 365)),
                        );
                        if (d != null) setState(() => _startDate = d);
                      },
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: GestureDetector(
                      onTap: () async {
                        final t = await showTimePicker(context: context, initialTime: _startTime);
                        if (t != null) setState(() => _startTime = t);
                      },
                      child: InputDecorator(
                        decoration: const InputDecoration(labelText: 'Start Time'),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(_startTime.format(context)),
                            const Icon(Icons.access_time, size: 18),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              _DatePicker(
                label: 'End Date',
                formatted: fmt.format(_endDate),
                onTap: () async {
                  final d = await showDatePicker(
                    context: context,
                    initialDate: _endDate,
                    firstDate: _startDate,
                    lastDate: DateTime.now().add(const Duration(days: 365)),
                  );
                  if (d != null) setState(() => _endDate = d);
                },
              ),
              const SizedBox(height: 24),

              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: () => setState(() => _currentStep = 1),
                  child: const Text('Next: Location Details'),
                ),
              ),
            ],

            // Step 1: Location
            if (_currentStep == 1) ...[
              const Text('Work Location', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              const SizedBox(height: 8),
              TextField(
                controller: _addressController,
                decoration: InputDecoration(
                  hintText: 'Enter complete work address',
                  prefixIcon: const Icon(Icons.location_on),
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
                maxLines: 2,
              ),
              const SizedBox(height: 16),

              const Text('Additional Notes', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              const SizedBox(height: 8),
              TextField(
                controller: _notesController,
                maxLines: 3,
                decoration: InputDecoration(
                  hintText: 'Any special instructions for the vendor...',
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  alignLabelWithHint: true,
                ),
              ),
              const SizedBox(height: 24),

              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => setState(() => _currentStep = 0),
                      style: OutlinedButton.styleFrom(
                        minimumSize: const Size(0, 52),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: const Text('Back'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    flex: 2,
                    child: SizedBox(
                      height: 52,
                      child: ElevatedButton(
                        onPressed: () {
                          if (_addressController.text.isEmpty) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Please enter work location')));
                            return;
                          }
                          setState(() => _currentStep = 2);
                        },
                        child: const Text('Next: Review Booking'),
                      ),
                    ),
                  ),
                ],
              ),
            ],

            // Step 2: Confirm
            if (_currentStep == 2) ...[
              const Text('Booking Summary', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
              const SizedBox(height: 16),

              _SummaryTile(icon: Icons.construction, label: 'Machine', value: widget.machine.model),
              _SummaryTile(icon: Icons.store, label: 'Vendor', value: widget.machine.vendorName),
              _SummaryTile(icon: Icons.calendar_today, label: 'Start', value: '${fmt.format(_startDate)} at ${_startTime.format(context)}'),
              _SummaryTile(icon: Icons.event, label: 'End', value: fmt.format(_endDate)),
              _SummaryTile(icon: Icons.timer, label: 'Rate Type', value: _rateType == 'daily' ? 'Daily' : 'Hourly'),
              _SummaryTile(icon: Icons.location_on, label: 'Location', value: _addressController.text),
              if (_notesController.text.isNotEmpty)
                _SummaryTile(icon: Icons.notes, label: 'Notes', value: _notesController.text),
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
                    const Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Estimated Cost', style: TextStyle(color: Colors.white70, fontSize: 14)),
                        SizedBox(height: 2),
                        Text('(Inclusive of all charges)', style: TextStyle(color: Colors.white38, fontSize: 11)),
                      ],
                    ),
                    Text('Rs ${_estimatedCost.toInt()}',
                      style: const TextStyle(color: AppTheme.accentColor, fontSize: 26, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => setState(() => _currentStep = 1),
                      style: OutlinedButton.styleFrom(
                        minimumSize: const Size(0, 52),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: const Text('Back'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    flex: 2,
                    child: SizedBox(
                      height: 52,
                      child: ElevatedButton(
                        onPressed: _isLoading ? null : _submitBooking,
                        child: _isLoading
                            ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                            : const Text('Confirm Booking', style: TextStyle(fontSize: 16)),
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

  Future<void> _submitBooking() async {
    setState(() => _isLoading = true);
    try {
      await _bookingService.createBooking(
        machineId: widget.machine.id,
        machineCategory: widget.machine.category,
        machineModel: widget.machine.model,
        vendorName: widget.machine.vendorName,
        startDate: _startDate.toIso8601String(),
        endDate: _endDate.toIso8601String(),
        rateType: _rateType,
        rate: _rate,
        estimatedCost: _estimatedCost,
        workLocation: {
          'address': _addressController.text,
          'city': widget.machine.location.city,
        },
        notes: _notesController.text,
        estimateId: widget.estimateId,
      );
      if (mounted) {
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (_) => AlertDialog(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppTheme.successColor.withAlpha(25),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.check_circle, color: AppTheme.successColor, size: 64),
                ),
                const SizedBox(height: 20),
                const Text('Booking Submitted!',
                  style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Text('Your booking request has been sent to ${widget.machine.vendorName}. You\'ll be notified once they respond.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.grey[600])),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.of(context).pop();
                      Navigator.of(context).popUntil((route) => route.isFirst);
                    },
                    child: const Text('Go to Home'),
                  ),
                ),
              ],
            ),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  void dispose() {
    _addressController.dispose();
    _notesController.dispose();
    super.dispose();
  }
}

class _StepDot extends StatelessWidget {
  final int index;
  final String label;
  final bool isActive;
  const _StepDot({required this.index, required this.label, required this.isActive});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        CircleAvatar(
          radius: 16,
          backgroundColor: isActive ? AppTheme.primaryColor : Colors.grey[300],
          child: Text('$index', style: TextStyle(color: isActive ? Colors.white : Colors.grey[600], fontWeight: FontWeight.bold, fontSize: 13)),
        ),
        const SizedBox(height: 4),
        Text(label, style: TextStyle(fontSize: 11, color: isActive ? AppTheme.primaryColor : Colors.grey[500])),
      ],
    );
  }
}

class _SummaryTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  const _SummaryTile({required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: AppTheme.primaryColor),
          const SizedBox(width: 12),
          SizedBox(width: 80, child: Text(label, style: TextStyle(color: Colors.grey[600], fontSize: 14))),
          Expanded(child: Text(value, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14))),
        ],
      ),
    );
  }
}

class _DatePicker extends StatelessWidget {
  final String label;
  final String formatted;
  final VoidCallback onTap;
  const _DatePicker({required this.label, required this.formatted, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: InputDecorator(
        decoration: InputDecoration(labelText: label),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(formatted),
            const Icon(Icons.calendar_today, size: 18),
          ],
        ),
      ),
    );
  }
}
