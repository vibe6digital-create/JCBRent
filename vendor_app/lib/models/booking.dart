class Booking {
  final String id;
  final String customerId;
  final String customerName;
  final String customerPhone;
  final String vendorId;
  final String vendorName;
  final String machineId;
  final String machineCategory;
  final String machineModel;
  final DateTime startDate;
  final DateTime endDate;
  final String rateType;
  final double rate;
  final double estimatedCost;
  final String workAddress;
  final String status;
  final String? notes;
  final double? rating;
  final String? review;

  Booking({
    required this.id,
    required this.customerId,
    required this.customerName,
    required this.customerPhone,
    required this.vendorId,
    required this.vendorName,
    required this.machineId,
    required this.machineCategory,
    required this.machineModel,
    required this.startDate,
    required this.endDate,
    required this.rateType,
    required this.rate,
    required this.estimatedCost,
    required this.workAddress,
    required this.status,
    this.notes,
    this.rating,
    this.review,
  });

  factory Booking.fromJson(Map<String, dynamic> json) {
    return Booking(
      id: json['id'] ?? '',
      customerId: json['customerId'] ?? '',
      customerName: json['customerName'] ?? '',
      customerPhone: json['customerPhone'] ?? '',
      vendorId: json['vendorId'] ?? '',
      vendorName: json['vendorName'] ?? '',
      machineId: json['machineId'] ?? '',
      machineCategory: json['machineCategory'] ?? '',
      machineModel: json['machineModel'] ?? '',
      startDate: DateTime.tryParse(json['startDate'] ?? '') ?? DateTime.now(),
      endDate: DateTime.tryParse(json['endDate'] ?? '') ?? DateTime.now(),
      rateType: json['rateType'] ?? 'hourly',
      rate: (json['rate'] ?? 0).toDouble(),
      estimatedCost: (json['estimatedCost'] ?? 0).toDouble(),
      workAddress: json['workAddress'] ?? '',
      status: json['status'] ?? 'pending',
      notes: json['notes'],
      rating: json['rating']?.toDouble(),
      review: json['review'],
    );
  }

  Booking copyWith({
    String? status,
    double? rating,
    String? review,
  }) {
    return Booking(
      id: id,
      customerId: customerId,
      customerName: customerName,
      customerPhone: customerPhone,
      vendorId: vendorId,
      vendorName: vendorName,
      machineId: machineId,
      machineCategory: machineCategory,
      machineModel: machineModel,
      startDate: startDate,
      endDate: endDate,
      rateType: rateType,
      rate: rate,
      estimatedCost: estimatedCost,
      workAddress: workAddress,
      status: status ?? this.status,
      notes: notes,
      rating: rating ?? this.rating,
      review: review ?? this.review,
    );
  }

  bool get isPending => status == 'pending';
  bool get isAccepted => status == 'accepted';
  bool get isArrived => status == 'arrived';
  bool get isInProgress => status == 'in_progress';
  bool get isCompleted => status == 'completed';
  bool get isRejected => status == 'rejected';

  String get statusLabel {
    switch (status) {
      case 'pending': return 'Pending';
      case 'accepted': return 'Accepted';
      case 'arrived': return 'Arrived';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  }
}
