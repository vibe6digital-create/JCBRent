import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../config/theme.dart';
import '../../models/machine.dart';
import '../booking/create_booking_screen.dart';
import '../estimate/estimate_screen.dart';

class MachineDetailScreen extends StatefulWidget {
  final Machine machine;
  const MachineDetailScreen({super.key, required this.machine});

  @override
  State<MachineDetailScreen> createState() => _MachineDetailScreenState();
}

class _MachineDetailScreenState extends State<MachineDetailScreen> {
  int _currentImageIndex = 0;

  @override
  Widget build(BuildContext context) {
    final m = widget.machine;

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          // Image header
          SliverAppBar(
            expandedHeight: 280,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              background: m.images.isNotEmpty
                  ? PageView.builder(
                      itemCount: m.images.length,
                      onPageChanged: (i) => setState(() => _currentImageIndex = i),
                      itemBuilder: (_, i) => Image.network(m.images[i], fit: BoxFit.cover),
                    )
                  : Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            AppTheme.primaryColor,
                            AppTheme.primaryColor.withAlpha(180),
                          ],
                        ),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const SizedBox(height: 40),
                          Icon(_getCategoryIcon(m.category), size: 80, color: Colors.white.withAlpha(200)),
                          const SizedBox(height: 12),
                          Text(m.category, style: TextStyle(color: Colors.white.withAlpha(180), fontSize: 18)),
                        ],
                      ),
                    ),
            ),
          ),

          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Category + Availability
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppTheme.primaryColor.withAlpha(20),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(m.category,
                          style: const TextStyle(color: AppTheme.primaryColor, fontWeight: FontWeight.w600)),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                        decoration: BoxDecoration(
                          color: m.isAvailable ? AppTheme.successColor.withAlpha(20) : AppTheme.errorColor.withAlpha(20),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              m.isAvailable ? Icons.check_circle : Icons.cancel,
                              size: 14,
                              color: m.isAvailable ? AppTheme.successColor : AppTheme.errorColor,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              m.isAvailable ? 'Available' : 'Unavailable',
                              style: TextStyle(
                                color: m.isAvailable ? AppTheme.successColor : AppTheme.errorColor,
                                fontWeight: FontWeight.w600,
                                fontSize: 13,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  Text(m.model, style: const TextStyle(fontSize: 26, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.store, size: 16, color: Colors.grey),
                      const SizedBox(width: 4),
                      Text('by ${m.vendorName}', style: TextStyle(color: Colors.grey[600], fontSize: 15)),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Rates
                  Row(
                    children: [
                      Expanded(child: _RateCard(label: 'Per Hour', rate: 'Rs ${m.hourlyRate.toInt()}', icon: Icons.access_time)),
                      const SizedBox(width: 12),
                      Expanded(child: _RateCard(label: 'Per Day', rate: 'Rs ${m.dailyRate.toInt()}', icon: Icons.calendar_today)),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Location
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: Colors.blue.withAlpha(10),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.blue.withAlpha(40)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.location_on, color: Colors.blue),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Location', style: TextStyle(color: Colors.blue, fontSize: 12, fontWeight: FontWeight.w600)),
                              Text('${m.location.city}, ${m.location.state}',
                                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500)),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Description
                  if (m.description.isNotEmpty) ...[
                    const Text('About this Machine', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    Text(m.description, style: TextStyle(color: Colors.grey[700], height: 1.6, fontSize: 15)),
                    const SizedBox(height: 20),
                  ],

                  // Service areas
                  if (m.serviceAreas.isNotEmpty) ...[
                    const Text('Service Areas', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: m.serviceAreas.map((a) => Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        decoration: BoxDecoration(
                          color: Colors.grey[100],
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.location_on, size: 14, color: Colors.grey),
                            const SizedBox(width: 4),
                            Text(a, style: const TextStyle(fontWeight: FontWeight.w500)),
                          ],
                        ),
                      )).toList(),
                    ),
                    const SizedBox(height: 20),
                  ],

                  // Smart estimate link
                  OutlinedButton.icon(
                    onPressed: () => Navigator.push(context,
                      MaterialPageRoute(builder: (_) => EstimateScreen(machineCategory: m.category))),
                    icon: const Icon(Icons.auto_awesome, color: AppTheme.accentColor),
                    label: const Text('Get Smart Estimate'),
                    style: OutlinedButton.styleFrom(
                      minimumSize: const Size(double.infinity, 52),
                      side: const BorderSide(color: AppTheme.secondaryColor),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                  const SizedBox(height: 100),
                ],
              ),
            ),
          ),
        ],
      ),
      bottomSheet: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [BoxShadow(color: Colors.black.withAlpha(25), blurRadius: 10, offset: const Offset(0, -2))],
        ),
        child: SafeArea(
          child: Row(
            children: [
              Container(
                decoration: BoxDecoration(
                  border: Border.all(color: AppTheme.primaryColor),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: IconButton(
                  icon: const Icon(Icons.phone, color: AppTheme.primaryColor),
                  onPressed: () => launchUrl(Uri.parse('tel:+919876543210')),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: SizedBox(
                  height: 52,
                  child: ElevatedButton(
                    onPressed: () => Navigator.push(context,
                      MaterialPageRoute(builder: (_) => CreateBookingScreen(machine: m))),
                    style: ElevatedButton.styleFrom(
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text('Book Now', style: TextStyle(fontSize: 18)),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  IconData _getCategoryIcon(String cat) {
    switch (cat) {
      case 'JCB': return Icons.construction;
      case 'Excavator': return Icons.precision_manufacturing;
      case 'Crane': return Icons.height;
      case 'Bulldozer': return Icons.agriculture;
      case 'Roller': return Icons.roller_shades;
      case 'Pokelane': return Icons.engineering;
      default: return Icons.construction;
    }
  }
}

class _RateCard extends StatelessWidget {
  final String label;
  final String rate;
  final IconData icon;
  const _RateCard({required this.label, required this.rate, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.secondaryColor.withAlpha(8),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.secondaryColor.withAlpha(30)),
      ),
      child: Column(
        children: [
          Icon(icon, size: 20, color: AppTheme.secondaryColor),
          const SizedBox(height: 6),
          Text(label, style: TextStyle(color: Colors.grey[600], fontSize: 13)),
          const SizedBox(height: 4),
          Text(rate, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppTheme.secondaryColor)),
        ],
      ),
    );
  }
}
