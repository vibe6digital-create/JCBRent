import 'package:flutter/material.dart';
import '../../config/theme.dart';
import '../../services/machine_service.dart';
import '../../models/machine.dart';
import 'add_edit_machine_screen.dart';

class MachinesListScreen extends StatefulWidget {
  const MachinesListScreen({super.key});

  @override
  State<MachinesListScreen> createState() => _MachinesListScreenState();
}

class _MachinesListScreenState extends State<MachinesListScreen> {
  final _service = MachineService();
  List<Machine> _machines = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadMachines();
  }

  Future<void> _loadMachines() async {
    final machines = await _service.getMyMachines();
    if (mounted) setState(() { _machines = machines; _isLoading = false; });
  }

  IconData _categoryIcon(String category) {
    switch (category.toLowerCase()) {
      case 'jcb': return Icons.front_loader;
      case 'excavator': return Icons.precision_manufacturing_rounded;
      case 'crane': return Icons.cell_tower_rounded;
      case 'bulldozer': return Icons.agriculture_rounded;
      case 'roller': return Icons.donut_large_rounded;
      case 'pokelane': return Icons.front_loader;
      default: return Icons.construction_rounded;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      appBar: AppBar(
        title: Text(_isLoading ? 'My Machines' : 'My Machines (${_machines.length})'),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 12),
            decoration: BoxDecoration(
              color: AppTheme.accentColor.withAlpha(20),
              borderRadius: BorderRadius.circular(12),
            ),
            child: IconButton(
              icon: const Icon(Icons.add_rounded, color: AppTheme.accentColor),
              onPressed: () async {
                final result = await Navigator.push(context,
                  MaterialPageRoute(builder: (_) => const AddEditMachineScreen()));
                if (result == true) _loadMachines();
              },
            ),
          ),
        ],
      ),
      body: _isLoading
        ? const Center(child: CircularProgressIndicator(color: AppTheme.accentColor))
        : RefreshIndicator(
            color: AppTheme.accentColor,
            onRefresh: _loadMachines,
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _machines.length,
              itemBuilder: (context, index) {
                final m = _machines[index];
                return _MachineCard(
                  machine: m,
                  icon: _categoryIcon(m.category),
                  onToggle: (val) async {
                    await _service.toggleAvailability(m.id, val);
                    _loadMachines();
                  },
                  onDelete: () => _confirmDelete(m),
                );
              },
            ),
          ),
    );
  }

  void _confirmDelete(Machine m) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Delete Machine', style: TextStyle(fontWeight: FontWeight.w700)),
        content: Text('Are you sure you want to delete ${m.model}?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel', style: TextStyle(color: AppTheme.textSecondary)),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(ctx);
              await _service.deleteMachine(m.id);
              _loadMachines();
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                  content: Text('${m.model} deleted'),
                  backgroundColor: AppTheme.errorColor,
                  behavior: SnackBarBehavior.floating,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ));
              }
            },
            child: const Text('Delete', style: TextStyle(color: AppTheme.errorColor, fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
  }
}

class _MachineCard extends StatelessWidget {
  final Machine machine;
  final IconData icon;
  final ValueChanged<bool> onToggle;
  final VoidCallback onDelete;

  const _MachineCard({required this.machine, required this.icon, required this.onToggle, required this.onDelete});

  Color get _statusColor {
    switch (machine.approvalStatus) {
      case 'approved': return AppTheme.successColor;
      case 'rejected': return AppTheme.errorColor;
      default: return AppTheme.warningColor;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [AppTheme.softShadow],
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 56, height: 56,
                  decoration: BoxDecoration(
                    color: AppTheme.accentColor.withAlpha(20),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Icon(icon, color: AppTheme.accentColor, size: 28),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(machine.model,
                              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: _statusColor.withAlpha(20),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(machine.statusLabel,
                              style: TextStyle(color: _statusColor, fontSize: 11, fontWeight: FontWeight.w700)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(machine.category,
                        style: const TextStyle(color: AppTheme.accentColor, fontSize: 13, fontWeight: FontWeight.w600)),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          const Icon(Icons.location_on_rounded, size: 14, color: AppTheme.textLight),
                          const SizedBox(width: 4),
                          Text('${machine.location.city}, ${machine.location.state}',
                            style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          _RateBadge(label: '₹${machine.hourlyRate.toInt()}/hr'),
                          const SizedBox(width: 8),
                          _RateBadge(label: '₹${machine.dailyRate.toInt()}/day'),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          if (machine.serviceAreas.isNotEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Wrap(
                spacing: 6,
                runSpacing: 6,
                children: machine.serviceAreas.map((area) => Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppTheme.backgroundColor,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(area, style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary, fontWeight: FontWeight.w500)),
                )).toList(),
              ),
            ),
          const Divider(height: 24, indent: 16, endIndent: 16),
          Padding(
            padding: const EdgeInsets.only(left: 16, right: 8, bottom: 12),
            child: Row(
              children: [
                Icon(Icons.circle, size: 10, color: machine.isAvailable ? AppTheme.successColor : AppTheme.textLight),
                const SizedBox(width: 6),
                Text(machine.isAvailable ? 'Available' : 'Unavailable',
                  style: TextStyle(
                    color: machine.isAvailable ? AppTheme.successColor : AppTheme.textLight,
                    fontWeight: FontWeight.w600, fontSize: 13)),
                const Spacer(),
                Switch(
                  value: machine.isAvailable,
                  onChanged: onToggle,
                  activeColor: AppTheme.successColor,
                ),
                IconButton(
                  icon: const Icon(Icons.delete_outline_rounded, color: AppTheme.errorColor, size: 22),
                  onPressed: onDelete,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _RateBadge extends StatelessWidget {
  final String label;
  const _RateBadge({required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: AppTheme.accentColor.withAlpha(12),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(label, style: const TextStyle(color: AppTheme.accentColor, fontWeight: FontWeight.w700, fontSize: 12)),
    );
  }
}
