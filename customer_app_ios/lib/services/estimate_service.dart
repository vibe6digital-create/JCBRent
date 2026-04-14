import '../models/estimate.dart';
import 'api_service.dart';

class EstimateService {
  final ApiService _api = ApiService();

  Future<Estimate> createEstimate({
    required String workType,
    required String areaSize,
    required String soilType,
    required List<String> photoUrls,
    String? machineCategory,
  }) async {
    final response = await _api.post('/estimates', body: {
      'workType': workType,
      'areaSize': areaSize,
      'soilType': soilType,
      'photoUrls': photoUrls,
      if (machineCategory != null) 'machineCategory': machineCategory,
    });
    return Estimate.fromJson(response['estimate'] ?? response);
  }

  Future<List<Estimate>> getMyEstimates() async {
    final response = await _api.get('/estimates/customer/my-estimates');
    final List estimates = response['estimates'] ?? response['data'] ?? [];
    return estimates.map((e) => Estimate.fromJson(e)).toList();
  }

  Future<Estimate> getEstimateById(String id) async {
    final response = await _api.get('/estimates/$id');
    return Estimate.fromJson(response['estimate'] ?? response);
  }
}
