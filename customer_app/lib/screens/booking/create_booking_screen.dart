import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import '../../config/app_config.dart';
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
  final _couponController = TextEditingController();

  DateTime _startDate = DateTime.now().add(const Duration(days: 1));
  DateTime _endDate = DateTime.now().add(const Duration(days: 2));
  TimeOfDay _startTime = const TimeOfDay(hour: 9, minute: 0);
  String _rateType = 'daily';
  bool _isLoading = false;
  int _currentStep = 0;
  bool _isBookLater = false;

  bool _couponLoading = false;
  bool _couponApplied = false;
  double _couponDiscount = 0;
  String _couponMessage = '';

  // Address autocomplete
  List<String> _addressSuggestions = [];
  Timer? _debounce;

  // Duration quantity for weekly/monthly
  int _durationQty = 1;

  double get _rate {
    switch (_rateType) {
      case 'weekly': return widget.machine.dailyRate * 6; // ~weekly discount
      case 'monthly': return widget.machine.dailyRate * 25;
      case 'hourly': return widget.machine.hourlyRate;
      default: return widget.machine.dailyRate;
    }
  }

  double get _estimatedCost {
    switch (_rateType) {
      case 'hourly':
        return widget.machine.hourlyRate * _endDate.difference(_startDate).inHours.clamp(1, 99999);
      case 'daily':
        return widget.machine.dailyRate * _endDate.difference(_startDate).inDays.clamp(1, 999);
      case 'weekly':
        return (_rate) * _durationQty;
      case 'monthly':
        return (_rate) * _durationQty;
      default:
        return widget.machine.dailyRate;
    }
  }

  DateTime get _computedEndDate {
    if (_rateType == 'weekly') {
      return _startDate.add(Duration(days: 7 * _durationQty));
    } else if (_rateType == 'monthly') {
      return DateTime(_startDate.year, _startDate.month + _durationQty, _startDate.day);
    }
    return _endDate;
  }

  Future<void> _fetchAddressSuggestions(String input) async {
    if (input.length < 3) {
      setState(() => _addressSuggestions = []);
      return;
    }
    try {
      final url = Uri.parse(
        'https://maps.googleapis.com/maps/api/place/autocomplete/json'
        '?input=${Uri.encodeComponent(input)}'
        '&components=country:in'
        '&key=${AppConfig.googleMapsApiKey}',
      );
      final resp = await http.get(url).timeout(const Duration(seconds: 5));
      final data = jsonDecode(resp.body) as Map<String, dynamic>;
      final predictions = data['predictions'] as List? ?? [];
      if (mounted) {
        setState(() {
          _addressSuggestions = predictions
              .map((p) => p['description'] as String)
              .take(5)
              .toList();
        });
      }
    } catch (_) {}
  }

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
              // Book Now / Book Later toggle
              Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _isBookLater = false),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        decoration: BoxDecoration(
                          color: !_isBookLater ? AppTheme.primaryColor : Colors.grey[100],
                          borderRadius: const BorderRadius.horizontal(left: Radius.circular(12)),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.bolt, size: 16, color: !_isBookLater ? Colors.white : Colors.grey),
                            const SizedBox(width: 4),
                            Text('Book Now', style: TextStyle(fontWeight: FontWeight.bold,
                              color: !_isBookLater ? Colors.white : Colors.grey)),
                          ],
                        ),
                      ),
                    ),
                  ),
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _isBookLater = true),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        decoration: BoxDecoration(
                          color: _isBookLater ? AppTheme.primaryColor : Colors.grey[100],
                          borderRadius: const BorderRadius.horizontal(right: Radius.circular(12)),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.schedule, size: 16, color: _isBookLater ? Colors.white : Colors.grey),
                            const SizedBox(width: 4),
                            Text('Book Later', style: TextStyle(fontWeight: FontWeight.bold,
                              color: _isBookLater ? Colors.white : Colors.grey)),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              if (_isBookLater)
                Padding(
                  padding: const EdgeInsets.only(top: 6),
                  child: Text('You can book up to 10 days in advance',
                    style: TextStyle(fontSize: 12, color: Colors.grey[500])),
                ),
              const SizedBox(height: 20),

              const Text('Duration Type', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              const SizedBox(height: 8),
              // Hrs / Daily / Weekly / Monthly tabs
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _DurationTab(label: 'Hrs', value: 'hourly',
                      selected: _rateType == 'hourly', onTap: () => setState(() { _rateType = 'hourly'; _durationQty = 1; })),
                    const SizedBox(width: 8),
                    _DurationTab(label: 'Daily', value: 'daily',
                      selected: _rateType == 'daily', onTap: () => setState(() { _rateType = 'daily'; _durationQty = 1; })),
                    const SizedBox(width: 8),
                    _DurationTab(label: 'Weekly', value: 'weekly',
                      selected: _rateType == 'weekly', onTap: () => setState(() { _rateType = 'weekly'; _durationQty = 1; })),
                    const SizedBox(width: 8),
                    _DurationTab(label: 'Monthly', value: 'monthly',
                      selected: _rateType == 'monthly', onTap: () => setState(() { _rateType = 'monthly'; _durationQty = 1; })),
                  ],
                ),
              ),
              const SizedBox(height: 8),
              Text(
                _rateType == 'hourly'
                  ? 'Rs ${widget.machine.hourlyRate.toInt()}/hr'
                  : _rateType == 'daily'
                    ? 'Rs ${widget.machine.dailyRate.toInt()}/day'
                    : _rateType == 'weekly'
                      ? 'Rs ${(widget.machine.dailyRate * 6).toInt()}/week'
                      : 'Rs ${(widget.machine.dailyRate * 25).toInt()}/month',
                style: TextStyle(color: AppTheme.primaryColor, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 20),

              // For weekly/monthly show a qty selector; for hourly/daily show date pickers
              if (_rateType == 'weekly' || _rateType == 'monthly') ...[
                Text('How many ${_rateType == 'weekly' ? 'weeks' : 'months'}?',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                const SizedBox(height: 8),
                Row(
                  children: [
                    IconButton(
                      onPressed: _durationQty > 1 ? () => setState(() => _durationQty--) : null,
                      icon: const Icon(Icons.remove_circle_outline),
                      color: AppTheme.primaryColor,
                    ),
                    Container(
                      width: 60,
                      alignment: Alignment.center,
                      child: Text('$_durationQty',
                        style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                    ),
                    IconButton(
                      onPressed: _durationQty < (_rateType == 'weekly' ? 12 : 12)
                        ? () => setState(() => _durationQty++)
                        : null,
                      icon: const Icon(Icons.add_circle_outline),
                      color: AppTheme.primaryColor,
                    ),
                    const SizedBox(width: 12),
                    Text(
                      _rateType == 'weekly'
                        ? '(${_durationQty * 7} days)'
                        : '(${_durationQty} month${_durationQty > 1 ? 's' : ''})',
                      style: TextStyle(color: Colors.grey[600]),
                    ),
                  ],
                ),
              ],

              const Text('Start Date & Time', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: _DatePicker(
                      label: 'Start Date',
                      formatted: fmt.format(_startDate),
                      onTap: () async {
                        final maxDays = _isBookLater ? 10 : 365;
                        final d = await showDatePicker(
                          context: context,
                          initialDate: _startDate,
                          firstDate: DateTime.now(),
                          lastDate: DateTime.now().add(Duration(days: maxDays)),
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

              if (_rateType == 'hourly' || _rateType == 'daily') ...[
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
              ] else ...[
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.grey[100],
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.event, size: 18, color: Colors.grey),
                      const SizedBox(width: 8),
                      Text('End Date: ${fmt.format(_computedEndDate)}',
                        style: const TextStyle(color: Colors.black87)),
                    ],
                  ),
                ),
              ],
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
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  TextField(
                    controller: _addressController,
                    decoration: InputDecoration(
                      hintText: 'Type work address...',
                      prefixIcon: const Icon(Icons.location_on),
                      suffixIcon: _addressController.text.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.clear, size: 18),
                              onPressed: () {
                                _addressController.clear();
                                setState(() => _addressSuggestions = []);
                              },
                            )
                          : null,
                      filled: true,
                      fillColor: Colors.white,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: Colors.grey[300]!),
                      ),
                    ),
                    onChanged: (v) {
                      _debounce?.cancel();
                      _debounce = Timer(const Duration(milliseconds: 400), () {
                        _fetchAddressSuggestions(v);
                      });
                      setState(() {}); // refresh clear button
                    },
                  ),
                  if (_addressSuggestions.isNotEmpty)
                    Container(
                      margin: const EdgeInsets.only(top: 2),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.grey[300]!),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withAlpha(15),
                            blurRadius: 8, offset: const Offset(0, 4)),
                        ],
                      ),
                      child: Column(
                        children: _addressSuggestions.map((suggestion) => InkWell(
                          onTap: () {
                            _addressController.text = suggestion;
                            setState(() => _addressSuggestions = []);
                          },
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                            child: Row(
                              children: [
                                const Icon(Icons.place_outlined, size: 18, color: Colors.grey),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Text(suggestion,
                                    style: const TextStyle(fontSize: 14),
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        )).toList(),
                      ),
                    ),
                ],
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
              _SummaryTile(icon: Icons.event, label: 'End', value: fmt.format(_computedEndDate)),
              _SummaryTile(icon: Icons.timer, label: 'Duration',
                value: _rateType == 'weekly'
                  ? '$_durationQty week${_durationQty > 1 ? 's' : ''}'
                  : _rateType == 'monthly'
                    ? '$_durationQty month${_durationQty > 1 ? 's' : ''}'
                    : _rateType == 'hourly' ? 'Hourly' : 'Daily'),
              _SummaryTile(icon: Icons.location_on, label: 'Location', value: _addressController.text),
              if (_notesController.text.isNotEmpty)
                _SummaryTile(icon: Icons.notes, label: 'Notes', value: _notesController.text),
              const SizedBox(height: 16),

              // Coupon Code
              if (_couponApplied) ...[
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  decoration: BoxDecoration(
                    color: AppTheme.successColor.withAlpha(20),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppTheme.successColor.withAlpha(80)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.check_circle, color: AppTheme.successColor, size: 18),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(_couponController.text,
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppTheme.successColor)),
                            Text(_couponMessage, style: TextStyle(fontSize: 12, color: Colors.grey[600])),
                          ],
                        ),
                      ),
                      TextButton(
                        onPressed: () => setState(() {
                          _couponApplied = false;
                          _couponDiscount = 0;
                          _couponMessage = '';
                          _couponController.clear();
                        }),
                        child: const Text('Remove', style: TextStyle(color: Colors.red, fontSize: 12)),
                      ),
                    ],
                  ),
                ),
              ] else ...[
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _couponController,
                        textCapitalization: TextCapitalization.characters,
                        decoration: InputDecoration(
                          hintText: 'Coupon code (optional)',
                          prefixIcon: const Icon(Icons.local_offer_outlined),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                          filled: true,
                          fillColor: Colors.white,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      height: 52,
                      decoration: BoxDecoration(
                        color: _couponLoading ? Colors.grey : AppTheme.primaryColor,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: TextButton(
                        onPressed: _couponLoading ? null : () async {
                          final code = _couponController.text.trim();
                          if (code.isEmpty) return;
                          setState(() => _couponLoading = true);
                          try {
                            final result = await _bookingService.validateCoupon(code, _estimatedCost);
                            setState(() {
                              _couponApplied = true;
                              _couponDiscount = (result['discountAmount'] as num).toDouble();
                              _couponMessage = result['message'] ?? 'Discount applied!';
                            });
                          } catch (e) {
                            if (mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text(e.toString().replaceAll('Exception: ', '')),
                                  backgroundColor: Colors.red));
                            }
                          } finally {
                            if (mounted) setState(() => _couponLoading = false);
                          }
                        },
                        child: _couponLoading
                          ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                          : const Text('Apply', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                      ),
                    ),
                  ],
                ),
              ],
              const SizedBox(height: 16),

              // Cost
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: AppTheme.secondaryColor,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  children: [
                    if (_couponApplied) ...[
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Subtotal', style: TextStyle(color: Colors.white70, fontSize: 14)),
                          Text('Rs ${_estimatedCost.toInt()}',
                            style: const TextStyle(color: Colors.white54, fontSize: 14,
                              decoration: TextDecoration.lineThrough)),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Discount', style: TextStyle(color: Colors.white70, fontSize: 14)),
                          Text('- Rs ${_couponDiscount.toInt()}',
                            style: const TextStyle(color: AppTheme.successColor, fontSize: 14, fontWeight: FontWeight.bold)),
                        ],
                      ),
                      Divider(color: Colors.white.withAlpha(30), height: 20),
                    ],
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(_couponApplied ? 'Total (after discount)' : 'Estimated Cost',
                              style: const TextStyle(color: Colors.white70, fontSize: 14)),
                            const SizedBox(height: 2),
                            const Text('(Approximate range)', style: TextStyle(color: Colors.white38, fontSize: 11)),
                          ],
                        ),
                        Text('Rs ${(_estimatedCost - _couponDiscount).clamp(0, double.infinity).toInt()}',
                          style: const TextStyle(color: AppTheme.accentColor, fontSize: 26, fontWeight: FontWeight.bold)),
                      ],
                    ),
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
        endDate: _computedEndDate.toIso8601String(),
        rateType: _rateType,
        rate: _rate,
        estimatedCost: _estimatedCost,
        workLocation: {
          'address': _addressController.text,
          'city': widget.machine.location.city,
        },
        notes: _notesController.text,
        estimateId: widget.estimateId,
        couponCode: _couponController.text.trim().isEmpty ? null : _couponController.text.trim(),
        bookingType: _isBookLater ? 'book_later' : 'book_now',
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
    _debounce?.cancel();
    _addressController.dispose();
    _notesController.dispose();
    _couponController.dispose();
    super.dispose();
  }
}

class _DurationTab extends StatelessWidget {
  final String label;
  final String value;
  final bool selected;
  final VoidCallback onTap;
  const _DurationTab({required this.label, required this.value, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
        decoration: BoxDecoration(
          color: selected ? AppTheme.primaryColor : Colors.grey[100],
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: selected ? AppTheme.primaryColor : Colors.grey[300]!),
        ),
        child: Text(label,
          style: TextStyle(
            fontWeight: FontWeight.bold,
            color: selected ? Colors.white : Colors.grey[700],
          )),
      ),
    );
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
