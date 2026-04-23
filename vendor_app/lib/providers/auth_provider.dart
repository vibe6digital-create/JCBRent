import 'package:flutter/material.dart';
import '../services/auth_service.dart';

class AuthProvider extends ChangeNotifier {
  final AuthService _authService = AuthService();

  bool _isLoading = false;
  bool _isAuthenticated = false;
  Map<String, dynamic>? _userProfile;

  bool get isLoading => _isLoading;
  bool get isAuthenticated => _isAuthenticated;
  Map<String, dynamic>? get userProfile => _userProfile;

  Future<void> sendOTP(
    String phoneNumber, {
    required void Function(String verificationId) onCodeSent,
    required void Function(String error) onFailed,
  }) async {
    _isLoading = true;
    notifyListeners();
    await _authService.verifyPhone(
      phoneNumber: phoneNumber,
      onCodeSent: onCodeSent,
      onFailed: onFailed,
    );
    _isLoading = false;
    notifyListeners();
  }

  Future<void> verifyOTP(String verificationId, String otp) async {
    _isLoading = true;
    notifyListeners();
    await _authService.verifyOTP(verificationId, otp);
    _isAuthenticated = true;
    _isLoading = false;
    notifyListeners();
  }

  Future<void> registerProfile({
    required String name,
    String? email,
    String? city,
    String? state,
  }) async {
    final data = await _authService.registerVendor(
      name: name,
      email: email,
      city: city,
      state: state,
    );
    _userProfile = data['user'];
    notifyListeners();
  }

  Future<void> signOut() async {
    await _authService.signOut();
    _isAuthenticated = false;
    _userProfile = null;
    notifyListeners();
  }
}
