import 'package:flutter/material.dart';
import '../services/auth_service.dart';

class AuthProvider extends ChangeNotifier {
  final AuthService _authService = AuthService();

  bool _isLoading = false;
  bool _isAuthenticated = false;
  Map<String, dynamic>? _userProfile;
  String? _verificationId;

  bool get isLoading => _isLoading;
  bool get isAuthenticated => _isAuthenticated;
  Map<String, dynamic>? get userProfile => _userProfile;

  Future<void> sendOTP(String phoneNumber) async {
    _isLoading = true;
    notifyListeners();

    await _authService.verifyPhone(
      phoneNumber: phoneNumber,
      onCodeSent: (verificationId) {
        _verificationId = verificationId;
        _isLoading = false;
        notifyListeners();
      },
      onFailed: (error) {
        _isLoading = false;
        notifyListeners();
        throw Exception(error);
      },
    );
  }

  Future<void> verifyOTP(String otp) async {
    if (_verificationId == null) throw Exception('No verification ID');
    _isLoading = true;
    notifyListeners();

    await _authService.signInWithOTP(_verificationId!, otp);
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
    final data = await _authService.registerUser(
      name: name,
      role: 'customer',
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
