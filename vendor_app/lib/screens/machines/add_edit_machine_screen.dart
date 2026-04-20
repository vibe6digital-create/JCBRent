import 'dart:io';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:image_picker/image_picker.dart';
import '../../config/theme.dart';
import '../../services/booking_service.dart';
import '../../services/machine_service.dart';

class AddEditMachineScreen extends StatefulWidget {
  const AddEditMachineScreen({super.key});

  @override
  State<AddEditMachineScreen> createState() => _AddEditMachineScreenState();
}

class _AddEditMachineScreenState extends State<AddEditMachineScreen> {
  final _formKey = GlobalKey<FormState>();
  final _imagePicker = ImagePicker();

  String? _category;
  String? _model;
  final _customModelController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _yearController = TextEditingController();
  final _hourlyRateController = TextEditingController();
  final _dailyRateController = TextEditingController();
  final _weeklyRateController = TextEditingController();
  final _monthlyRateController = TextEditingController();
  final _sixMonthRateController = TextEditingController();
  final _yearlyRateController = TextEditingController();
  final _cityController = TextEditingController();
  final _stateController = TextEditingController();
  bool _isAvailable = true;
  bool _isLoading = false;
  bool _isLoadingMeta = true;
  bool _isLoadingModels = false;
  bool _showLongTermRates = false;
  XFile? _rcImage;
  XFile? _fitnessImage;
  XFile? _insuranceImage;
  final List<XFile> _newPhotos = [];
  final _machineService = MachineService();
  final _bookingService = BookingService();

  List<String> _categories = [];
  List<String> _models = [];
  List<String> _availableServiceAreas = [];
  final Set<String> _selectedServiceAreas = {};

  // City name -> booking count from the last 90 days (via traffic heatmap)
  Map<String, int> _demandByCity = {};
  String? _gpsCity;
  bool _gpsChecking = false;

  static const String _otherModelSentinel = '__other__';

  @override
  void initState() {
    super.initState();
    _loadMeta();
  }

  Future<void> _loadMeta() async {
    try {
      final results = await Future.wait([
        _machineService.getCategories(),
        _machineService.getServiceAreas(),
        _bookingService.getTrafficHeatmap(days: 90)
            .catchError((_) => <Map<String, dynamic>>[]),
      ]);
      if (!mounted) return;

      final demand = <String, int>{};
      for (final p in results[2] as List<Map<String, dynamic>>) {
        final city = (p['city'] ?? '').toString();
        final count = (p['count'] as num?)?.toInt() ?? 0;
        if (city.isNotEmpty) demand[city] = count;
      }

      setState(() {
        _categories = results[0] as List<String>;
        _availableServiceAreas = results[1] as List<String>;
        _demandByCity = demand;
        if (_categories.isNotEmpty) _category = _categories.first;
        _isLoadingMeta = false;
      });
      if (_category != null) _loadModels(_category!);
      _autoPickCityFromGps();
    } catch (_) {
      if (mounted) setState(() => _isLoadingMeta = false);
    }
  }

