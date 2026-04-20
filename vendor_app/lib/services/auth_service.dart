import 'dart:io';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:image_picker/image_picker.dart';
import 'api_service.dart';

class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final ApiService _api = ApiService();

  User? get currentUser => _auth.currentUser;
  String? get currentUserId => _auth.currentUser?.uid;
  bool get isSignedIn => _auth.currentUser != null;

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
        // Auto-retrieval on Android
        final result = await _auth.signInWithCredential(credential);
        final token = await result.user?.getIdToken();
        if (token != null) _api.setToken(token);
      },
      verificationFailed: (FirebaseAuthException e) {
        onFailed('[${e.code}] ${e.message ?? 'Verification failed'}');
      },
      codeSent: (String verificationId, int? resendToken) {
        onCodeSent(verificationId);
      },
      codeAutoRetrievalTimeout: (_) {},
    );
  }

  /// Verifies the OTP entered by the user
  Future<bool> verifyOTP(String verificationId, String otp) async {
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

  /// Registers vendor profile in backend after successful auth
  Future<Map<String, dynamic>> registerVendor({
    required String name,
    String? email,
    String? city,
    String? state,
    String? signatureUrl,
    String? licenseUrl,
    String? aadhaarUrl,
    bool termsAccepted = false,
  }) async {
    return await _api.post('/auth/register', body: {
      'name': name,
      'role': 'vendor',
      'email': email ?? '',
      'city': city ?? '',
      'state': state ?? '',
      if (signatureUrl != null) 'signatureUrl': signatureUrl,
      if (licenseUrl != null) 'licenseUrl': licenseUrl,
      if (aadhaarUrl != null) 'aadhaarUrl': aadhaarUrl,
      if (termsAccepted) 'termsAccepted': true,
    });
  }

  /// Uploads a signature image to Firebase Storage under profiles/{uid}/
  /// Returns the public download URL.
  Future<String> uploadSignature(XFile image) =>
      _uploadProfileDoc(image, kind: 'signature');

  /// Uploads driving licence photo to profiles/{uid}/license_*.jpg
  Future<String> uploadLicense(XFile image) =>
      _uploadProfileDoc(image, kind: 'license');

  /// Uploads Aadhaar card photo to profiles/{uid}/aadhaar_*.jpg
  Future<String> uploadAadhaar(XFile image) =>
      _uploadProfileDoc(image, kind: 'aadhaar');

  Future<String> _uploadProfileDoc(XFile image, {required String kind}) async {
    final uid = _auth.currentUser?.uid;
    if (uid == null) throw Exception('Not signed in');
    final ref = FirebaseStorage.instance
        .ref()
        .child('profiles/$uid/${kind}_${DateTime.now().millisecondsSinceEpoch}.jpg');
    await ref.putFile(File(image.path));
    return await ref.getDownloadURL();
  }

  Future<Map<String, dynamic>> getProfile() async {
    return await _api.get('/auth/profile');
  }

  /// Returns true if the user already has a named profile in the backend.
  Future<bool> hasProfile() async {
    try {
      final response = await _api.get('/auth/profile');
      final user = response['user'] ?? response;
      final name = (user['name'] as String?) ?? '';
      return name.isNotEmpty && name != 'Vendor';
    } catch (_) {
      return false;
    }
  }

  Future<void> updateOnlineStatus(bool isOnline) async {
    await _api.patch('/auth/online-status', body: {'isOnline': isOnline});
  }

  Future<void> signOut() async {
    await _auth.signOut();
    _api.setToken(null);
  }
}
