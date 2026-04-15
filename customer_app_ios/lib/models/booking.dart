class Booking {
  final String id;
  final String customerId;
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
  final String status; // pending, accepted, arrived, in_progress, completed, rejected
  final String? notes;
  final String? workAddress;
  final double? workLat;
  final double? workLng;
  final double? vehicleLat;
  final double? vehicleLng;
  final double? vendorLat;
  final double? vendorLng;
  final double? rating;
  final String? review;
  final String? startOtp;
  final bool isOtpVerified;
  final String? cancellationReason;
  final String? cancelledBy;
  final String? customerName;
  final String? customerPhone;
  final String? couponCode;
  final double? discountAmount;

  Booking({
    required this.id,
    required this.customerId,
    required this.vendorId,
    this.vendorName = '',
    required this.machineId,
    required this.machineCategory,
    required this.machineModel,
    required this.startDate,
    required this.endDate,
    required this.rateType,
    required this.rate,
    required this.estimatedCost,
    required this.status,
    this.notes,
    this.workAddress,
    this.workLat,
    this.workLng,
    this.vehicleLat,
    this.vehicleLng,
    this.vendorLat,
    this.vendorLng,
    this.rating,
    this.review,
    this.startOtp,
    this.isOtpVerified = false,
    this.cancellationReason,
    this.cancelledBy,
    this.customerName,
    this.customerPhone,
    this.couponCode,
    this.discountAmount,
  });

  factory Booking.fromJson(Map<String, dynamic> json) {
    return Booking(
      id: json['id'] ?? '',
      customerId: json['customerId'] ?? '',
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
      status: json['status'] ?? 'pending',
      notes: json['notes'],
      workAddress: json['workAddress'],
      workLat: json['workLat']?.toDouble(),
      workLng: json['workLng']?.toDouble(),
      vehicleLat: json['vehicleLat']?.toDouble(),
      vehicleLng: json['vehicleLng']?.toDouble(),
      vendorLat: (json['vendorLat'] ?? json['vehicleLat'])?.toDouble(),
      vendorLng: (json['vendorLng'] ?? json['vehicleLng'])?.toDouble(),
      rating: json['rating']?.toDouble(),
      review: json['review'],
      startOtp: json['startOtp'],
      isOtpVerified: json['isOtpVerified'] ?? false,
      cancellationReason: json['cancellationReason'],
      cancelledBy: json['cancelledBy'],
      customerName: json['customerName'],
      customerPhone: json['customerPhone'],
      couponCode: json['couponCode'],
      discountAmount: json['discountAmount']?.toDouble(),
    );
  }

  Booking copyWith({
    String? status,
    double? vehicleLat,
    double? vehicleLng,
    double? rating,
    String? review,
  }) {
    return Booking(
      id: id,
      customerId: customerId,
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
      status: status ?? this.status,
      notes: notes,
      workAddress: workAddress,
      workLat: workLat,
      workLng: workLng,
      vehicleLat: vehicleLat ?? this.vehicleLat,
      vehicleLng: vehicleLng ?? this.vehicleLng,
      vendorLat: this.vendorLat,
      vendorLng: this.vendorLng,
      rating: rating ?? this.rating,
      review: review ?? this.review,
      startOtp: startOtp,
      isOtpVerified: isOtpVerified,
      cancellationReason: cancellationReason,
      cancelledBy: cancelledBy,
      customerName: customerName,
      customerPhone: customerPhone,
      couponCode: couponCode,
      discountAmount: discountAmount,
    );
  }

  bool get isCancellable => status == 'pending' || status == 'accepted';

  String get statusLabel {
    switch (status) {
      case 'pending': return 'Pending';
      case 'accepted': return 'Accepted';
      case 'rejected': return 'Rejected';
      case 'arrived': return 'Arrived';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  }
}
