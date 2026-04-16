import 'package:flutter/material.dart';
import '../../config/theme.dart';
import '../../services/auth_service.dart';
import '../../services/storage_service.dart';
import '../home/home_screen.dart';
import 'profile_setup_screen.dart';

class OTPScreen extends StatefulWidget {
  final String phoneNumber;
  final String verificationId;

  const OTPScreen({
    super.key,
    required this.phoneNumber,
    required this.verificationId,
  });

  @override
  State<OTPScreen> createState() => _OTPScreenState();
}

class _OTPScreenState extends State<OTPScreen> {
  final List<TextEditingController> _controllers =
      List.generate(6, (_) => TextEditingController());
  final List<FocusNode> _focusNodes = List.generate(6, (_) => FocusNode());
  final AuthService _authService = AuthService();

  bool _isLoading = false;
  String? _error;
  int _resendCountdown = 30;
  bool _canResend = false;

  @override
  void initState() {
    super.initState();
    _startResendTimer();
  }

  void _startResendTimer() {
    setState(() { _canResend = false; _resendCountdown = 30; });
    Future.doWhile(() async {
      await Future.delayed(const Duration(seconds: 1));
      if (!mounted) return false;
      setState(() => _resendCountdown--);
      if (_resendCountdown <= 0) {
        setState(() => _canResend = true);
        return false;
      }
      return true;
    });
  }

  String get _otp => _controllers.map((c) => c.text).join();

  Future<void> _verifyOTP() async {
    if (_otp.length != 6) {
      setState(() => _error = 'Please enter a valid 6-digit OTP');
      return;
    }

    setState(() { _isLoading = true; _error = null; });

    try {
      final success = await _authService.signInWithOTP(
        widget.verificationId,
        _otp,
      );

      if (!success) throw Exception('Sign in failed');

      // Save phone locally for quick profile display
      await StorageService.saveUserProfile(
        name: '',
        phone: widget.phoneNumber,
      );

      // Check if user already has a profile (returning user)
      final hasProfile = await _authService.hasProfile();

      if (mounted) {
        if (hasProfile) {
          // Returning user — go straight to home
          Navigator.pushAndRemoveUntil(
            context,
            MaterialPageRoute(builder: (_) => const HomeScreen()),
            (route) => false,
          );
        } else {
          // New user — collect name, email, referral code, accept terms
          Navigator.pushAndRemoveUntil(
            context,
            MaterialPageRoute(builder: (_) => ProfileSetupScreen(phoneNumber: widget.phoneNumber)),
            (route) => false,
          );
        }
      }
    } catch (e) {
      setState(() {
        _isLoading = false;
        _error = e.toString().replaceFirst('Exception: ', '');
      });
    }
  }

  Future<void> _resendOTP() async {
    _startResendTimer();
    try {
      await _authService.verifyPhone(
        phoneNumber: widget.phoneNumber,
        onCodeSent: (_) => ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('OTP resent!')),
        ),
        onFailed: (err) => ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(err)),
        ),
      );
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Verify OTP'), elevation: 0),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Enter the 6-digit code sent to',
              style: TextStyle(fontSize: 16, color: Colors.grey[600]),
            ),
            const SizedBox(height: 4),
            Text(
              widget.phoneNumber,
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 32),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: List.generate(6, (i) => SizedBox(
                width: 48,
                child: TextField(
                  controller: _controllers[i],
                  focusNode: _focusNodes[i],
                  keyboardType: TextInputType.number,
                  textAlign: TextAlign.center,
                  maxLength: 1,
                  style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                  decoration: InputDecoration(
                    counterText: '',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: AppTheme.primaryColor, width: 2),
                    ),
                  ),
                  onChanged: (value) {
                    if (value.isNotEmpty && i < 5) _focusNodes[i + 1].requestFocus();
                    if (value.isEmpty && i > 0) _focusNodes[i - 1].requestFocus();
                    if (_otp.length == 6) _verifyOTP();
                  },
                ),
              )),
            ),
            if (_error != null)
              Padding(
                padding: const EdgeInsets.only(top: 16),
                child: Text(_error!, style: const TextStyle(color: AppTheme.errorColor)),
              ),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _verifyOTP,
                style: ElevatedButton.styleFrom(
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                child: _isLoading
                    ? const SizedBox(
                        height: 20, width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : const Text('Verify & Continue', style: TextStyle(fontSize: 18)),
              ),
            ),
            const SizedBox(height: 24),
            Center(
              child: _canResend
                  ? TextButton(
                      onPressed: _resendOTP,
                      child: const Text('Resend OTP', style: TextStyle(fontWeight: FontWeight.w600)),
                    )
                  : Text(
                      'Resend OTP in ${_resendCountdown}s',
                      style: TextStyle(color: Colors.grey[500]),
                    ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    for (final c in _controllers) c.dispose();
    for (final f in _focusNodes) f.dispose();
    super.dispose();
  }
}
