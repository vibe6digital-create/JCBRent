import 'package:shared_preferences/shared_preferences.dart';

class StorageService {
  static const _tourSeenKey = 'tour_seen';
  static const _nameKey = 'user_name';
  static const _phoneKey = 'user_phone';
  static const _emailKey = 'user_email';
  static const _cityKey = 'user_city';
  static const _stateKey = 'user_state';

  static Future<bool> isTourSeen() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_tourSeenKey) ?? false;
  }

  static Future<void> setTourSeen() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_tourSeenKey, true);
  }

  static Future<Map<String, String>> getUserProfile() async {
    final prefs = await SharedPreferences.getInstance();
    return {
      'name': prefs.getString(_nameKey) ?? '',
      'phone': prefs.getString(_phoneKey) ?? '',
      'email': prefs.getString(_emailKey) ?? '',
      'city': prefs.getString(_cityKey) ?? '',
      'state': prefs.getString(_stateKey) ?? '',
    };
  }

  static Future<void> saveUserProfile({
    required String name,
    required String phone,
    String email = '',
    String city = '',
    String state = '',
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_nameKey, name);
    await prefs.setString(_phoneKey, phone);
    await prefs.setString(_emailKey, email);
    await prefs.setString(_cityKey, city);
    await prefs.setString(_stateKey, state);
  }

  static Future<void> clearAll() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
  }
}
