import 'package:flutter/material.dart';
import '../../config/theme.dart';
import '../../services/auth_service.dart';
import '../home/vendor_home_screen.dart';

class OTPScreen extends StatefulWidget {
  final String phoneNumber;
  final String verificationId;
  const OTPScreen({super.key, required this.phoneNumber, required this.verificationId});

  @override
  State<OTPScreen> createState() => _OTPScreenState();
}

class _OTPScreenState extends State<OTPScreen> {
  final _otpController = TextEditingController();
  final _authService = AuthService();
  bool _isLoading = false;
  String? _error;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      appBar: AppBar(backgroundColor: Colors.transparent),
      body: Padding(
        padding: const EdgeInsets.all(28),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 72, height: 72,
              decoration: BoxDecoration(
                color: AppTheme.primaryColor.withAlpha(25),
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Icon(Icons.lock_rounded, size: 36, color: AppTheme.primaryColor),
            ),
            const SizedBox(height: 24),
            const Text('Verify OTP',
              style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800, color: AppTheme.textPrimary, letterSpacing: -0.5)),
            const SizedBox(height: 8),
            Text('OTP sent to ${widget.phoneNumber}',
              style: const TextStyle(fontSize: 15, color: AppTheme.textSecondary)),
            const SizedBox(height: 36),

            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [AppTheme.softShadow],
              ),
              child: TextField(
                controller: _otpController,
                keyboardType: TextInputType.number,
                maxLength: 6,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w800, letterSpacing: 12, color: AppTheme.textPrimary),
                decoration: const InputDecoration(
                  counterText: '',
                  hintText: '------',
                  hintStyle: TextStyle(color: AppTheme.textLight, letterSpacing: 12),
                  border: InputBorder.none,
                  enabledBorder: InputBorder.none,
                  focusedBorder: InputBorder.none,
                  contentPadding: EdgeInsets.symmetric(horizontal: 24, vertical: 20),
                ),
              ),
            ),

            if (_error != null)
              Padding(
                padding: const EdgeInsets.only(top: 10),
                child: Text(_error!, style: const TextStyle(color: AppTheme.errorColor, fontSize: 14)),
              ),
            const SizedBox(height: 28),

            SizedBox(
              width: double.infinity,
              height: 56,
              child: Container(
                decoration: BoxDecoration(
                  gradient: AppTheme.accentGradient,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [AppTheme.accentGlow],
                ),
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _verifyOTP,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.transparent,
                    shadowColor: Colors.transparent,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  child: _isLoading
                      ? const SizedBox(height: 22, width: 22,
                          child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.white))
                      : const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.check_rounded, size: 22),
                            SizedBox(width: 8),
                            Text('Verify & Continue', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                          ],
                        ),
                ),
              ),
            ),
            const SizedBox(height: 24),

            Center(
              child: GestureDetector(
                onTap: () async {
                  await _authService.verifyPhone(
                    phoneNumber: widget.phoneNumber,
                    onCodeSent: (_) {
                      if (!mounted) return;
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: const Text('OTP resent!'),
                          behavior: SnackBarBehavior.floating,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ));
                    },
                    onFailed: (error) {
                      if (!mounted) return;
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(error),
                          behavior: SnackBarBehavior.floating,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ));
                    },
                  );
                },
                child: RichText(
                  text: const TextSpan(
                    text: "Didn't receive OTP? ",
                    style: TextStyle(color: AppTheme.textSecondary, fontSize: 14),
                    children: [
                      TextSpan(
                        text: 'Resend',
                        style: TextStyle(color: AppTheme.accentColor, fontWeight: FontWeight.w700),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _verifyOTP() async {
    if (_otpController.text.length != 6) {
      setState(() => _error = 'Please enter a valid 6-digit OTP');
      return;
    }
    setState(() { _isLoading = true; _error = null; });

    try {
      final success = await _authService.verifyOTP(widget.verificationId, _otpController.text.trim());
      if (!success) throw Exception('Verification failed');

      // Register vendor profile if first login, otherwise just get profile
      try {
        await _authService.getProfile();
      } catch (_) {
        // Profile not found — register as new vendor
        try {
          await _authService.registerVendor(name: 'Vendor');
        } catch (_) {}
      }

      if (mounted) {
        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (_) => const VendorHomeScreen()),
          (route) => false,
        );
      }
    } catch (e) {
      setState(() {
        _isLoading = false;
        _error = e.toString().replaceFirst('Exception: ', '');
      });
    }
  }

  @override
  void dispose() {
    _otpController.dispose();
    super.dispose();
  }
}
