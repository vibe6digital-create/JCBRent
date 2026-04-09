import 'package:flutter/material.dart';
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

  int _photoCount = 0;
  String? _workType;
  String? _areaSize;
  String? _soilType;
  bool _isLoading = false;

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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Smart Estimate')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Upload Work Site Photos',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Text('At least one photo is required', style: TextStyle(color: Colors.grey[600])),
            const SizedBox(height: 12),

            // Photo upload area (mock)
            GestureDetector(
              onTap: () => setState(() => _photoCount++),
              child: Container(
                height: 120,
                width: double.infinity,
                decoration: BoxDecoration(
                  border: Border.all(color: AppTheme.primaryColor),
                  borderRadius: BorderRadius.circular(12),
                  color: AppTheme.primaryColor.withAlpha(13),
                ),
                child: _photoCount == 0
                    ? const Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.camera_alt, size: 40, color: AppTheme.primaryColor),
                          SizedBox(height: 8),
                          Text('Tap to upload photos', style: TextStyle(color: AppTheme.primaryColor)),
                        ],
                      )
                    : Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.photo_library, size: 40, color: AppTheme.primaryColor),
                          const SizedBox(width: 12),
                          Text('$_photoCount photo(s) selected',
                            style: const TextStyle(fontSize: 16, color: AppTheme.primaryColor, fontWeight: FontWeight.w600)),
                          const SizedBox(width: 12),
                          GestureDetector(
                            onTap: () => setState(() => _photoCount++),
                            child: const CircleAvatar(
                              radius: 16,
                              backgroundColor: AppTheme.primaryColor,
                              child: Icon(Icons.add, color: Colors.white, size: 20),
                            ),
                          ),
                        ],
                      ),
              ),
            ),
            const SizedBox(height: 24),

            // Work Type
            const Text('Work Type', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
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
            const Text('Approximate Area', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
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
            const Text('Soil Type', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            ..._soilTypes.entries.map((e) => RadioListTile<String>(
              value: e.key,
              groupValue: _soilType,
              title: Text(e.value),
              activeColor: AppTheme.primaryColor,
              onChanged: (v) => setState(() => _soilType = v),
            )),
            const SizedBox(height: 24),

            // Submit
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _submitEstimate,
                child: _isLoading
                    ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Text('Get Estimate'),
              ),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Future<void> _submitEstimate() async {
    if (_photoCount == 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please upload at least one photo')));
      return;
    }
    if (_workType == null || _areaSize == null || _soilType == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill in all fields')));
      return;
    }

    setState(() => _isLoading = true);
    try {
      final estimate = await _estimateService.createEstimate(
        workType: _workType!,
        areaSize: _areaSize!,
        soilType: _soilType!,
        photoUrls: ['mock_photo_url'],
        machineCategory: widget.machineCategory,
      );
      if (mounted) {
        Navigator.pushReplacement(context,
          MaterialPageRoute(builder: (_) => EstimateResultScreen(estimate: estimate)));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')));
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }
}
