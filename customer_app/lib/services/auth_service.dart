import 'package:firebase_auth/firebase_auth.dart';
import 'api_service.dart';

class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final ApiService _api = ApiService();

  User? get currentUser => _auth.currentUser;
  bool get isSignedIn => _auth.currentUser != null;
  String? get currentUserId => _auth.currentUser?.uid;

  Stream<User?> get authStateChanges => _auth.authStateChanges();

  /// Sends OTP to phone number. Format: +91XXXXXXXXXX
  Future<void> verifyPhone({
    required String phoneNumber,
    required void Function(String verificationId) onCodeSent,
    required void Function(String error) onFailed,
  }) async {
    await _auth.verifyPhoneNumber(
      phoneNumber: phoneNumber,
      timeout: const Duration(seconds: 60),
      verificationCompleted: (PhoneAuthCredential credential) async {
        // Auto-retrieval on Android — sign in immediately
        await _auth.signInWithCredential(credential);
        final token = await _auth.currentUser?.getIdToken();
        if (token != null) _api.setToken(token);
      },
      verificationFailed: (FirebaseAuthException e) {
        onFailed(e.message ?? 'Verification failed');
      },
      codeSent: (String verificationId, int? resendToken) {
        onCodeSent(verificationId);
      },
      codeAutoRetrievalTimeout: (String verificationId) {},
    );
  }

  /// Signs in with OTP entered by user
  Future<bool> signInWithOTP(String verificationId, String otp) async {
    try {
      final credential = PhoneAuthProvider.credential(
        verificationId: verificationId,
        smsCode: otp,
      );
      final result = await _auth.signInWithCredential(credential);
      final token = await result.user?.getIdToken();
      if (token != null) _api.setToken(token);
      return result.user != null;
    } on FirebaseAuthException catch (e) {
      throw Exception(e.message ?? 'OTP verification failed');
    }
  }

  /// Registers user profile in backend after successful auth
  Future<Map<String, dynamic>> registerUser({
    required String name,
    required String role,
    String? email,
    String? city,
    String? state,
  }) async {
    return await _api.post('/auth/register', body: {
      'name': name,
      'role': role,
      'email': email ?? '',
      'city': city ?? '',
      'state': state ?? '',
    });
  }

  /// Creates new customer profile with optional email and referral code
  Future<Map<String, dynamic>> registerProfile({
    required String name,
    String? email,
    String? referralCode,
  }) async {
    return await _api.post('/auth/register', body: {
      'name': name,
      'role': 'customer',
      if (email != null && email.isNotEmpty) 'email': email,
      if (referralCode != null && referralCode.isNotEmpty) 'referralCode': referralCode,
    });
  }

  /// Checks if the current user already has a profile set up
  Future<bool> hasProfile() async {
    try {
      final response = await _api.get('/auth/profile');
      final user = response['user'];
      return user != null && (user['name'] as String?)?.isNotEmpty == true;
    } catch (_) {
      return false;
    }
  }

  Future<Map<String, dynamic>> getProfile() async {
    return await _api.get('/auth/profile');
  }

  Future<void> signOut() async {
    await _auth.signOut();
    _api.setToken(null);
  }
}
