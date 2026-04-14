class Estimate {
  final String id;
  final String customerId;
  final List<String> photoUrls;
  final String workType;
  final String areaSize;
  final String soilType;
  final String? machineCategory;
  final int estimatedTimeHoursMin;
  final int estimatedTimeHoursMax;
  final double estimatedCostMin;
  final double estimatedCostMax;
  final String disclaimer;

  Estimate({
    required this.id,
    required this.customerId,
    required this.photoUrls,
    required this.workType,
    required this.areaSize,
    required this.soilType,
    this.machineCategory,
    required this.estimatedTimeHoursMin,
    required this.estimatedTimeHoursMax,
    required this.estimatedCostMin,
    required this.estimatedCostMax,
    required this.disclaimer,
  });

  factory Estimate.fromJson(Map<String, dynamic> json) {
    return Estimate(
      id: json['id'] ?? '',
      customerId: json['customerId'] ?? '',
      photoUrls: List<String>.from(json['photoUrls'] ?? []),
      workType: json['workType'] ?? '',
      areaSize: json['areaSize'] ?? '',
      soilType: json['soilType'] ?? '',
      machineCategory: json['machineCategory'],
      estimatedTimeHoursMin: json['estimatedTimeHoursMin'] ?? 0,
      estimatedTimeHoursMax: json['estimatedTimeHoursMax'] ?? 0,
      estimatedCostMin: (json['estimatedCostMin'] ?? 0).toDouble(),
      estimatedCostMax: (json['estimatedCostMax'] ?? 0).toDouble(),
      disclaimer: json['disclaimer'] ?? '',
    );
  }

  String get workTypeLabel {
    const labels = {
      'excavation': 'Excavation',
      'leveling': 'Leveling',
      'trenching': 'Trenching',
      'foundation': 'Foundation',
      'debris_removal': 'Debris Removal',
    };
    return labels[workType] ?? workType;
  }
}
