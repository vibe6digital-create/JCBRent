import 'package:flutter/material.dart';
import '../../config/theme.dart';
import '../../services/auth_service.dart';
import '../auth/login_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _authService = AuthService();
  Map<String, dynamic> _profile = {};
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    try {
      final response = await _authService.getProfile();
      setState(() {
        _profile = response['user'] ?? response;
        _isLoading = false;
      });
    } catch (_) {
      setState(() => _isLoading = false);
    }
  }

  String _get(String key) => _profile[key]?.toString() ?? '';

  String get _verificationStatus {
    final s = _get('verificationStatus');
    if (s.isNotEmpty) return s;
    // If KYC docs exist but no explicit status yet, treat as pending.
    if (_get('licenseUrl').isNotEmpty && _get('aadhaarUrl').isNotEmpty) return 'pending';
    return 'incomplete';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      body: SafeArea(
        child: _isLoading
            ? const Center(child: CircularProgressIndicator(color: AppTheme.accentColor))
            : RefreshIndicator(
                onRefresh: _loadProfile,
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    children: [
                      const SizedBox(height: 20),
                      Container(
                        width: 100, height: 100,
                        decoration: BoxDecoration(
                          gradient: AppTheme.primaryGradient,
                          shape: BoxShape.circle,
                          boxShadow: [AppTheme.mediumShadow],
                        ),
                        child: const Icon(Icons.local_shipping_rounded, size: 48, color: Colors.white),
                      ),
                      const SizedBox(height: 18),
                      Text(
                        _get('name').isNotEmpty ? _get('name') : 'Vendor',
                        style: const TextStyle(
                          fontSize: 22, fontWeight: FontWeight.w800, color: AppTheme.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 8),
                      _VerificationBadge(status: _verificationStatus, rejectionReason: _get('rejectionReason')),
                      const SizedBox(height: 32),

                      // Contact details
                      if (_get('phone').isNotEmpty)
                        _ProfileTile(icon: Icons.phone_rounded, label: 'Phone', value: _get('phone')),
                      if (_get('email').isNotEmpty)
                        _ProfileTile(icon: Icons.email_rounded, label: 'Email', value: _get('email')),
                      if (_get('city').isNotEmpty)
                        _ProfileTile(icon: Icons.location_city_rounded, label: 'City', value: _get('city')),
                      if (_get('state').isNotEmpty)
                        _ProfileTile(icon: Icons.map_rounded, label: 'State', value: _get('state')),

                      const SizedBox(height: 24),

                      // Personal Details / KYC docs
                      Align(
                        alignment: Alignment.centerLeft,
                        child: Padding(
                          padding: const EdgeInsets.only(left: 4, bottom: 10),
                          child: Text('Personal Details',
                            style: TextStyle(
                              fontSize: 13, fontWeight: FontWeight.w700,
                              color: Colors.grey[700], letterSpacing: 0.3,
                            )),
                        ),
                      ),
                      _DocumentTile(
                        label: 'Driving Licence',
                        url: _get('licenseUrl'),
                        icon: Icons.credit_card_rounded,
                      ),
                      _DocumentTile(
                        label: 'Aadhaar Card',
                        url: _get('aadhaarUrl'),
                        icon: Icons.badge_rounded,
                      ),
                      _DocumentTile(
                        label: 'Digital Signature',
                        url: _get('signatureUrl'),
                        icon: Icons.draw_rounded,
                      ),
                      const SizedBox(height: 28),

                      SizedBox(
                        width: double.infinity,
                        height: 52,
                        child: OutlinedButton.icon(
                          onPressed: () => _showSignOutDialog(context),
                          icon: const Icon(Icons.logout_rounded, color: AppTheme.errorColor),
                          label: const Text('Sign Out',
                            style: TextStyle(color: AppTheme.errorColor, fontWeight: FontWeight.w700)),
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: AppTheme.errorColor, width: 1.5),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),
                    ],
                  ),
                ),
              ),
      ),
    );
  }

  void _showSignOutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Sign Out', style: TextStyle(fontWeight: FontWeight.w700)),
        content: const Text('Are you sure you want to sign out?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel', style: TextStyle(color: AppTheme.textSecondary)),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(ctx);
              await _authService.signOut();
              if (mounted) {
                Navigator.pushAndRemoveUntil(
                  context,
                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                  (route) => false,
                );
              }
            },
            child: const Text('Sign Out',
              style: TextStyle(color: AppTheme.errorColor, fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
  }
}

