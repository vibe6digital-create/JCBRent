import 'package:flutter/material.dart';
import '../../config/theme.dart';
import '../../models/machine.dart';
import '../../services/machine_service.dart';
import '../machine/machine_detail_screen.dart';

class SearchScreen extends StatefulWidget {
  final String? initialCategory;
  const SearchScreen({super.key, this.initialCategory});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final _machineService = MachineService();
  final _searchController = TextEditingController();

  List<Machine> _machines = [];
  bool _isLoading = false;
  String? _selectedCategory;
  String _sortBy = 'price_asc';

  final _categories = ['All', 'JCB', 'Excavator', 'Pokelane', 'Crane', 'Bulldozer', 'Roller'];

  @override
  void initState() {
    super.initState();
    _selectedCategory = widget.initialCategory;
    _searchMachines();
  }

  Future<void> _searchMachines() async {
    setState(() => _isLoading = true);
    try {
      _machines = await _machineService.searchMachines(
        city: _searchController.text.isNotEmpty ? _searchController.text : null,
        category: _selectedCategory,
        sortBy: _sortBy,
      );
    } catch (_) {}
    if (mounted) setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: widget.initialCategory != null
          ? AppBar(title: Text('${widget.initialCategory} Machines'))
          : null,
      body: SafeArea(
        child: Column(
        children: [
          // Search bar
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Search by city or machine...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _searchController.clear();
                          _searchMachines();
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
              onSubmitted: (_) => _searchMachines(),
            ),
          ),

          // Category chips
          SizedBox(
            height: 44,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _categories.length,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (_, i) {
                final cat = _categories[i];
                final isSelected = (cat == 'All' && _selectedCategory == null) || cat == _selectedCategory;
                return FilterChip(
                  label: Text(cat, style: TextStyle(
                    color: isSelected ? Colors.white : Colors.grey[700],
                    fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                  )),
                  selected: isSelected,
                  selectedColor: AppTheme.primaryColor,
                  backgroundColor: Colors.white,
                  side: BorderSide(color: isSelected ? AppTheme.primaryColor : Colors.grey[300]!),
                  showCheckmark: false,
                  onSelected: (_) {
                    setState(() => _selectedCategory = cat == 'All' ? null : cat);
                    _searchMachines();
                  },
                );
              },
            ),
          ),
          const SizedBox(height: 8),

          // Sort & count
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('${_machines.length} machines found',
                  style: TextStyle(color: Colors.grey[600], fontWeight: FontWeight.w500)),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.grey[300]!),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: _sortBy,
                      icon: const Icon(Icons.sort, size: 18),
                      style: TextStyle(color: Colors.grey[700], fontSize: 13),
                      items: const [
                        DropdownMenuItem(value: 'price_asc', child: Text('Price: Low to High')),
                        DropdownMenuItem(value: 'price_desc', child: Text('Price: High to Low')),
                      ],
                      onChanged: (v) {
                        setState(() => _sortBy = v!);
                        _searchMachines();
                      },
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),

          // Results
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _machines.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.search_off, size: 64, color: Colors.grey[300]),
                            const SizedBox(height: 16),
                            Text('No machines found', style: TextStyle(fontSize: 18, color: Colors.grey[500])),
                            const SizedBox(height: 8),
                            Text('Try different filters', style: TextStyle(color: Colors.grey[400])),
                          ],
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _machines.length,
                        itemBuilder: (_, i) => _MachineCard(
                          machine: _machines[i],
                          onTap: () => Navigator.push(context,
                            MaterialPageRoute(builder: (_) => MachineDetailScreen(machine: _machines[i]))),
                        ),
                      ),
          ),
        ],
      ),
      ),
    );
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }
}

class _MachineCard extends StatelessWidget {
  final Machine machine;
  final VoidCallback onTap;

  const _MachineCard({required this.machine, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              Container(
                width: 90,
                height: 90,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  color: AppTheme.primaryColor.withAlpha(15),
                ),
                child: machine.images.isNotEmpty
                    ? ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: Image.network(machine.images.first, fit: BoxFit.cover))
                    : Icon(_getCategoryIcon(machine.category), size: 40, color: AppTheme.primaryColor),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppTheme.primaryColor.withAlpha(20),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(machine.category,
                        style: const TextStyle(color: AppTheme.primaryColor, fontWeight: FontWeight.w600, fontSize: 11)),
                    ),
                    const SizedBox(height: 4),
                    Text(machine.model,
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Icon(Icons.location_on, size: 14, color: Colors.grey[500]),
                        const SizedBox(width: 2),
                        Text('${machine.location.city}, ${machine.location.state}',
                          style: TextStyle(color: Colors.grey[600], fontSize: 13)),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        Text('Rs ${machine.hourlyRate.toInt()}/hr',
                          style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.secondaryColor, fontSize: 15)),
                        const SizedBox(width: 12),
                        Text('Rs ${machine.dailyRate.toInt()}/day',
                          style: TextStyle(color: Colors.grey[500], fontSize: 13)),
                      ],
                    ),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right, color: Colors.grey),
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
