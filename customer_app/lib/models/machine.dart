class Machine {
  final String id;
  final String vendorId;
  final String vendorName;
  final String category;
  final String model;
  final String description;
  final double hourlyRate;
  final double dailyRate;
  final List<String> images;
  final MachineLocation location;
  final List<String> serviceAreas;
  final bool isAvailable;
  final String approvalStatus;
  final double? avgRating;
  final int? reviewCount;

  Machine({
    required this.id,
    required this.vendorId,
    required this.vendorName,
    required this.category,
    required this.model,
    required this.description,
    required this.hourlyRate,
    required this.dailyRate,
    required this.images,
    required this.location,
    required this.serviceAreas,
    required this.isAvailable,
    required this.approvalStatus,
    this.avgRating,
    this.reviewCount,
  });

  bool get hasRating => avgRating != null && avgRating! > 0;

  factory Machine.fromJson(Map<String, dynamic> json) {
    return Machine(
      id: json['id'] ?? '',
      vendorId: json['vendorId'] ?? '',
      vendorName: json['vendorName'] ?? '',
      category: json['category'] ?? '',
      model: json['model'] ?? '',
      description: json['description'] ?? '',
      hourlyRate: (json['hourlyRate'] ?? 0).toDouble(),
      dailyRate: (json['dailyRate'] ?? 0).toDouble(),
      images: List<String>.from(json['images'] ?? []),
      location: MachineLocation.fromJson(json['location'] ?? {}),
      serviceAreas: List<String>.from(json['serviceAreas'] ?? []),
      isAvailable: json['isAvailable'] ?? true,
      approvalStatus: json['approvalStatus'] ?? 'pending',
      avgRating: (json['avgRating'] as num?)?.toDouble(),
      reviewCount: json['reviewCount'] as int?,
    );
  }
}

class MachineLocation {
  final String city;
  final String state;
  final double latitude;
  final double longitude;

  MachineLocation({
    required this.city,
    required this.state,
    required this.latitude,
    required this.longitude,
  });

  factory MachineLocation.fromJson(Map<String, dynamic> json) {
    return MachineLocation(
      city: json['city'] ?? '',
      state: json['state'] ?? '',
      latitude: (json['latitude'] ?? 0).toDouble(),
      longitude: (json['longitude'] ?? 0).toDouble(),
    );
  }
}
