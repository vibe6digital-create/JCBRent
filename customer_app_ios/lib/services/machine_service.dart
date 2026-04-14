import '../models/machine.dart';
import 'api_service.dart';

class MachineService {
  final ApiService _api = ApiService();

  Future<List<Machine>> searchMachines({
    String? city,
    String? category,
    String? sortBy,
  }) async {
    final params = <String, String>{};
    if (city != null && city.isNotEmpty) params['city'] = city;
    if (category != null && category.isNotEmpty) params['category'] = category;
    if (sortBy != null) params['sortBy'] = sortBy;

    final response = await _api.get('/machines', queryParams: params);
    final List machines = response['machines'] ?? response['data'] ?? [];
    return machines.map((m) => Machine.fromJson(m)).toList();
  }

  Future<Machine> getMachineById(String id) async {
    final response = await _api.get('/machines/$id');
    return Machine.fromJson(response['machine'] ?? response);
  }

  Future<List<String>> getCategories() async {
    final response = await _api.get('/machines/meta/categories');
    final List cats = response['categories'] ?? [];
    return cats
        .where((c) => c['isActive'] != false)
        .map<String>((c) => c['name'] as String)
        .toList();
  }

  Future<List<String>> getServiceAreas() async {
    final response = await _api.get('/machines/meta/service-areas');
    final List areas = response['serviceAreas'] ?? [];
    return areas
        .where((a) => a['isActive'] != false)
        .map<String>((a) => a['city'] as String)
        .toList();
  }
}
