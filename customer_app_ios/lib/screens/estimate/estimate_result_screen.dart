import 'package:flutter/material.dart';
import '../../config/theme.dart';
import '../../models/estimate.dart';
import '../search/search_screen.dart';

class EstimateResultScreen extends StatelessWidget {
  final Estimate estimate;
  const EstimateResultScreen({super.key, required this.estimate});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Smart Estimate')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            const Icon(Icons.auto_awesome, size: 64, color: AppTheme.accentColor),
            const SizedBox(height: 16),
            const Text('Your Estimate is Ready!',
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 24),

            // Time estimate
            _EstimateCard(
              icon: Icons.access_time,
              label: 'Estimated Machine Time',
              value: '${estimate.estimatedTimeHoursMin} - ${estimate.estimatedTimeHoursMax} hours',
            ),
            const SizedBox(height: 12),

            // Cost estimate
            _EstimateCard(
              icon: Icons.currency_rupee,
              label: 'Estimated Cost Range',
              value: 'Rs ${estimate.estimatedCostMin.toInt()} - Rs ${estimate.estimatedCostMax.toInt()}',
            ),
            const SizedBox(height: 12),

            // Details
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    _DetailRow(label: 'Work Type', value: estimate.workTypeLabel),
                    _DetailRow(label: 'Area Size', value: estimate.areaSize.toUpperCase()),
                    _DetailRow(label: 'Soil Type', value: estimate.soilType),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Disclaimer
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.amber.withAlpha(25),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.amber),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.info_outline, color: Colors.amber, size: 20),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(estimate.disclaimer,
                      style: TextStyle(color: Colors.grey[700], fontSize: 13)),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // CTA
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pushReplacement(context, MaterialPageRoute(
                    builder: (_) => SearchScreen(initialCategory: estimate.machineCategory),
                  ));
                },
                child: const Text('Book Machine Now'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _EstimateCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  const _EstimateCard({required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Row(
          children: [
            Icon(icon, size: 40, color: AppTheme.primaryColor),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label, style: TextStyle(color: Colors.grey[600])),
                  const SizedBox(height: 4),
                  Text(value, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
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
  final String label;
  final String value;
  const _DetailRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(color: Colors.grey[600])),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}
