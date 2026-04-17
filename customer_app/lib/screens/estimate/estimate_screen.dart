import 'dart:io';
import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:image_picker/image_picker.dart';
import '../../config/theme.dart';
import '../../services/estimate_service.dart';
import 'estimate_result_screen.dart';

class EstimateScreen extends StatefulWidget {
  final String? machineCategory;
  const EstimateScreen({super.key, this.machineCategory});

  @override
  State<EstimateScreen> createState() => _EstimateScreenState();
}

class _EstimateScreenState extends State<EstimateScreen> {
  final _estimateService = EstimateService();
  final _imagePicker = ImagePicker();

  final List<XFile> _selectedPhotos = [];
  String? _workType;
  String? _areaSize;
  String? _soilType;
  bool _isLoading = false;
  String _loadingMessage = '';

  final _workTypes = {
    'excavation': 'Excavation',
    'leveling': 'Leveling',
    'trenching': 'Trenching',
    'foundation': 'Foundation',
    'debris_removal': 'Debris Removal',
  };

  final _areaSizes = {
    'small': 'Small (Up to 500 sq ft)',
    'medium': 'Medium (500-2000 sq ft)',
    'large': 'Large (2000+ sq ft)',
  };

  final _soilTypes = {
    'soft': 'Soft Soil',
    'mixed': 'Mixed Soil',
    'hard_rocky': 'Hard / Rocky',
    'not_sure': 'Not Sure',
  };

  Future<void> _pickPhotos() async {
    final picked = await _imagePicker.pickMultiImage(imageQuality: 70);
    if (picked.isNotEmpty) {
      setState(() {
        for (final p in picked) {
          if (_selectedPhotos.length < 5) _selectedPhotos.add(p);
        }
      });
    }
  }

  Future<List<String>> _uploadPhotos() async {
    final uid = FirebaseAuth.instance.currentUser?.uid ?? 'unknown';
    final storage = FirebaseStorage.instance;
    final urls = <String>[];

    for (int i = 0; i < _selectedPhotos.length; i++) {
      final photo = _selectedPhotos[i];
      final fileName = '${DateTime.now().millisecondsSinceEpoch}_$i.jpg';
      final storageRef = storage.ref().child('estimates/$uid/$fileName');
      await storageRef.putFile(File(photo.path));
      final url = await storageRef.getDownloadURL();
      urls.add(url);
    }
    return urls;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Smart Estimate')),
      body: Stack(
        children: [
          SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Upload Work Site Photos',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                Text(
                  'At least 1 photo required (max 5) — AI will analyze your site',
                  style: TextStyle(color: Colors.grey[600], fontSize: 13),
                ),
                const SizedBox(height: 12),

                // Photo row
                SizedBox(
                  height: 100,
                  child: ListView(
                    scrollDirection: Axis.horizontal,
                    children: [
                      ..._selectedPhotos.map((photo) => Padding(
                            padding: const EdgeInsets.only(right: 8),
                            child: Stack(
                              clipBehavior: Clip.none,
                              children: [
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(12),
                                  child: Image.file(
                                    File(photo.path),
                                    width: 90,
                                    height: 90,
                                    fit: BoxFit.cover,
                                  ),
                                ),
                                Positioned(
                                  top: -6,
                                  right: -6,
                                  child: GestureDetector(
                                    onTap: () => setState(() => _selectedPhotos.remove(photo)),
                                    child: Container(
                                      decoration: const BoxDecoration(
                                          color: Colors.red, shape: BoxShape.circle),
                                      padding: const EdgeInsets.all(3),
                                      child: const Icon(Icons.close,
                                          size: 13, color: Colors.white),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          )),
                      if (_selectedPhotos.length < 5)
                        GestureDetector(
                          onTap: _pickPhotos,
                          child: Container(
                            width: 90,
                            height: 90,
                            decoration: BoxDecoration(
                              border: Border.all(color: AppTheme.primaryColor),
                              borderRadius: BorderRadius.circular(12),
                              color: AppTheme.primaryColor.withAlpha(13),
                            ),
                            child: const Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.camera_alt,
                                    size: 28, color: AppTheme.primaryColor),
                                SizedBox(height: 4),
                                Text('Add Photo',
                                    style: TextStyle(
                                        color: AppTheme.primaryColor, fontSize: 11)),
                              ],
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // Work Type
                const Text('Work Type',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                ..._workTypes.entries.map((e) => RadioListTile<String>(
                      value: e.key,
                      groupValue: _workType,
                      title: Text(e.value),
                      activeColor: AppTheme.primaryColor,
                      onChanged: (v) => setState(() => _workType = v),
                    )),
                const SizedBox(height: 16),

                // Area Size
                const Text('Approximate Area',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                ..._areaSizes.entries.map((e) => RadioListTile<String>(
                      value: e.key,
                      groupValue: _areaSize,
                      title: Text(e.value),
                      activeColor: AppTheme.primaryColor,
                      onChanged: (v) => setState(() => _areaSize = v),
                    )),
                const SizedBox(height: 16),

                // Soil Type
                const Text('Soil Type',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                ..._soilTypes.entries.map((e) => RadioListTile<String>(
                      value: e.key,
                      groupValue: _soilType,
                      title: Text(e.value),
                      activeColor: AppTheme.primaryColor,
                      onChanged: (v) => setState(() => _soilType = v),
                    )),
                const SizedBox(height: 24),

                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _submitEstimate,
                    child: _isLoading
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(
                                strokeWidth: 2, color: Colors.white))
                        : const Text('Get AI Estimate'),
                  ),
                ),
                const SizedBox(height: 32),
              ],
            ),
          ),

          // Loading overlay
          if (_isLoading)
            Container(
              color: Colors.black.withAlpha(120),
              child: Center(
                child: Card(
                  margin: const EdgeInsets.symmetric(horizontal: 40),
                  child: Padding(
                    padding: const EdgeInsets.all(28),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const CircularProgressIndicator(),
                        const SizedBox(height: 16),
                        Text(
                          _loadingMessage,
                          textAlign: TextAlign.center,
                          style: const TextStyle(fontSize: 14),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Future<void> _submitEstimate() async {
    if (_selectedPhotos.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('Please upload at least one site photo')));
      return;
    }
    if (_workType == null || _areaSize == null || _soilType == null) {
      ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please fill in all fields')));
      return;
    }

    setState(() {
      _isLoading = true;
      _loadingMessage = 'Uploading site photos...';
    });

    try {
      final photoUrls = await _uploadPhotos();

      if (mounted) setState(() => _loadingMessage = 'Analyzing with AI...');

      final estimate = await _estimateService.createEstimate(
        workType: _workType!,
        areaSize: _areaSize!,
        soilType: _soilType!,
        photoUrls: photoUrls,
        machineCategory: widget.machineCategory,
      );

      if (mounted) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
              builder: (_) => EstimateResultScreen(estimate: estimate)),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text(e.toString().replaceFirst('Exception: ', ''))));
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }
}
