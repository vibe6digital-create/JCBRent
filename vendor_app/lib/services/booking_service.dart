import '../models/booking.dart';
import 'api_service.dart';

class BookingService {
  final ApiService _api = ApiService();

  Future<List<Booking>> getVendorBookings() async {
    final response = await _api.get('/bookings/vendor');
    final List bookings = response['bookings'] ?? response['data'] ?? [];
    return bookings.map((b) => Booking.fromJson(b)).toList();
  }

  Future<Booking?> getBookingById(String id) async {
    try {
      final response = await _api.get('/bookings/$id');
      return Booking.fromJson(response['booking'] ?? response);
    } catch (_) {
      return null;
    }
  }

  Future<void> updateBookingStatus(String id, String status) async {
    await _api.patch('/bookings/$id/status', body: {'status': status});
  }

  Future<void> acceptBooking(String id) => updateBookingStatus(id, 'accepted');
  Future<void> rejectBooking(String id) => updateBookingStatus(id, 'rejected');
  Future<void> completeBooking(String id) => updateBookingStatus(id, 'completed');

  Future<void> markArrived(String id) async {
    await _api.patch('/bookings/$id/arrive');
  }

  Future<void> verifyStartOtp(String id, String otp) async {
    await _api.patch('/bookings/$id/verify-otp', body: {'otp': otp});
  }

  Future<Map<String, dynamic>> getEarningsSummary() async {
    final response = await _api.get('/bookings/vendor/earnings');
    return response['earnings'] ?? response ?? {};
  }
}
