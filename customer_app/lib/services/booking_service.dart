import '../models/booking.dart';
import 'api_service.dart';

class BookingService {
  final ApiService _api = ApiService();

  Future<Booking> createBooking({
    required String machineId,
    required String machineCategory,
    required String machineModel,
    required String vendorName,
    required String startDate,
    required String endDate,
    required String rateType,
    required double rate,
    required double estimatedCost,
    required Map<String, dynamic> workLocation,
    String? notes,
    String? estimateId,
    String? couponCode,
    String? bookingType,
  }) async {
    final response = await _api.post('/bookings', body: {
      'machineId': machineId,
      'machineCategory': machineCategory,
      'machineModel': machineModel,
      'vendorName': vendorName,
      'startDate': startDate,
      'endDate': endDate,
      'rateType': rateType,
      'rate': rate,
      'estimatedCost': estimatedCost,
      'workLocation': workLocation,
      if (notes != null) 'notes': notes,
      if (estimateId != null) 'estimateId': estimateId,
      if (couponCode != null) 'couponCode': couponCode,
      if (bookingType != null) 'bookingType': bookingType,
    });
    return Booking.fromJson(response['booking'] ?? response);
  }

  Future<List<Booking>> getMyBookings() async {
    final response = await _api.get('/bookings');
    final List bookings = response['bookings'] ?? response['data'] ?? [];
    return bookings.map((b) => Booking.fromJson(b)).toList();
  }

  Future<Booking> getBookingById(String id) async {
    final response = await _api.get('/bookings/$id');
    return Booking.fromJson(response['booking'] ?? response);
  }

  Future<void> rateBooking(String bookingId, double rating, String review) async {
    await _api.patch('/bookings/$bookingId/rate', body: {
      'rating': rating,
      'review': review,
    });
  }
}
