import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../config/theme.dart';
import '../../models/machine.dart';
import '../../services/machine_service.dart';
import '../machine/machine_detail_screen.dart';

class SearchScreen extends StatefulWidget {
  final String? initialCategory;
  final String? initialCity;
  const SearchScreen({super.key, this.initialCategory, this.initialCity});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final _machineService = MachineService();
  final _searchController = TextEditingController();

  List<Machine> _allMachines = []; // raw API results
  List<Machine> _machines = [];   // after price filter applied
  bool _isLoading = false;
  String? _selectedCategory;
  String _sortBy = 'price_asc';

  // Price range filter (hourly rate)
  double? _minPrice;
  double? _maxPrice;

  List<String> _categories = ['All'];

  bool get _hasPriceFilter => _minPrice != null || _maxPrice != null;

  @override
  void initState() {
    super.initState();
    _selectedCategory = widget.initialCategory;
    if (widget.initialCity != null) {
      _searchController.text = widget.initialCity!;
    }
    _loadCategories();
    _searchMachines();
  }

  Future<void> _loadCategories() async {
    try {
      final cats = await _machineService.getCategories();
      if (mounted) setState(() => _categories = ['All', ...cats]);
    } catch (_) {}
  }

  Future<void> _searchMachines() async {
    setState(() => _isLoading = true);
    try {
      _allMachines = await _machineService.searchMachines(
        city: _searchController.text.isNotEmpty ? _searchController.text : null,
        category: _selectedCategory,
        sortBy: _sortBy,
      );
      _applyPriceFilter();
    } catch (_) {}
    if (mounted) setState(() => _isLoading = false);
  }

  void _applyPriceFilter() {
    setState(() {
      _machines = _allMachines.where((m) {
        if (_minPrice != null && m.hourlyRate < _minPrice!) return false;
        if (_maxPrice != null && m.hourlyRate > _maxPrice!) return false;
        return true;
      }).toList();
    });
  }

