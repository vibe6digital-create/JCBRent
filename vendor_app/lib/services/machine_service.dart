import 'dart:io';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:image_picker/image_picker.dart';
import '../models/machine.dart';
import 'api_service.dart';

class MachineService {
  final ApiService _api = ApiService();

  Future<List<Machine>> getMyMachines() async {
    final response = await _api.get('/machines/vendor/my-machines');
    final List machines = response['machines'] ?? response['data'] ?? [];
    return machines.map((m) => Machine.fromJson(m)).toList();
  }

  Future<Machine?> getMachineById(String id) async {
    try {
      final response = await _api.get('/machines/$id');
      return Machine.fromJson(response['machine'] ?? response);
    } catch (_) {
      return null;
    }
  }

  /// Uploads photos to Firebase Storage and returns download URLs
  Future<List<String>> uploadMachinePhotos(List<XFile> photos) async {
    final uid = FirebaseAuth.instance.currentUser?.uid;
    if (uid == null || photos.isEmpty) return [];

    final storage = FirebaseStorage.instance;
    final urls = <String>[];

    for (final photo in photos) {
      final fileName = '${DateTime.now().millisecondsSinceEpoch}_${photos.indexOf(photo)}.jpg';
      final ref = storage.ref().child('machines/$uid/$fileName');
      await ref.putFile(File(photo.path));
      final url = await ref.getDownloadURL();
      urls.add(url);
    }
    return urls;
  }

  Future<Machine> createMachine({
    required String category,
    required String model,
    required String description,
    required double hourlyRate,
    required double dailyRate,
    required String city,
    required String state,
    required List<String> serviceAreas,
    List<String> imageUrls = const [],
    int? machineYear,
  }) async {
    final response = await _api.post('/machines', body: {
      'category': category,
      'model': model,
      'description': description,
      'hourlyRate': hourlyRate,
      'dailyRate': dailyRate,
      'location': {'city': city, 'state': state, 'latitude': 0, 'longitude': 0},
      'serviceAreas': serviceAreas,
      if (imageUrls.isNotEmpty) 'images': imageUrls,
      if (machineYear != null) 'machineYear': machineYear,
    });
    return Machine.fromJson(response['machine'] ?? response);
  }

  Future<void> updateMachine(String id, {
    String? model,
    String? description,
    double? hourlyRate,
    double? dailyRate,
    List<String>? serviceAreas,
    int? machineYear,
  }) async {
    await _api.put('/machines/$id', body: {
      if (model != null) 'model': model,
      if (description != null) 'description': description,
      if (hourlyRate != null) 'hourlyRate': hourlyRate,
      if (dailyRate != null) 'dailyRate': dailyRate,
      if (serviceAreas != null) 'serviceAreas': serviceAreas,
      if (machineYear != null) 'machineYear': machineYear,
    });
  }

  Future<void> deleteMachine(String id) async {
    await _api.delete('/machines/$id');
  }

  Future<void> toggleAvailability(String id, bool isAvailable) async {
    await _api.patch('/machines/$id/availability', body: {'isAvailable': isAvailable});
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