class _VerificationBadge extends StatelessWidget {
  final String status;
  final String rejectionReason;
  const _VerificationBadge({required this.status, required this.rejectionReason});

  @override
  Widget build(BuildContext context) {
    late final Color color;
    late final IconData icon;
    late final String label;
    String? sub;
    switch (status) {
      case 'verified':
        color = AppTheme.successColor;
        icon = Icons.verified_rounded;
        label = 'Verified Vendor';
        break;
      case 'rejected':
        color = AppTheme.errorColor;
        icon = Icons.cancel_rounded;
        label = 'Verification Rejected';
        if (rejectionReason.isNotEmpty) sub = rejectionReason;
        break;
      case 'pending':
        color = AppTheme.warningColor;
        icon = Icons.hourglass_top_rounded;
        label = 'Verification Pending';
        sub = 'We\'ll notify you once the admin reviews your documents.';
        break;
      default:
        color = Colors.grey;
        icon = Icons.info_outline_rounded;
        label = 'KYC Incomplete';
        sub = 'Please contact support to complete your KYC.';
    }

    return Column(
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
          decoration: BoxDecoration(
            color: color.withAlpha(20),
            borderRadius: BorderRadius.circular(20),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, color: color, size: 16),
              const SizedBox(width: 4),
              Text(label, style: TextStyle(color: color, fontWeight: FontWeight.w700, fontSize: 13)),
            ],
          ),
        ),
        if (sub != null && sub.isNotEmpty) ...[
          const SizedBox(height: 6),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 30),
            child: Text(sub, textAlign: TextAlign.center,
              style: TextStyle(fontSize: 12, color: Colors.grey[600])),
          ),
        ],
      ],
    );
  }
}

class _ProfileTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  const _ProfileTile({required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [AppTheme.softShadow],
      ),
      child: Row(
        children: [
          Container(
            width: 42, height: 42,
            decoration: BoxDecoration(
              color: AppTheme.accentColor.withAlpha(15),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: AppTheme.accentColor, size: 22),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
                const SizedBox(height: 2),
                Text(value,
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AppTheme.textPrimary),
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _DocumentTile extends StatelessWidget {
  final String label;
  final String url;
  final IconData icon;
  const _DocumentTile({required this.label, required this.url, required this.icon});

  bool get _uploaded => url.isNotEmpty;

  void _preview(BuildContext context) {
    if (!_uploaded) return;
    showDialog(
      context: context,
      builder: (_) => Dialog(
        backgroundColor: Colors.black,
        insetPadding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            AppBar(
              backgroundColor: Colors.black,
              elevation: 0,
              title: Text(label, style: const TextStyle(color: Colors.white, fontSize: 15)),
              iconTheme: const IconThemeData(color: Colors.white),
              automaticallyImplyLeading: false,
              actions: [
                IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(context)),
              ],
            ),
            InteractiveViewer(
              child: Image.network(url, fit: BoxFit.contain),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () => _preview(context),
      borderRadius: BorderRadius.circular(16),
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [AppTheme.softShadow],
        ),
        child: Row(
          children: [
            Container(
              width: 42, height: 42,
              decoration: BoxDecoration(
                color: AppTheme.accentColor.withAlpha(15),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: AppTheme.accentColor, size: 22),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label,
                    style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
                  const SizedBox(height: 2),
                  Text(_uploaded ? 'Uploaded — tap to view' : 'Not uploaded',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: _uploaded ? AppTheme.textPrimary : Colors.grey,
                    )),
                ],
              ),
            ),
            Icon(
              _uploaded ? Icons.check_circle_rounded : Icons.error_outline_rounded,
              color: _uploaded ? AppTheme.successColor : Colors.orange,
              size: 22,
            ),
          ],
        ),
      ),
    );
  }
}
