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
                      'Enjoy Rentzoo services by accepting our Terms & Privacy Policy.',
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

const String _termsText = '''
RENTZOO VENDOR TERMS AND CONDITIONS
Operated by: RentZoo Private Limited

1. DEFINITIONS

- "Customer" means any individual or business entity that books heavy vehicles/equipment through the Rentzoo platform.
- "Vendor" means any individual or entity that lists and provides heavy vehicles/equipment (such as JCBs, cranes, tractors, excavators, etc.) on the Rentzoo platform.
- "Service" means the rental of heavy vehicles/equipment provided by the Vendor to the Customer, inclusive of operator services unless otherwise specified.
- "Booking Amount" means the total amount payable by the Customer for the Service booked through Rentzoo.
- "Platform" means the Rentzoo mobile application, website, and associated digital interfaces.

2. SCOPE OF PLATFORM SERVICES

- Technology Provider: Rentzoo operates strictly as a technology platform connecting Vendors with Customers. Rentzoo does not own, operate, or maintain any vehicles.
- Facilitation: Rentzoo facilitates bookings, digital payments, and communication. We do not provide the rental service directly.
- Account Maintenance: Vendors must maintain an active account and provide valid documentation, including RC, Insurance, Permits, and Operator KYC.
- Verification: Vendor grants Rentzoo the right to conduct background checks. False information will result in immediate termination.

3. VENDOR ELIGIBILITY & COMPLIANCE

- Legal Age: The Vendor must be at least 18 years of age.
- Authorization: Vendor must possess legal ownership or explicit authorization to rent out the listed equipment.
- Licensing: Vendor shall ensure all operators hold valid Heavy Motor Vehicle (HMV) or specialized equipment licenses as required by Indian law.

4. VENDOR OBLIGATIONS & CONDUCT

- Reliability: Once a booking is accepted, the Vendor is committed. Cancellations are only permitted in verified emergencies.
- Punctuality: Vendor must ensure the equipment reaches the site at the scheduled time.
- Maintenance: Equipment must be in prime working condition, safe, and fuel-ready as per the booking terms.
- Prohibited Conduct: Vendors and operators shall not engage in illegal activities or operate machinery under the influence of alcohol or intoxicants.
- Sole Responsibility: The Vendor is exclusively responsible for the completion of the service and any misconduct by the operator.

5. PRICING, PAYMENTS & COMMISSION

- Price Finality: Vendors may set their own prices or follow Rentzoo's market-guided pricing. Once a booking is confirmed, the Vendor shall not demand extra payment beyond the agreed amount.
- Commission: Rentzoo will deduct a pre-agreed commission from the Booking Amount for each successful transaction.
- Payouts: Vendor payouts will be released within 24 hours after successful completion of the service, to the registered bank account.

6. STRICT NO-BYPASS POLICY

- Exclusivity: Vendors shall not engage in direct transactions with Customers introduced via Rentzoo outside of the Platform.
- Data Integrity: Sharing personal contact details to move a transaction "offline" is strictly prohibited.
- Penalties: Violation of this policy will result in permanent account suspension and potential financial penalties equivalent to the estimated lost commission.

7. CANCELLATION, DELAYS & PENALTIES

Non-Performance: Vendor cancellation after booking acceptance, failure to show up or significant delays will result in:
1. Financial penalties deducted from future payouts.
2. Reduced platform visibility (Search Ranking).
3. Account suspension for repeated offenses.

8. LIABILITY & INSURANCE

- Indemnification: Vendor shall indemnify and hold Rentzoo harmless against any claims, losses, or legal actions arising from the Vendor's service, negligence, or equipment failure.
- Insurance: It is the Vendor's sole responsibility to maintain valid comprehensive insurance for the vehicle and third-party liability. Rentzoo is not liable for any damages, accidents, or fatalities at the site.

9. SUBSCRIPTION & FEES

- Zero Onboarding Fee: Currently, Rentzoo does not charge any upfront platform usage or subscription fees for Vendors to join or access the Platform. Any future changes to this fee structure will be communicated in advance.

10. CONFIDENTIALITY & DATA

- Privacy: Vendors shall keep all Customer data (location, contact, site details) confidential.
- Communication: By registering, the Vendor consents to receive calls, SMS, and WhatsApp notifications from Rentzoo for operational purposes.

11. RELATIONSHIP OF PARTIES

- Independent Contractor: The relationship between Rentzoo and the Vendor is that of an independent contractor. Nothing in these Terms shall be construed to create a partnership, joint venture, or employer-employee relationship.

12. COMMUNICATION & DATA CONSENT

The Vendor agrees to receive calls, SMS, emails, and notifications from Rentzoo. The Vendor shall provide required KYC details and consents to the collection, storage, and use of their data by Rentzoo as per applicable laws.

13. INDEMNIFICATION & LIABILITY

The Vendor agrees to indemnify and hold Rentzoo harmless from any claims, losses, or damages arising from the Vendor's services, negligence, misconduct, or violation of these terms or applicable laws.

14. FORCE MAJEURE

Neither party shall be held liable for failure to perform obligations due to events beyond reasonable control, such as natural disasters, government lockdowns, or civil unrest.

15. GOVERNING LAW & JURISDICTION

These Terms are governed by the laws of India. Any disputes arising shall be subject to the exclusive jurisdiction of the courts in Hyderabad, Telangana.

16. ACCEPTANCE OF TERMS

By clicking "I Accept" during registration or by continuing to use the Rentzoo Platform, the Vendor acknowledges that they have read, understood, and agreed to be bound by these Terms and Conditions.
''';

const String _privacyText = '''
RENTZOO PRIVACY POLICY
Operated by: RentZoo Private Limited

1. Information We Collect
When you register as a vendor, we collect: your phone number (verified via OTP), full name or business name, email (optional), location (city/state and during-booking GPS), uploaded documents (Driving Licence, Aadhaar, signature, machine photos, RC, Fitness and Insurance certificates) and device identifiers needed to deliver push notifications.

2. How We Use Your Information
- To create and manage your vendor account.
- To match you with customer booking requests in your service areas.
- To verify your identity and the legitimacy of your listings.
- To share your live location with a customer during an active booking so they can track arrival.
- To send booking alerts, earnings statements, SMS, WhatsApp and important service messages.

3. Sharing
We share your name, vehicle details, rating and live location (during a booking) with the customer who has booked you. We do NOT sell your personal data. Authorised personnel of Rentzoo and our background-verification partner may access your KYC documents solely for verification.

4. Storage & Security
All data is stored on Google Firebase infrastructure, encrypted in transit (TLS) and at rest. Access is restricted by role-based permissions. We retain your data for the duration of your account and for such period thereafter as required by law.

5. Your Rights
You may request a copy of your data, ask us to correct inaccurate information, or request deletion of your account by writing to support@rentzoo.in. Some data may be retained for tax, legal or fraud-prevention purposes even after account deletion.

6. Location Data
Location is captured only when the app is in active use for a booking. You can disable location permission from device settings, but this will prevent customers from tracking your arrival.

7. Analytics
The Rentzoo apps use Firebase Analytics and Crashlytics to understand usage patterns and diagnose crashes. These tools do not collect personally identifying information.

8. Children
Rentzoo is not intended for anyone under 18. We do not knowingly collect data from minors.

9. Changes
We may update this Privacy Policy from time to time. Material changes will be notified in-app.

Contact: support@rentzoo.in
''';
