import 'package:flutter/material.dart';
import '../../config/theme.dart';
import '../../models/estimate.dart';
import '../../services/estimate_service.dart';
import '../search/search_screen.dart';

class MyEstimatesScreen extends StatefulWidget {
  const MyEstimatesScreen({super.key});

  @override
  State<MyEstimatesScreen> createState() => _MyEstimatesScreenState();
}

class _MyEstimatesScreenState extends State<MyEstimatesScreen> {
  final _estimateService = EstimateService();
  List<Estimate> _estimates = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadEstimates();
  }

  Future<void> _loadEstimates() async {
    try {
      _estimates = await _estimateService.getMyEstimates();
    } catch (_) {}
    if (mounted) setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Estimates')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _estimates.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.auto_awesome, size: 64, color: Colors.grey[300]),
                      const SizedBox(height: 16),
                      Text('No estimates yet', style: TextStyle(fontSize: 18, color: Colors.grey[500])),
                      const SizedBox(height: 8),
                      Text('Use Smart Estimate to get cost predictions', style: TextStyle(color: Colors.grey[400])),
                    ],
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _estimates.length,
                  itemBuilder: (_, i) => _EstimateCard(
                    estimate: _estimates[i],
                    onBook: () => Navigator.push(context,
                      MaterialPageRoute(builder: (_) => SearchScreen(initialCategory: _estimates[i].machineCategory))),
                  ),
                ),
    );
  }
}

class _EstimateCard extends StatelessWidget {
  final Estimate estimate;
  final VoidCallback onBook;
  const _EstimateCard({required this.estimate, required this.onBook});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 44, height: 44,
                  decoration: BoxDecoration(
                    color: AppTheme.accentColor.withAlpha(25),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.auto_awesome, color: AppTheme.accentColor),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(estimate.workTypeLabel, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                      Text('${estimate.areaSize.toUpperCase()} area | ${estimate.soilType} soil',
                        style: TextStyle(color: Colors.grey[600], fontSize: 13)),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            const Divider(height: 1),
            const SizedBox(height: 14),
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Time Estimate', style: TextStyle(color: Colors.grey[500], fontSize: 12)),
                      const SizedBox(height: 2),
                      Text('${estimate.estimatedTimeHoursMin} - ${estimate.estimatedTimeHoursMax} hrs',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                    ],
                  ),
                ),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Cost Range', style: TextStyle(color: Colors.grey[500], fontSize: 12)),
                      const SizedBox(height: 2),
                      Text('Rs ${estimate.estimatedCostMin.toInt()} - ${estimate.estimatedCostMax.toInt()}',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: AppTheme.secondaryColor)),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: onBook,
                icon: const Icon(Icons.search, size: 18),
                label: Text('Book ${estimate.machineCategory ?? "Machine"}'),
                style: OutlinedButton.styleFrom(
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