  void _showPriceFilterSheet() {
    final minController = TextEditingController(
        text: _minPrice != null ? _minPrice!.toInt().toString() : '');
    final maxController = TextEditingController(
        text: _maxPrice != null ? _maxPrice!.toInt().toString() : '');

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(
          left: 24, right: 24, top: 24,
          bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Handle bar
            Center(
              child: Container(
                width: 40, height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey[300],
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Price Range (₹/hr)',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                if (_hasPriceFilter)
                  TextButton(
                    onPressed: () {
                      setState(() { _minPrice = null; _maxPrice = null; });
                      _applyPriceFilter();
                      Navigator.pop(ctx);
                    },
                    child: const Text('Clear', style: TextStyle(color: Colors.red)),
                  ),
              ],
            ),
            const SizedBox(height: 6),
            Text('Filter by hourly rate',
                style: TextStyle(color: Colors.grey[600], fontSize: 13)),
            const SizedBox(height: 20),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: minController,
                    keyboardType: TextInputType.number,
                    inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                    decoration: InputDecoration(
                      labelText: 'Min Price',
                      prefixText: '₹ ',
                      hintText: 'e.g. 500',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: const BorderSide(color: AppTheme.primaryColor),
                      ),
                    ),
                  ),
                ),
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 12),
                  child: Text('to', style: TextStyle(color: Colors.grey, fontWeight: FontWeight.w600)),
                ),
                Expanded(
                  child: TextField(
                    controller: maxController,
                    keyboardType: TextInputType.number,
                    inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                    decoration: InputDecoration(
                      labelText: 'Max Price',
                      prefixText: '₹ ',
                      hintText: 'e.g. 3000',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: const BorderSide(color: AppTheme.primaryColor),
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: () {
                  final min = double.tryParse(minController.text);
                  final max = double.tryParse(maxController.text);
                  setState(() {
                    _minPrice = min;
                    _maxPrice = max;
                  });
                  _applyPriceFilter();
                  Navigator.pop(ctx);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryColor,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text('Apply Filter',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
              ),
            ),
          ],
        ),
      ),
    );
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
                  final isSelected = (cat == 'All' && _selectedCategory == null) ||
                      cat == _selectedCategory;
                  return FilterChip(
                    label: Text(cat,
                        style: TextStyle(
                          color: isSelected ? Colors.white : Colors.grey[700],
                          fontWeight:
                              isSelected ? FontWeight.w600 : FontWeight.normal,
                        )),
                    selected: isSelected,
                    selectedColor: AppTheme.primaryColor,
                    backgroundColor: Colors.white,
                    side: BorderSide(
                        color: isSelected
                            ? AppTheme.primaryColor
                            : Colors.grey[300]!),
                    showCheckmark: false,
                    onSelected: (_) {
                      setState(() =>
                          _selectedCategory = cat == 'All' ? null : cat);
                      _searchMachines();
                    },
                  );
                },
              ),
            ),
            const SizedBox(height: 8),

            // Sort row + Filter button + active price badge
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: [
                  // Result count
                  Expanded(
                    child: Text(
                      '${_machines.length} machine${_machines.length == 1 ? '' : 's'} found',
                      style: TextStyle(
                          color: Colors.grey[600], fontWeight: FontWeight.w500),
                    ),
                  ),

                  // Active price filter badge
                  if (_hasPriceFilter) ...[
                    GestureDetector(
                      onTap: _showPriceFilterSheet,
                      child: Container(
                        margin: const EdgeInsets.only(right: 8),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: AppTheme.primaryColor.withAlpha(20),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: AppTheme.primaryColor),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              _minPrice != null && _maxPrice != null
                                  ? '₹${_minPrice!.toInt()}–₹${_maxPrice!.toInt()}/hr'
                                  : _minPrice != null
                                      ? '≥₹${_minPrice!.toInt()}/hr'
                                      : '≤₹${_maxPrice!.toInt()}/hr',
                              style: const TextStyle(
                                  fontSize: 12,
                                  color: AppTheme.primaryColor,
                                  fontWeight: FontWeight.w600),
                            ),
                            const SizedBox(width: 4),
                            GestureDetector(
                              onTap: () {
                                setState(() {
                                  _minPrice = null;
                                  _maxPrice = null;
                                });
                                _applyPriceFilter();
                              },
                              child: const Icon(Icons.close,
                                  size: 14, color: AppTheme.primaryColor),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],

                  // Price filter button
                  GestureDetector(
                    onTap: _showPriceFilterSheet,
                    child: Container(
                      margin: const EdgeInsets.only(right: 8),
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: _hasPriceFilter
                            ? AppTheme.primaryColor
                            : Colors.white,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: _hasPriceFilter
                              ? AppTheme.primaryColor
                              : Colors.grey[300]!,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.tune_rounded,
                            size: 15,
                            color: _hasPriceFilter
                                ? Colors.white
                                : Colors.grey[600],
                          ),
                          const SizedBox(width: 4),
                          Text(
                            'Price',
                            style: TextStyle(
                              fontSize: 13,
                              color: _hasPriceFilter
                                  ? Colors.white
                                  : Colors.grey[700],
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  // Sort dropdown
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
                        style: TextStyle(
                            color: Colors.grey[700], fontSize: 13),
                        items: const [
                          DropdownMenuItem(
                              value: 'price_asc',
                              child: Text('Low to High')),
                          DropdownMenuItem(
                              value: 'price_desc',
                              child: Text('High to Low')),
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
                              Icon(Icons.search_off,
                                  size: 64, color: Colors.grey[300]),
                              const SizedBox(height: 16),
                              Text('No machines found',
                                  style: TextStyle(
                                      fontSize: 18,
                                      color: Colors.grey[500])),
                              const SizedBox(height: 8),
                              Text(
                                _hasPriceFilter
                                    ? 'No machines match the price range'
                                    : 'Try different filters',
                                style:
                                    TextStyle(color: Colors.grey[400]),
                              ),
                              if (_hasPriceFilter) ...[
                                const SizedBox(height: 16),
                                OutlinedButton.icon(
                                  onPressed: () {
                                    setState(() {
                                      _minPrice = null;
                                      _maxPrice = null;
                                    });
                                    _applyPriceFilter();
                                  },
                                  icon: const Icon(Icons.clear, size: 16),
                                  label: const Text('Clear Price Filter'),
                                  style: OutlinedButton.styleFrom(
                                    foregroundColor: AppTheme.primaryColor,
                                    side: const BorderSide(
                                        color: AppTheme.primaryColor),
                                  ),
                                ),
                              ],
                            ],
                          ),
                        )
                      : ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: _machines.length,
                          itemBuilder: (_, i) => _MachineCard(
                            machine: _machines[i],
                            onTap: () => Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => MachineDetailScreen(
                                    machine: _machines[i]),
                              ),
                            ),
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
                        child: Image.network(
                          machine.images.first,
                          fit: BoxFit.cover,
                          loadingBuilder: (_, child, progress) {
                            if (progress == null) return child;
                            return Container(
                              color: AppTheme.primaryColor.withAlpha(10),
                              child: const Center(
                                child: SizedBox(
                                    width: 24,
                                    height: 24,
                                    child: CircularProgressIndicator(
                                        strokeWidth: 2)),
                              ),
                            );
                          },
                          errorBuilder: (_, __, ___) => Container(
                            color: AppTheme.primaryColor.withAlpha(15),
                            child: Icon(_getCategoryIcon(machine.category),
                                size: 40, color: AppTheme.primaryColor),
                          ),
                        ))
                    : Icon(_getCategoryIcon(machine.category),
                        size: 40, color: AppTheme.primaryColor),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppTheme.primaryColor.withAlpha(20),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(machine.category,
                          style: const TextStyle(
                              color: AppTheme.primaryColor,
                              fontWeight: FontWeight.w600,
                              fontSize: 11)),
                    ),
                    const SizedBox(height: 4),
                    Text(machine.model,
                        style: const TextStyle(
                            fontSize: 16, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Icon(Icons.location_on,
                            size: 14, color: Colors.grey[500]),
                        const SizedBox(width: 2),
                        Text(
                            '${machine.location.city}, ${machine.location.state}',
                            style: TextStyle(
                                color: Colors.grey[600], fontSize: 13)),
                      ],
                    ),
                    const SizedBox(height: 5),
                    if (machine.hasRating)
                      Row(
                        children: [
                          ...List.generate(5, (i) {
                            final filled = i < machine.avgRating!.round();
                            return Icon(
                              filled ? Icons.star_rounded : Icons.star_border_rounded,
                              size: 13,
                              color: const Color(0xFFFF8C00),
                            );
                          }),
                          const SizedBox(width: 4),
                          Text(
                            '${machine.avgRating!.toStringAsFixed(1)}',
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: Color(0xFFFF8C00),
                            ),
                          ),
                          const SizedBox(width: 3),
                          Text(
                            '(${machine.reviewCount ?? 0})',
                            style: TextStyle(fontSize: 11, color: Colors.grey[500]),
                          ),
                        ],
                      )
                    else
                      Text('No reviews yet',
                          style: TextStyle(fontSize: 11, color: Colors.grey[400])),
                    const SizedBox(height: 5),
                    Row(
                      children: [
                        Text('₹${machine.hourlyRate.toInt()}/hr',
                            style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                color: AppTheme.secondaryColor,
                                fontSize: 15)),
                        const SizedBox(width: 12),
                        Text('₹${machine.dailyRate.toInt()}/day',
                            style: TextStyle(
                                color: Colors.grey[500], fontSize: 13)),
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
