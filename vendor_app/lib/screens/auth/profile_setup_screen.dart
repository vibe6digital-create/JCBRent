import 'dart:io';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
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
  final ImagePicker _picker = ImagePicker();

  late final TapGestureRecognizer _termsRecognizer;
  late final TapGestureRecognizer _privacyRecognizer;

  bool _isLoading = false;
  bool _termsAccepted = false;
  bool _marketingConsent = false;
  XFile? _signatureImage;
  XFile? _licenseImage;
  XFile? _aadhaarImage;
  String? _error;

  @override
  void initState() {
    super.initState();
    _termsRecognizer = TapGestureRecognizer()..onTap = () => _showLegalSheet('Terms of Use', _termsText);
    _privacyRecognizer = TapGestureRecognizer()..onTap = () => _showLegalSheet('Privacy Policy', _privacyText);
  }

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
                      'Tap the links below to read the full policies. Your data is always secure and used only to give you a suitable experience.',
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
                                  TextSpan(
                                    text: 'Terms of Use',
                                    style: const TextStyle(
                                      color: AppTheme.accentColor,
                                      fontWeight: FontWeight.w600,
                                      decoration: TextDecoration.underline,
                                    ),
                                    recognizer: _termsRecognizer,
                                  ),
                                  const TextSpan(text: ' & '),
                                  TextSpan(
                                    text: 'Privacy Policy',
                                    style: const TextStyle(
                                      color: AppTheme.accentColor,
                                      fontWeight: FontWeight.w600,
                                      decoration: TextDecoration.underline,
                                    ),
                                    recognizer: _privacyRecognizer,
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

              const SizedBox(height: 24),

              // Digital signature upload (required)
              _FieldLabel(text: 'Digital Signature', required: true),
              const SizedBox(height: 4),
              Text(
                'Upload a clear photo of your signature on paper. Used to confirm your acceptance of the Terms & Privacy Policy.',
                style: TextStyle(fontSize: 12, color: Colors.grey[500]),
              ),
              const SizedBox(height: 10),
              _SignatureUploader(
                image: _signatureImage,
                enabled: !_isLoading,
                onPick: _pickSignature,
                onRemove: () => setState(() => _signatureImage = null),
              ),
              const SizedBox(height: 24),

              // KYC — Driving Licence
              _FieldLabel(text: 'Driving Licence', required: true),
              const SizedBox(height: 4),
              Text(
                'A photo of your valid driving licence. Used to verify your identity.',
                style: TextStyle(fontSize: 12, color: Colors.grey[500]),
              ),
              const SizedBox(height: 10),
              _DocumentUploader(
                image: _licenseImage,
                enabled: !_isLoading,
                label: 'Tap to upload licence photo',
                onPick: () => _pickDoc((f) => setState(() => _licenseImage = f)),
                onRemove: () => setState(() => _licenseImage = null),
              ),
              const SizedBox(height: 24),

              // KYC — Aadhaar
              _FieldLabel(text: 'Aadhaar Card', required: true),
              const SizedBox(height: 4),
              Text(
                'Front side of your Aadhaar card. Kept confidential and used only for KYC.',
                style: TextStyle(fontSize: 12, color: Colors.grey[500]),
              ),
              const SizedBox(height: 10),
              _DocumentUploader(
                image: _aadhaarImage,
                enabled: !_isLoading,
                label: 'Tap to upload Aadhaar photo',
                onPick: () => _pickDoc((f) => setState(() => _aadhaarImage = f)),
                onRemove: () => setState(() => _aadhaarImage = null),
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

  Future<void> _pickSignature() => _pickDoc((f) => setState(() { _signatureImage = f; _error = null; }));

  Future<void> _pickDoc(void Function(XFile) onPicked) async {
    try {
      final picked = await _picker.pickImage(
        source: ImageSource.gallery,
        maxWidth: 1600,
        imageQuality: 85,
      );
      if (picked != null) onPicked(picked);
    } catch (e) {
      setState(() => _error = 'Could not pick image: $e');
    }
  }

  void _showLegalSheet(String title, String body) {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF1A1A2E),
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => DraggableScrollableSheet(
        expand: false,
        initialChildSize: 0.75,
        maxChildSize: 0.95,
        minChildSize: 0.4,
        builder: (_, scrollController) => Padding(
          padding: const EdgeInsets.fromLTRB(24, 16, 24, 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40, height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey[700],
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Text(title, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white)),
              const SizedBox(height: 12),
              Expanded(
                child: SingleChildScrollView(
                  controller: scrollController,
                  child: Text(
                    body,
                    style: TextStyle(fontSize: 14, height: 1.55, color: Colors.grey[300]),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  onPressed: () => Navigator.pop(ctx),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.accentColor,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text('Close', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
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
    if (_signatureImage == null) {
      setState(() => _error = 'Please upload your digital signature to confirm acceptance');
      return;
    }
    if (_licenseImage == null) {
      setState(() => _error = 'Please upload a photo of your driving licence');
      return;
    }
    if (_aadhaarImage == null) {
      setState(() => _error = 'Please upload a photo of your Aadhaar card');
      return;
    }

    setState(() { _isLoading = true; _error = null; });

    try {
      final signatureUrl = await _authService.uploadSignature(_signatureImage!);
      final licenseUrl = await _authService.uploadLicense(_licenseImage!);
      final aadhaarUrl = await _authService.uploadAadhaar(_aadhaarImage!);

      await _authService.registerVendor(
        name: name,
        email: _emailController.text.trim().isEmpty ? null : _emailController.text.trim(),
        signatureUrl: signatureUrl,
        licenseUrl: licenseUrl,
        aadhaarUrl: aadhaarUrl,
        termsAccepted: true,
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
    _termsRecognizer.dispose();
    _privacyRecognizer.dispose();
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

class _SignatureUploader extends StatelessWidget {
  final XFile? image;
  final bool enabled;
  final VoidCallback onPick;
  final VoidCallback onRemove;
  const _SignatureUploader({
    required this.image,
    required this.enabled,
    required this.onPick,
    required this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    if (image == null) {
      return InkWell(
        onTap: enabled ? onPick : null,
        borderRadius: BorderRadius.circular(14),
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(vertical: 32),
          decoration: BoxDecoration(
            color: const Color(0xFF252540),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: Colors.grey.withAlpha(60), style: BorderStyle.solid, width: 1.5),
          ),
          child: Column(
            children: [
              Icon(Icons.upload_file_outlined, size: 36, color: Colors.grey[400]),
              const SizedBox(height: 8),
              const Text(
                'Tap to upload signature',
                style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 14),
              ),
              const SizedBox(height: 4),
              Text(
                'JPG or PNG • max 5 MB',
                style: TextStyle(color: Colors.grey[500], fontSize: 12),
              ),
            ],
          ),
        ),
      );
    }

    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF252540),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppTheme.accentColor.withAlpha(100)),
      ),
      child: Column(
        children: [
          ClipRRect(
            borderRadius: const BorderRadius.vertical(top: Radius.circular(13)),
            child: Image.file(
              File(image!.path),
              width: double.infinity,
              height: 160,
              fit: BoxFit.contain,
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(8),
            child: Row(
              children: [
                Expanded(
                  child: TextButton.icon(
                    onPressed: enabled ? onPick : null,
                    icon: const Icon(Icons.refresh, size: 18),
                    label: const Text('Replace'),
                    style: TextButton.styleFrom(foregroundColor: Colors.white70),
                  ),
                ),
                Expanded(
                  child: TextButton.icon(
                    onPressed: enabled ? onRemove : null,
                    icon: const Icon(Icons.delete_outline, size: 18),
                    label: const Text('Remove'),
                    style: TextButton.styleFrom(foregroundColor: Colors.redAccent),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _DocumentUploader extends StatelessWidget {
  final XFile? image;
  final bool enabled;
  final String label;
  final VoidCallback onPick;
  final VoidCallback onRemove;
  const _DocumentUploader({
    required this.image,
    required this.enabled,
    required this.label,
    required this.onPick,
    required this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    if (image == null) {
      return InkWell(
        onTap: enabled ? onPick : null,
        borderRadius: BorderRadius.circular(14),
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(vertical: 28),
          decoration: BoxDecoration(
            color: const Color(0xFF252540),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: Colors.grey.withAlpha(60), width: 1.5),
          ),
          child: Column(
            children: [
              Icon(Icons.description_outlined, size: 32, color: Colors.grey[400]),
              const SizedBox(height: 8),
              Text(
                label,
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 13),
              ),
              const SizedBox(height: 4),
              Text(
                'JPG or PNG • max 5 MB',
                style: TextStyle(color: Colors.grey[500], fontSize: 11),
              ),
            ],
          ),
        ),
      );
    }

    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF252540),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppTheme.accentColor.withAlpha(100)),
      ),
      child: Column(
        children: [
          ClipRRect(
            borderRadius: const BorderRadius.vertical(top: Radius.circular(13)),
            child: Image.file(
              File(image!.path),
              width: double.infinity,
              height: 140,
              fit: BoxFit.cover,
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(6),
            child: Row(
              children: [
                Expanded(
                  child: TextButton.icon(
                    onPressed: enabled ? onPick : null,
                    icon: const Icon(Icons.refresh, size: 18),
                    label: const Text('Replace'),
                    style: TextButton.styleFrom(foregroundColor: Colors.white70),
                  ),
                ),
                Expanded(
                  child: TextButton.icon(
                    onPressed: enabled ? onRemove : null,
                    icon: const Icon(Icons.delete_outline, size: 18),
                    label: const Text('Remove'),
                    style: TextButton.styleFrom(foregroundColor: Colors.redAccent),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Legal text (placeholder — replace with legally reviewed copy before launch) ───

const String _termsText = '''
Last updated: April 2026

1. Acceptance of Terms
By registering as a vendor on HeavyRent, you confirm that you have read, understood and agreed to be bound by these Terms of Use. If you do not agree, please do not use the platform.

2. Eligibility
You must be at least 18 years of age and legally permitted to operate heavy construction equipment in India. You must hold a valid driving licence for the class of vehicle you intend to list, and all documentation (RC, Fitness, Insurance) must be current and genuine.

3. Listings & Bookings
You are solely responsible for the accuracy of the information you provide about your machines, including specifications, pricing, availability and service areas. HeavyRent reserves the right to remove listings that are misleading, duplicate or non-compliant.

4. Vendor Conduct
You agree to honour confirmed bookings, arrive on time, operate the equipment safely and communicate professionally with customers. Repeated cancellations, no-shows or safety violations may result in suspension or termination of your account.

5. Payments & Fees
Customer payments flow through HeavyRent's payment partner. A platform fee is deducted from each completed booking as disclosed in the Vendor Earnings section. Payouts are made on the schedule described in the Earnings policy.

6. Location & Data
You consent to share your device location during an active booking so that customers can track arrival. Location sharing stops automatically when the booking is completed or cancelled.

7. Liability
Heavy equipment operation carries inherent risk. HeavyRent is a marketplace and is not responsible for site-level safety, damage, injury or loss arising from the use of equipment listed on the platform. Vendors are expected to carry adequate insurance at all times.

8. Termination
HeavyRent may suspend or terminate a vendor account at any time for breach of these Terms, suspected fraud, or regulatory reasons, with or without notice.

9. Governing Law
These Terms are governed by the laws of India. Any disputes will be subject to the exclusive jurisdiction of the courts at the location of HeavyRent's registered office.

10. Changes
HeavyRent may update these Terms from time to time. Continued use of the platform after an update constitutes acceptance of the revised Terms.

For questions, contact support@heavyrent.in
''';

const String _privacyText = '''
Last updated: April 2026

1. Information We Collect
When you register as a vendor, we collect: your phone number (verified via OTP), full name or business name, email (optional), location (city/state and during-booking GPS), uploaded documents (licence, Aadhaar, signature, machine photos, RC, Fitness and Insurance certificates) and device identifiers needed to deliver push notifications.

2. How We Use Your Information
- To create and manage your vendor account.
- To match you with customer booking requests in your service areas.
- To verify your identity and the legitimacy of your listings.
- To share your live location with a customer during an active booking so they can track arrival.
- To send booking alerts, earnings statements and important service messages.

3. Sharing
We share your name, vehicle details, rating and live location (during a booking) with the customer who has booked you. We do NOT sell your personal data. Authorised personnel of HeavyRent and our background-verification partner may access your KYC documents solely for verification.

4. Storage & Security
All data is stored on Google Firebase infrastructure, encrypted in transit (TLS) and at rest. Access is restricted by role-based permissions. We retain your data for the duration of your account and for such period thereafter as required by law.

5. Your Rights
You may request a copy of your data, ask us to correct inaccurate information, or request deletion of your account by writing to privacy@heavyrent.in. Some data may be retained for tax, legal or fraud-prevention purposes even after account deletion.

6. Location Data
Location is captured only when the app is in active use for a booking. You can disable location permission from device settings, but this will prevent you from receiving booking assignments that require live tracking.

7. Cookies & Analytics
The HeavyRent apps use Firebase Analytics and Crashlytics to understand usage patterns and diagnose crashes. These tools do not collect personally identifying information.

8. Children
HeavyRent is not intended for anyone under 18. We do not knowingly collect data from minors.

9. Changes
We may update this Privacy Policy from time to time. Material changes will be notified in-app.

Contact: privacy@heavyrent.in
''';
