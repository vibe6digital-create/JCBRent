import 'dart:async';
import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../../config/theme.dart';
import '../../services/api_service.dart';
import '../../services/auth_service.dart';
import '../home/vendor_home_screen.dart';
import 'login_screen.dart';

class PendingApprovalScreen extends StatefulWidget {
  const PendingApprovalScreen({super.key});

  @override
  State<PendingApprovalScreen> createState() => _PendingApprovalScreenState();
}

class _PendingApprovalScreenState extends State<PendingApprovalScreen>
    with SingleTickerProviderStateMixin {
  final _auth = AuthService();
  Timer? _timer;
  bool _isChecking = false;
  String _status = 'pending';
  String _rejectionReason = '';
  late AnimationController _pulseCtrl;
  late Animation<double> _pulse;

  @override
  void initState() {
    super.initState();
    _pulseCtrl = AnimationController(vsync: this, duration: const Duration(seconds: 2))
      ..repeat(reverse: true);
    _pulse = Tween<double>(begin: 0.92, end: 1.0).animate(
      CurvedAnimation(parent: _pulseCtrl, curve: Curves.easeInOut),
    );
    _checkStatus();
    // Auto-check every 30 seconds
    _timer = Timer.periodic(const Duration(seconds: 30), (_) => _checkStatus());
  }

  @override
  void dispose() {
    _timer?.cancel();
    _pulseCtrl.dispose();
    super.dispose();
  }

  Future<void> _checkStatus() async {
    if (_isChecking) return;
    setState(() => _isChecking = true);
    try {
      // Always refresh the Firebase token before polling so it never expires silently
      final firebaseUser = FirebaseAuth.instance.currentUser;
      if (firebaseUser != null) {
        final fresh = await firebaseUser.getIdToken(true); // force refresh
        ApiService().setToken(fresh);
      }
      final response = await _auth.getProfile();
      final user = response['user'] ?? response;
      final status = (user['verificationStatus'] ?? 'pending').toString();
      final reason = (user['rejectionReason'] ?? '').toString();
      if (!mounted) return;
      setState(() {
        _status = status;
        _rejectionReason = reason;
        _isChecking = false;
      });
      if (status == 'verified') {
        await Future.delayed(const Duration(milliseconds: 600));
        if (mounted) {
          Navigator.pushAndRemoveUntil(
            context,
            MaterialPageRoute(builder: (_) => const VendorHomeScreen()),
            (route) => false,
          );
        }
      }
    } catch (_) {
      if (mounted) setState(() => _isChecking = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF1A1A2E),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(28),
          child: Column(
            children: [
              const Spacer(),
              ScaleTransition(
                scale: _pulse,
                child: Container(
                  width: 110, height: 110,
                  decoration: BoxDecoration(
                    color: _statusColor.withAlpha(30),
                    shape: BoxShape.circle,
                    border: Border.all(color: _statusColor.withAlpha(120), width: 2),
                  ),
                  child: Icon(_statusIcon, size: 52, color: _statusColor),
                ),
              ),
              const SizedBox(height: 32),
              Text(
                _statusTitle,
                style: const TextStyle(
                  fontSize: 26, fontWeight: FontWeight.w800,
                  color: Colors.white, height: 1.2,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 14),
              Text(
                _statusBody,
                style: TextStyle(fontSize: 15, color: Colors.grey[400], height: 1.5),
                textAlign: TextAlign.center,
              ),
              if (_status == 'rejected' && _rejectionReason.isNotEmpty) ...[
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppTheme.errorColor.withAlpha(20),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppTheme.errorColor.withAlpha(80)),
                  ),
                  child: Text(
                    _rejectionReason,
                    style: const TextStyle(color: Colors.redAccent, fontSize: 14),
                    textAlign: TextAlign.center,
                  ),
                ),
              ],
              const SizedBox(height: 40),
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton.icon(
                  onPressed: _isChecking ? null : _checkStatus,
                  icon: _isChecking
                      ? const SizedBox(width: 18, height: 18,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Icon(Icons.refresh_rounded),
                  label: Text(_isChecking ? 'Checking…' : 'Check Status'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _statusColor,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    elevation: 0,
                  ),
                ),
              ),
              const SizedBox(height: 14),
              TextButton(
                onPressed: () async {
                  await _auth.signOut();
                  if (mounted) {
                    Navigator.pushAndRemoveUntil(
                      context,
                      MaterialPageRoute(builder: (_) => const LoginScreen()),
                      (route) => false,
                    );
                  }
                },
                child: const Text('Sign Out', style: TextStyle(color: Colors.grey)),
              ),
              const Spacer(),
            ],
          ),
        ),
      ),
    );
  }

  Color get _statusColor {
    if (_status == 'verified') return AppTheme.successColor;
    if (_status == 'rejected') return AppTheme.errorColor;
    return AppTheme.warningColor;
  }

  IconData get _statusIcon {
    if (_status == 'verified') return Icons.verified_rounded;
    if (_status == 'rejected') return Icons.cancel_rounded;
    return Icons.hourglass_top_rounded;
  }

  String get _statusTitle {
    if (_status == 'verified') return 'You\'re Approved!';
    if (_status == 'rejected') return 'Verification Rejected';
    return 'Profile Under Review';
  }

  String get _statusBody {
    if (_status == 'verified') return 'Welcome to Rentzoo! Opening your dashboard…';
    if (_status == 'rejected') return 'Your documents were not accepted. Please contact support or re-register.';
    return 'Our team is reviewing your documents.\nThis usually takes 1–2 business days.\n\nWe\'ll notify you as soon as it\'s approved.';
  }
}
