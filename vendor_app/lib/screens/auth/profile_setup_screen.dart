import 'package:flutter/material.dart';
import '../../config/theme.dart';
import '../../services/auth_service.dart';
import '../home/vendor_home_screen.dart';

class VendorProfileSetupScreen extends StatefulWidget {
  final String phoneNumber;
  const VendorProfileSetupScreen({super.key, required this.phoneNumber});

  @override
  State<VendorProfileSetupScreen> createState() => _VendorProfileSetupScreenState();
}

class _VendorProfileSetupScreenState extends State<VendorProfileSetupScreen> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final AuthService _authService = AuthService();

  bool _isLoading = false;
  bool _termsAccepted = false;
  bool _marketingConsent = false;
  String? _error;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF1A1A2E),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 16),

              // Icon
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppTheme.accentColor.withAlpha(30),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Icon(Icons.engineering_rounded, size: 40, color: AppTheme.accentColor),
              ),
              const SizedBox(height: 20),

              const Text(
                'Set Up Your\nVendor Profile',
                style: TextStyle(
                  fontSize: 28, fontWeight: FontWeight.bold,
                  color: Colors.white, height: 1.2,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                'Just a few details to get you started — phone verified ✓',
                style: TextStyle(fontSize: 14, color: Colors.grey[400]),
              ),
              const SizedBox(height: 32),

              // Full Name (required)
              _FieldLabel(text: 'Full Name / Business Name', required: true),
              const SizedBox(height: 8),
              TextField(
                controller: _nameController,
                textCapitalization: TextCapitalization.words,
                style: const TextStyle(color: Colors.white),
                decoration: InputDecoration(
                  hintText: 'Enter your name or business name',
                  hintStyle: TextStyle(color: Colors.grey[500]),
                  prefixIcon: Icon(Icons.person_outline, color: Colors.grey[400]),
                  filled: true,
                  fillColor: const Color(0xFF252540),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: BorderSide.none,
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: const BorderSide(color: AppTheme.accentColor, width: 1.5),
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Email (optional)
              _FieldLabel(text: 'Email ID', required: false),
              const SizedBox(height: 4),
              Text(
                'Booking receipts and earnings reports will be sent here',
                style: TextStyle(fontSize: 12, color: Colors.grey[500]),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                style: const TextStyle(color: Colors.white),
                decoration: InputDecoration(
                  hintText: 'your@email.com (optional)',
                  hintStyle: TextStyle(color: Colors.grey[500]),
                  prefixIcon: Icon(Icons.email_outlined, color: Colors.grey[400]),
                  filled: true,
                  fillColor: const Color(0xFF252540),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: BorderSide.none,
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: const BorderSide(color: AppTheme.accentColor, width: 1.5),
                  ),
                ),
              ),
              const SizedBox(height: 28),

              // Terms
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: _termsAccepted
                      ? AppTheme.accentColor.withAlpha(20)
                      : const Color(0xFF252540),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: _termsAccepted
                        ? AppTheme.accentColor.withAlpha(100)
                        : Colors.grey.withAlpha(40),
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Enjoy HeavyRent services by accepting our Terms & Privacy Policy.',
                      style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: Colors.white),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Your data is always secure and used only to give you a suitable experience.',
                      style: TextStyle(fontSize: 12, color: Colors.grey[500]),
                    ),
                    const SizedBox(height: 12),
                    GestureDetector(
                      onTap: () => setState(() { _termsAccepted = !_termsAccepted; _error = null; }),
                      child: Row(
                        children: [
                          Checkbox(
                            value: _termsAccepted,
                            activeColor: AppTheme.accentColor,
                            checkColor: Colors.white,
                            side: BorderSide(color: Colors.grey[500]!),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                            onChanged: (v) => setState(() { _termsAccepted = v ?? false; _error = null; }),
                          ),
                          Expanded(
                            child: RichText(
                              text: TextSpan(
                                style: const TextStyle(fontSize: 13, color: Colors.white70),
                                children: [
                                  const TextSpan(text: 'I accept the '),
                                  const TextSpan(
                                    text: 'Terms of Use',
                                    style: TextStyle(color: AppTheme.accentColor, fontWeight: FontWeight.w600),
                                  ),
                                  const TextSpan(text: ' & '),
                                  const TextSpan(
                                    text: 'Privacy Policy',
                                    style: TextStyle(color: AppTheme.accentColor, fontWeight: FontWeight.w600),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    GestureDetector(
                      onTap: () => setState(() => _marketingConsent = !_marketingConsent),
                      child: Row(
                        children: [
                          Checkbox(
                            value: _marketingConsent,
                            activeColor: AppTheme.accentColor,
                            checkColor: Colors.white,
                            side: BorderSide(color: Colors.grey[500]!),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                            onChanged: (v) => setState(() => _marketingConsent = v ?? false),
                          ),
                          Expanded(
                            child: Text(
                              'Stay informed of new booking requests & platform updates.',
                              style: TextStyle(fontSize: 12, color: Colors.grey[500]),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              if (_error != null) ...[
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.red.withAlpha(30),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: Colors.red.withAlpha(80)),
                  ),
                  child: Text(_error!, style: const TextStyle(color: Colors.redAccent, fontSize: 13)),
                ),
              ],

              const SizedBox(height: 28),

              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _submit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.accentColor,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    elevation: 0,
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          height: 20, width: 20,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : const Text(
                          'Accept & Start Earning',
                          style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold),
                        ),
                ),
              ),
              const SizedBox(height: 16),
              Text(
                'Phone: ${widget.phoneNumber}',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 12, color: Colors.grey[600]),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _submit() async {
    final name = _nameController.text.trim();
    if (name.isEmpty) {
      setState(() => _error = 'Please enter your full name or business name');
      return;
    }
    if (!_termsAccepted) {
      setState(() => _error = 'Please accept the Terms of Use & Privacy Policy to continue');
      return;
    }

    setState(() { _isLoading = true; _error = null; });

    try {
      await _authService.registerVendor(
        name: name,
        email: _emailController.text.trim().isEmpty ? null : _emailController.text.trim(),
      );

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
    _nameController.dispose();
    _emailController.dispose();
    super.dispose();
  }
}

class _FieldLabel extends StatelessWidget {
  final String text;
  final bool required;
  const _FieldLabel({required this.text, required this.required});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Text(text, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Colors.white)),
        if (required) ...[
          const SizedBox(width: 4),
          const Text('*', style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold)),
        ] else ...[
          const SizedBox(width: 6),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(
              color: Colors.grey[800],
              borderRadius: BorderRadius.circular(4),
            ),
            child: const Text('Optional', style: TextStyle(fontSize: 11, color: Colors.grey)),
          ),
        ],
      ],
    );
  }
}
