import 'package:flutter/material.dart';
import '../../config/theme.dart';
import '../../services/auth_service.dart';
import 'otp_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _phoneController = TextEditingController();
  final _authService = AuthService();
  bool _isLoading = false;
  String? _error;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Spacer(),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.primaryColor.withAlpha(25),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Icon(Icons.construction, size: 48, color: AppTheme.primaryColor),
              ),
              const SizedBox(height: 24),
              const Text(
                'Welcome to\nHeavyRent',
                style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, height: 1.2),
              ),
              const SizedBox(height: 8),
              Text(
                'Rent heavy equipment near you',
                style: TextStyle(fontSize: 16, color: Colors.grey[600]),
              ),
              const SizedBox(height: 48),
              TextField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                style: const TextStyle(fontSize: 18, letterSpacing: 1),
                decoration: InputDecoration(
                  labelText: 'Phone Number',
                  hintText: '9876543210',
                  prefixIcon: const Icon(Icons.phone),
                  prefixText: '+91 ',
                  prefixStyle: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                ),
              ),
              if (_error != null)
                Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: Text(_error!, style: const TextStyle(color: AppTheme.errorColor)),
                ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _sendOTP,
                  style: ElevatedButton.styleFrom(
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  child: _isLoading
                      ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Text('Send OTP', style: TextStyle(fontSize: 18)),
                ),
              ),
              const SizedBox(height: 16),
              Center(
                child: Text(
                  'We\'ll send a 6-digit OTP to verify',
                  style: TextStyle(color: Colors.grey[500], fontSize: 13),
                ),
              ),
              const Spacer(flex: 2),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _sendOTP() async {
    final phone = _phoneController.text.trim();
    if (phone.isEmpty || phone.length < 10) {
      setState(() => _error = 'Please enter a valid 10-digit phone number');
      return;
    }

    setState(() { _isLoading = true; _error = null; });
    final formattedPhone = phone.startsWith('+') ? phone : '+91$phone';

    await _authService.verifyPhone(
      phoneNumber: formattedPhone,
      onCodeSent: (verificationId) {
        if (mounted) {
          setState(() => _isLoading = false);
          Navigator.push(context, MaterialPageRoute(
            builder: (_) => OTPScreen(
              phoneNumber: formattedPhone,
              verificationId: verificationId,
            ),
          ));
        }
      },
      onFailed: (error) {
        if (mounted) setState(() { _isLoading = false; _error = error; });
      },
    );
  }

  @override
  void dispose() {
    _phoneController.dispose();
    super.dispose();
  }
}
