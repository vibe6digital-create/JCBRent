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

  /// Uploads a single compliance document (RC, fitness, insurance) for a
  /// machine listing. Files live under machines/{uid}/documents/ so the
  /// existing storage rule covers them.
  Future<String> uploadMachineDocument(XFile image, {required String kind}) async {
    final uid = FirebaseAuth.instance.currentUser?.uid;
    if (uid == null) throw Exception('Not signed in');
    final ref = FirebaseStorage.instance
        .ref()
        .child('machines/$uid/documents/${kind}_${DateTime.now().millisecondsSinceEpoch}.jpg');
    await ref.putFile(File(image.path));
    return await ref.getDownloadURL();
  }

  Future<Machine> createMachine({
    required String category,
    required String model,
    required String description,
    required double hourlyRate,
    required double dailyRate,
    required double weeklyRate,
    required int yearOfManufacture,
    required String rcUrl,
    required String fitnessUrl,
    required String insuranceUrl,
    required String city,
    required String state,
    required List<String> serviceAreas,
    List<String> imageUrls = const [],
    double? monthlyRate,
    double? sixMonthRate,
    double? yearlyRate,
  }) async {
    final response = await _api.post('/machines', body: {
      'category': category,
      'model': model,
      'description': description,
      'hourlyRate': hourlyRate,
      'dailyRate': dailyRate,
      'weeklyRate': weeklyRate,
      'yearOfManufacture': yearOfManufacture,
      'rcUrl': rcUrl,
      'fitnessUrl': fitnessUrl,
      'insuranceUrl': insuranceUrl,
      'location': {'city': city, 'state': state, 'latitude': 0, 'longitude': 0},
      'serviceAreas': serviceAreas,
      if (imageUrls.isNotEmpty) 'images': imageUrls,
      if (monthlyRate != null) 'monthlyRate': monthlyRate,
      if (sixMonthRate != null) 'sixMonthRate': sixMonthRate,
      if (yearlyRate != null) 'yearlyRate': yearlyRate,
    });
    return Machine.fromJson(response['machine'] ?? response);
  }

  Future<void> updateMachine(String id, {
    String? model,
    String? description,
    double? hourlyRate,
    double? dailyRate,
    List<String>? serviceAreas,
  }) async {
    await _api.put('/machines/$id', body: {
      if (model != null) 'model': model,
      if (description != null) 'description': description,
      if (hourlyRate != null) 'hourlyRate': hourlyRate,
      if (dailyRate != null) 'dailyRate': dailyRate,
      if (serviceAreas != null) 'serviceAreas': serviceAreas,
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

  /// Fetches active models for a given machine category.
  /// Returns an empty list if no models are configured yet.
  Future<List<String>> getModels(String category) async {
    final encoded = Uri.encodeQueryComponent(category);
    final response = await _api.get('/machines/meta/models?category=$encoded');
    final List models = response['models'] ?? [];
    return models.map<String>((m) => m['name'] as String).toList();
  }

  /// Given a lat/lng, returns the nearest known Indian city.
  /// Returns null if the server has no match or the request fails.
  Future<String?> getNearestCity(double lat, double lng) async {
    try {
      final response = await _api.get('/machines/meta/nearest-city?lat=$lat&lng=$lng');
      final nearest = response['nearest'];
      if (nearest is Map && nearest['city'] is String) return nearest['city'] as String;
      return null;
    } catch (_) {
      return null;
    }
  }
}