  /// Attempts to resolve the device's current GPS position, look up the
  /// nearest known city on the backend, and pre-select it as a service area.
  /// Silently does nothing if the vendor denies location permission.
  Future<void> _autoPickCityFromGps() async {
    setState(() => _gpsChecking = true);
    try {
      final serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        if (mounted) setState(() => _gpsChecking = false);
        return;
      }
      var perm = await Geolocator.checkPermission();
      if (perm == LocationPermission.denied) {
        perm = await Geolocator.requestPermission();
      }
      if (perm == LocationPermission.denied || perm == LocationPermission.deniedForever) {
        if (mounted) setState(() => _gpsChecking = false);
        return;
      }
      final pos = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.low,
          timeLimit: Duration(seconds: 8),
        ),
      );
      final city = await _machineService.getNearestCity(pos.latitude, pos.longitude);
      if (!mounted) return;
      if (city != null && _availableServiceAreas.contains(city)) {
        setState(() {
          _gpsCity = city;
          _selectedServiceAreas.add(city);
          if (_cityController.text.isEmpty) _cityController.text = city;
        });
      } else if (city != null) {
        // City known but not in admin's list — still surface it in cityController
        setState(() {
          _gpsCity = city;
          if (_cityController.text.isEmpty) _cityController.text = city;
        });
      }
    } catch (_) {
      // Ignore — GPS is a nice-to-have, not required
    } finally {
      if (mounted) setState(() => _gpsChecking = false);
    }
  }

  Future<void> _loadModels(String category) async {
    setState(() {
      _isLoadingModels = true;
      _models = [];
      _model = null;
      _customModelController.clear();
    });
    try {
      final models = await _machineService.getModels(category);
      if (!mounted) return;
      setState(() {
        _models = models;
        _model = models.isNotEmpty ? models.first : _otherModelSentinel;
        _isLoadingModels = false;
      });
    } catch (_) {
      if (mounted) {
        setState(() {
          _model = _otherModelSentinel;
          _isLoadingModels = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      appBar: AppBar(title: const Text('Add Machine')),
      body: _isLoadingMeta
          ? const Center(child: CircularProgressIndicator())
          : Form(
              key: _formKey,
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Photos
                    const Text('Machine Photos', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16, color: AppTheme.textPrimary)),
                    const SizedBox(height: 10),
                    SizedBox(
                      height: 110,
                      child: ListView(
                        scrollDirection: Axis.horizontal,
                        children: [
                          ..._newPhotos.map((photo) => Padding(
                            padding: const EdgeInsets.only(right: 10),
                            child: Stack(
                              clipBehavior: Clip.none,
                              children: [
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(16),
                                  child: Image.file(File(photo.path), width: 110, height: 110, fit: BoxFit.cover),
                                ),
                                Positioned(
                                  top: -6, right: -6,
                                  child: GestureDetector(
                                    onTap: () => setState(() => _newPhotos.remove(photo)),
                                    child: Container(
                                      decoration: const BoxDecoration(color: Colors.red, shape: BoxShape.circle),
                                      padding: const EdgeInsets.all(3),
                                      child: const Icon(Icons.close, size: 13, color: Colors.white),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          )),
                          GestureDetector(
                            onTap: _pickPhoto,
                            child: Container(
                              width: 110,
                              decoration: BoxDecoration(
                                border: Border.all(color: AppTheme.accentColor, width: 1.5, style: BorderStyle.solid),
                                borderRadius: BorderRadius.circular(16),
                              ),
                              child: const Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(Icons.add_a_photo_rounded, color: AppTheme.accentColor, size: 28),
                                  SizedBox(height: 6),
                                  Text('Add Photo', style: TextStyle(color: AppTheme.accentColor, fontSize: 12, fontWeight: FontWeight.w600)),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Category dropdown (from API)
                    if (_categories.isEmpty)
                      const Text('No categories available. Please contact admin.',
                          style: TextStyle(color: Colors.red, fontSize: 13))
                    else
                      DropdownButtonFormField<String>(
                        value: _category,
                        decoration: const InputDecoration(labelText: 'Machine Category *'),
                        items: _categories.map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
                        onChanged: (v) {
                          if (v == null || v == _category) return;
                          setState(() => _category = v);
                          _loadModels(v);
                        },
                        validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                      ),
                    const SizedBox(height: 14),

                    // Model dropdown (populated based on selected category)
                    _isLoadingModels
                        ? const Padding(
                            padding: EdgeInsets.symmetric(vertical: 12),
                            child: Row(
                              children: [
                                SizedBox(
                                  height: 16, width: 16,
                                  child: CircularProgressIndicator(strokeWidth: 2),
                                ),
                                SizedBox(width: 10),
                                Text('Loading models…', style: TextStyle(fontSize: 13, color: Colors.grey)),
                              ],
                            ),
                          )
                        : DropdownButtonFormField<String>(
                            value: _model,
                            decoration: const InputDecoration(labelText: 'Model *'),
                            items: [
                              ..._models.map((m) => DropdownMenuItem(value: m, child: Text(m))),
                              const DropdownMenuItem(
                                value: _otherModelSentinel,
                                child: Text('Other (type manually)', style: TextStyle(fontStyle: FontStyle.italic)),
                              ),
                            ],
                            onChanged: (v) => setState(() => _model = v),
                            validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                          ),
                    if (_model == _otherModelSentinel) ...[
                      const SizedBox(height: 10),
                      TextFormField(
                        controller: _customModelController,
                        decoration: const InputDecoration(
                          labelText: 'Enter model name *',
                          hintText: 'e.g. JCB 3DX Super',
                        ),
                        textCapitalization: TextCapitalization.words,
                        validator: (v) {
                          if (_model != _otherModelSentinel) return null;
                          return v == null || v.trim().isEmpty ? 'Required' : null;
                        },
                      ),
                    ],
                    const SizedBox(height: 14),

                    TextFormField(
                      controller: _descriptionController,
                      decoration: const InputDecoration(labelText: 'Description'),
                      maxLines: 3,
                    ),
                    const SizedBox(height: 14),

                    // Year of manufacture (mandatory)
                    TextFormField(
                      controller: _yearController,
                      decoration: const InputDecoration(
                        labelText: 'Year of Manufacture *',
                        hintText: 'e.g. 2021',
                      ),
                      keyboardType: TextInputType.number,
                      validator: (v) {
                        if (v == null || v.trim().isEmpty) return 'Required';
                        final year = int.tryParse(v.trim());
                        if (year == null) return 'Enter a valid year';
                        final now = DateTime.now().year;
                        if (year < 1970 || year > now) return 'Year must be between 1970 and $now';
                        return null;
                      },
                    ),
                    const SizedBox(height: 14),

                    // Rates — mandatory tier
                    Row(
                      children: [
                        Expanded(
                          child: TextFormField(
                            controller: _hourlyRateController,
                            decoration: const InputDecoration(labelText: 'Hourly Rate *', prefixText: 'Rs '),
                            keyboardType: TextInputType.number,
                            validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                          ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: TextFormField(
                            controller: _dailyRateController,
                            decoration: const InputDecoration(labelText: 'Daily Rate *', prefixText: 'Rs '),
                            keyboardType: TextInputType.number,
                            validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),
                    TextFormField(
                      controller: _weeklyRateController,
                      decoration: const InputDecoration(labelText: 'Weekly Rate *', prefixText: 'Rs '),
                      keyboardType: TextInputType.number,
                      validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                    ),
                    const SizedBox(height: 14),

                    // Optional long-term rates
                    InkWell(
                      onTap: () => setState(() => _showLongTermRates = !_showLongTermRates),
                      borderRadius: BorderRadius.circular(12),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
                        decoration: BoxDecoration(
                          color: AppTheme.accentColor.withAlpha(15),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppTheme.accentColor.withAlpha(60)),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              _showLongTermRates ? Icons.expand_less_rounded : Icons.expand_more_rounded,
                              color: AppTheme.accentColor,
                              size: 22,
                            ),
                            const SizedBox(width: 8),
                            const Expanded(
                              child: Text(
                                'Long-term rates (optional)',
                                style: TextStyle(
                                  fontWeight: FontWeight.w600,
                                  color: AppTheme.accentColor,
                                  fontSize: 14,
                                ),
                              ),
                            ),
                            const Text('Monthly · 6M · 1Y',
                              style: TextStyle(fontSize: 11, color: Colors.grey)),
                          ],
                        ),
                      ),
                    ),
                    if (_showLongTermRates) ...[
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _monthlyRateController,
                        decoration: const InputDecoration(labelText: 'Monthly Rate', prefixText: 'Rs '),
                        keyboardType: TextInputType.number,
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _sixMonthRateController,
                        decoration: const InputDecoration(labelText: '6-Month Rate', prefixText: 'Rs '),
                        keyboardType: TextInputType.number,
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _yearlyRateController,
                        decoration: const InputDecoration(labelText: '1-Year Rate', prefixText: 'Rs '),
                        keyboardType: TextInputType.number,
                      ),
                    ],
                    const SizedBox(height: 14),

                    Row(
                      children: [
                        Expanded(
                          child: TextFormField(
                            controller: _cityController,
                            decoration: const InputDecoration(labelText: 'City *'),
                            validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                          ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: TextFormField(
                            controller: _stateController,
                            decoration: const InputDecoration(labelText: 'State *'),
                            validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),

                    // Service Areas — demand-aware picker
                    Row(
                      children: [
                        const Text('Service Areas',
                            style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14, color: AppTheme.textPrimary)),
                        const SizedBox(width: 6),
                        if (_gpsChecking)
                          const SizedBox(
                            width: 12, height: 12,
                            child: CircularProgressIndicator(strokeWidth: 1.5),
                          ),
                        if (_gpsCity != null && !_gpsChecking) ...[
                          const Icon(Icons.my_location, size: 13, color: AppTheme.accentColor),
                          const SizedBox(width: 4),
                          Text('Detected: $_gpsCity',
                              style: const TextStyle(fontSize: 11, color: AppTheme.accentColor, fontWeight: FontWeight.w600)),
                        ],
                      ],
                    ),
                    const SizedBox(height: 4),
                    if (_availableServiceAreas.isEmpty)
                      const Text('No service areas available. Please contact admin.',
                          style: TextStyle(color: Colors.orange, fontSize: 13))
                    else ...[
                      const Text('Pick cities where you can operate. Hot areas = more customer demand.',
                          style: TextStyle(fontSize: 12, color: Colors.grey)),
                      const SizedBox(height: 10),
                      _buildServiceAreaPicker(),
                    ],
                    const SizedBox(height: 14),

                    // Compliance documents — mandatory
                    const Text('Compliance Documents',
                      style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16, color: AppTheme.textPrimary)),
                    const SizedBox(height: 4),
                    Text(
                      'Required for admin approval. Clear photo of each certificate.',
                      style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                    ),
                    const SizedBox(height: 12),
                    _MachineDocTile(
                      label: 'Registration Certificate (RC)',
                      icon: Icons.article_rounded,
                      image: _rcImage,
                      onPick: () => _pickMachineDoc((f) => setState(() => _rcImage = f)),
                      onRemove: () => setState(() => _rcImage = null),
                    ),
                    const SizedBox(height: 10),
                    _MachineDocTile(
                      label: 'Fitness Certificate',
                      icon: Icons.health_and_safety_rounded,
                      image: _fitnessImage,
                      onPick: () => _pickMachineDoc((f) => setState(() => _fitnessImage = f)),
                      onRemove: () => setState(() => _fitnessImage = null),
                    ),
                    const SizedBox(height: 10),
                    _MachineDocTile(
                      label: 'Insurance Certificate',
                      icon: Icons.verified_user_rounded,
                      image: _insuranceImage,
                      onPick: () => _pickMachineDoc((f) => setState(() => _insuranceImage = f)),
                      onRemove: () => setState(() => _insuranceImage = null),
                    ),
                    const SizedBox(height: 20),

                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [AppTheme.softShadow],
                      ),
                      child: SwitchListTile(
                        title: const Text('Available for Booking', style: TextStyle(fontWeight: FontWeight.w600)),
                        subtitle: Text(_isAvailable ? 'Machine is listed as available' : 'Machine is marked unavailable',
                          style: const TextStyle(fontSize: 13)),
                        value: _isAvailable,
                        activeColor: AppTheme.successColor,
                        onChanged: (v) => setState(() => _isAvailable = v),
                        contentPadding: EdgeInsets.zero,
                      ),
                    ),
                    const SizedBox(height: 28),

                    SizedBox(
                      width: double.infinity,
                      height: 56,
                      child: Container(
                        decoration: BoxDecoration(
                          gradient: AppTheme.accentGradient,
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [AppTheme.accentGlow],
                        ),
                        child: ElevatedButton(
                          onPressed: _isLoading ? null : _submit,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.transparent,
                            shadowColor: Colors.transparent,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          ),
                          child: _isLoading
                              ? const SizedBox(height: 22, width: 22,
                                  child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.white))
                              : const Text('Add Machine', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                        ),
                      ),
                    ),
                    const SizedBox(height: 32),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildServiceAreaPicker() {
    // Split the admin's service-area list into hot (has bookings) vs other.
    final hot = <String>[];
    final others = <String>[];
    for (final area in _availableServiceAreas) {
      final demand = _demandByCity[area] ?? 0;
      if (demand > 0) {
        hot.add(area);
      } else {
        others.add(area);
      }
    }
    // Sort hot areas by demand descending
    hot.sort((a, b) => (_demandByCity[b] ?? 0).compareTo(_demandByCity[a] ?? 0));
    // Others alphabetical
    others.sort();

    Widget chip(String area, {required bool hot}) {
      final isSelected = _selectedServiceAreas.contains(area);
      final count = _demandByCity[area] ?? 0;
      return FilterChip(
        label: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (hot) ...[
              Text('🔥', style: TextStyle(fontSize: 12, color: isSelected ? Colors.white : null)),
              const SizedBox(width: 4),
            ],
            Text(area, style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: isSelected ? Colors.white : AppTheme.textPrimary,
            )),
            if (hot) ...[
              const SizedBox(width: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                decoration: BoxDecoration(
                  color: (isSelected ? Colors.white : AppTheme.accentColor).withAlpha(isSelected ? 60 : 40),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text('$count',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    color: isSelected ? Colors.white : AppTheme.accentColor,
                  ),
                ),
              ),
            ],
          ],
        ),
        selected: isSelected,
        selectedColor: AppTheme.accentColor,
        backgroundColor: hot ? AppTheme.accentColor.withAlpha(20) : AppTheme.backgroundColor,
        side: BorderSide(
          color: isSelected
              ? AppTheme.accentColor
              : (hot ? AppTheme.accentColor.withAlpha(100) : Colors.grey[400]!),
        ),
        showCheckmark: false,
        onSelected: (selected) {
          setState(() {
            if (selected) {
              _selectedServiceAreas.add(area);
            } else {
              _selectedServiceAreas.remove(area);
            }
          });
        },
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (hot.isNotEmpty) ...[
          Row(
            children: const [
              Text('Hot areas', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppTheme.accentColor)),
              SizedBox(width: 6),
              Text('• last 90 days', style: TextStyle(fontSize: 11, color: Colors.grey)),
            ],
          ),
          const SizedBox(height: 6),
          Wrap(spacing: 8, runSpacing: 8, children: hot.map((a) => chip(a, hot: true)).toList()),
          const SizedBox(height: 14),
        ],
        if (others.isNotEmpty) ...[
          Text(hot.isEmpty ? 'Available cities' : 'Other cities',
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppTheme.textSecondary)),
          const SizedBox(height: 6),
          Wrap(spacing: 8, runSpacing: 8, children: others.map((a) => chip(a, hot: false)).toList()),
        ],
      ],
    );
  }

  Future<void> _pickPhoto() async {
    final picked = await _imagePicker.pickImage(source: ImageSource.gallery);
    if (picked != null) setState(() => _newPhotos.add(picked));
  }

  Future<void> _pickMachineDoc(void Function(XFile) onPicked) async {
    try {
      final picked = await _imagePicker.pickImage(
        source: ImageSource.gallery,
        maxWidth: 1600,
        imageQuality: 85,
      );
      if (picked != null) onPicked(picked);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Could not pick image: $e')),
        );
      }
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    // Document validations — form validators only cover text fields
    if (_rcImage == null) { _flashError('Please upload the Registration Certificate (RC)'); return; }
    if (_fitnessImage == null) { _flashError('Please upload the Fitness Certificate'); return; }
    if (_insuranceImage == null) { _flashError('Please upload the Insurance Certificate'); return; }

    setState(() => _isLoading = true);

    try {
      // Upload photos and documents in parallel (machine images + 3 docs)
      final imageUrlsFuture = _machineService.uploadMachinePhotos(_newPhotos);
      final rcFuture = _machineService.uploadMachineDocument(_rcImage!, kind: 'rc');
      final fitnessFuture = _machineService.uploadMachineDocument(_fitnessImage!, kind: 'fitness');
      final insuranceFuture = _machineService.uploadMachineDocument(_insuranceImage!, kind: 'insurance');

      final imageUrls = await imageUrlsFuture;
      final rcUrl = await rcFuture;
      final fitnessUrl = await fitnessFuture;
      final insuranceUrl = await insuranceFuture;

      final resolvedModel = _model == _otherModelSentinel
          ? _customModelController.text.trim()
          : (_model ?? '');

      double? optionalRate(TextEditingController c) {
        final t = c.text.trim();
        if (t.isEmpty) return null;
        return double.tryParse(t);
      }

      await _machineService.createMachine(
        category: _category!,
        model: resolvedModel,
        description: _descriptionController.text.trim(),
        hourlyRate: double.tryParse(_hourlyRateController.text) ?? 0,
        dailyRate: double.tryParse(_dailyRateController.text) ?? 0,
        weeklyRate: double.tryParse(_weeklyRateController.text) ?? 0,
        yearOfManufacture: int.tryParse(_yearController.text.trim()) ?? DateTime.now().year,
        rcUrl: rcUrl,
        fitnessUrl: fitnessUrl,
        insuranceUrl: insuranceUrl,
        city: _cityController.text.trim(),
        state: _stateController.text.trim(),
        serviceAreas: _selectedServiceAreas.toList(),
        imageUrls: imageUrls,
        monthlyRate: optionalRate(_monthlyRateController),
        sixMonthRate: optionalRate(_sixMonthRateController),
        yearlyRate: optionalRate(_yearlyRateController),
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Machine added successfully! Pending admin approval.'),
            backgroundColor: AppTheme.successColor,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
        Navigator.pop(context, true);
      }
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString().replaceFirst('Exception: ', '')),
            backgroundColor: AppTheme.errorColor,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  void _flashError(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: AppTheme.errorColor,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  void dispose() {
    _customModelController.dispose();
    _descriptionController.dispose();
    _yearController.dispose();
    _hourlyRateController.dispose();
    _dailyRateController.dispose();
    _weeklyRateController.dispose();
    _monthlyRateController.dispose();
    _sixMonthRateController.dispose();
    _yearlyRateController.dispose();
    _cityController.dispose();
    _stateController.dispose();
    super.dispose();
  }
}

class _MachineDocTile extends StatelessWidget {
  final String label;
  final IconData icon;
  final XFile? image;
  final VoidCallback onPick;
  final VoidCallback onRemove;
  const _MachineDocTile({
    required this.label,
    required this.icon,
    required this.image,
    required this.onPick,
    required this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    final hasImage = image != null;
    return InkWell(
      onTap: hasImage ? null : onPick,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: hasImage ? AppTheme.successColor.withAlpha(80) : Colors.grey.withAlpha(60),
          ),
          boxShadow: [AppTheme.softShadow],
        ),
        child: Row(
          children: [
            hasImage
                ? ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: Image.file(File(image!.path), width: 60, height: 60, fit: BoxFit.cover),
                  )
                : Container(
                    width: 60, height: 60,
                    decoration: BoxDecoration(
                      color: AppTheme.accentColor.withAlpha(15),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(icon, color: AppTheme.accentColor, size: 26),
                  ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label,
                    style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: AppTheme.textPrimary)),
                  const SizedBox(height: 2),
                  Text(hasImage ? 'Uploaded' : 'Tap to upload',
                    style: TextStyle(
                      fontSize: 12,
                      color: hasImage ? AppTheme.successColor : Colors.grey[600],
                      fontWeight: hasImage ? FontWeight.w600 : FontWeight.w500,
                    )),
                ],
              ),
            ),
            if (hasImage) ...[
              IconButton(
                icon: const Icon(Icons.refresh, size: 20, color: Colors.grey),
                onPressed: onPick,
                tooltip: 'Replace',
              ),
              IconButton(
                icon: const Icon(Icons.close, size: 20, color: Colors.redAccent),
                onPressed: onRemove,
                tooltip: 'Remove',
              ),
            ] else
              const Icon(Icons.chevron_right_rounded, color: Colors.grey),
          ],
        ),
      ),
    );
  }
}
