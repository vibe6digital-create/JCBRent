import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../../config/theme.dart';
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
  final _modelController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _hourlyRateController = TextEditingController();
  final _dailyRateController = TextEditingController();
  final _cityController = TextEditingController();
  final _stateController = TextEditingController();
  bool _isAvailable = true;
  bool _isLoading = false;
  bool _isLoadingMeta = true;
  final List<XFile> _newPhotos = [];
  final _machineService = MachineService();

  List<String> _categories = [];
  List<String> _availableServiceAreas = [];
  final Set<String> _selectedServiceAreas = {};

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
      ]);
      if (mounted) {
        setState(() {
          _categories = results[0] as List<String>;
          _availableServiceAreas = results[1] as List<String>;
          if (_categories.isNotEmpty) _category = _categories.first;
          _isLoadingMeta = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoadingMeta = false);
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
                          ..._newPhotos.map((photo) => Container(
                            width: 110, margin: const EdgeInsets.only(right: 10),
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(16),
                              color: AppTheme.accentColor.withAlpha(15),
                            ),
                            child: const Center(child: Icon(Icons.image_rounded, color: AppTheme.accentColor, size: 32)),
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
                        decoration: const InputDecoration(labelText: 'Machine Category'),
                        items: _categories.map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
                        onChanged: (v) => setState(() => _category = v),
                        validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                      ),
                    const SizedBox(height: 14),

                    TextFormField(
                      controller: _modelController,
                      decoration: const InputDecoration(labelText: 'Model / Name *'),
                      validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                    ),
                    const SizedBox(height: 14),

                    TextFormField(
                      controller: _descriptionController,
                      decoration: const InputDecoration(labelText: 'Description'),
                      maxLines: 3,
                    ),
                    const SizedBox(height: 14),

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

                    // Service Areas multi-select (from API)
                    const Text('Service Areas', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14, color: AppTheme.textPrimary)),
                    const SizedBox(height: 4),
                    if (_availableServiceAreas.isEmpty)
                      const Text('No service areas available. Please contact admin.',
                          style: TextStyle(color: Colors.orange, fontSize: 13))
                    else ...[
                      const Text('Select all cities where your machine operates',
                          style: TextStyle(fontSize: 12, color: Colors.grey)),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: _availableServiceAreas.map((area) {
                          final isSelected = _selectedServiceAreas.contains(area);
                          return FilterChip(
                            label: Text(area, style: TextStyle(
                              fontSize: 13,
                              color: isSelected ? Colors.white : AppTheme.textPrimary,
                            )),
                            selected: isSelected,
                            selectedColor: AppTheme.accentColor,
                            backgroundColor: AppTheme.backgroundColor,
                            side: BorderSide(
                              color: isSelected ? AppTheme.accentColor : Colors.grey[400]!,
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
                        }).toList(),
                      ),
                    ],
                    const SizedBox(height: 14),

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

  Future<void> _pickPhoto() async {
    final picked = await _imagePicker.pickImage(source: ImageSource.gallery);
    if (picked != null) setState(() => _newPhotos.add(picked));
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isLoading = true);

    try {
      await _machineService.createMachine(
        category: _category!,
        model: _modelController.text.trim(),
        description: _descriptionController.text.trim(),
        hourlyRate: double.tryParse(_hourlyRateController.text) ?? 0,
        dailyRate: double.tryParse(_dailyRateController.text) ?? 0,
        city: _cityController.text.trim(),
        state: _stateController.text.trim(),
        serviceAreas: _selectedServiceAreas.toList(),
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

  @override
  void dispose() {
    _modelController.dispose();
    _descriptionController.dispose();
    _hourlyRateController.dispose();
    _dailyRateController.dispose();
    _cityController.dispose();
    _stateController.dispose();
    super.dispose();
  }
}
