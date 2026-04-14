import 'package:flutter/material.dart';
import '../../config/theme.dart';
import '../../services/storage_service.dart';
import '../../services/auth_service.dart';
import '../booking/bookings_list_screen.dart';
import '../estimate/my_estimates_screen.dart';
import '../notifications/notifications_screen.dart';
import '../auth/login_screen.dart';
import 'edit_profile_screen.dart';
import 'help_support_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  Map<String, String> _profile = {};
  bool _isLoading = true;
  final _authService = AuthService();

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    // Load from local storage first (fast)
    final local = await StorageService.getUserProfile();
    if (mounted && local['name']!.isNotEmpty) {
      setState(() { _profile = local; _isLoading = false; });
    }

    // Always fetch fresh from API
    try {
      final response = await _authService.getProfile();
      final user = response['user'] ?? response;
      final fresh = {
        'name':  user['name']?.toString() ?? '',
        'phone': user['phone']?.toString() ?? '',
        'email': user['email']?.toString() ?? '',
        'city':  user['city']?.toString() ?? '',
        'state': user['state']?.toString() ?? '',
      };
      // Save to local storage for next time
      await StorageService.saveUserProfile(
        name:  fresh['name']!,
        phone: fresh['phone']!,
        email: fresh['email']!,
        city:  fresh['city']!,
        state: fresh['state']!,
      );
      if (mounted) setState(() { _profile = fresh; _isLoading = false; });
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const Center(child: CircularProgressIndicator());

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Profile'),
        automaticallyImplyLeading: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.edit),
            onPressed: () async {
              await Navigator.push(context,
                MaterialPageRoute(builder: (_) => EditProfileScreen(profile: _profile)));
              _loadProfile();
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Profile header
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: AppTheme.primaryColor,
                borderRadius: const BorderRadius.vertical(bottom: Radius.circular(32)),
              ),
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 44,
                    backgroundColor: Colors.white.withAlpha(50),
                    child: Text(
                      (_profile['name'] ?? 'R')[0].toUpperCase(),
                      style: const TextStyle(fontSize: 36, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                  ),
                  const SizedBox(height: 14),
                  Text(_profile['name'] ?? '',
                    style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white)),
                  const SizedBox(height: 4),
                  Text(_profile['phone'] ?? '',
                    style: TextStyle(fontSize: 16, color: Colors.white.withAlpha(200))),
                  const SizedBox(height: 4),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.white.withAlpha(30),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.location_on, color: Colors.white, size: 14),
                        const SizedBox(width: 4),
                        Text('${_profile['city']}, ${_profile['state']}',
                          style: const TextStyle(color: Colors.white, fontSize: 13)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Profile info cards
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Card(
                child: Column(
                  children: [
                    _InfoTile(icon: Icons.email, label: 'Email', value: _profile['email'] ?? ''),
                    const Divider(height: 1, indent: 56),
                    _InfoTile(icon: Icons.location_city, label: 'City', value: _profile['city'] ?? ''),
                    const Divider(height: 1, indent: 56),
                    _InfoTile(icon: Icons.map, label: 'State', value: _profile['state'] ?? ''),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Menu items
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Card(
                child: Column(
                  children: [
                    _MenuTile(
                      icon: Icons.calendar_today,
                      label: 'My Bookings',
                      subtitle: 'View booking history',
                      onTap: () => Navigator.push(context,
                        MaterialPageRoute(builder: (_) => const BookingsListScreen())),
                    ),
                    const Divider(height: 1, indent: 56),
                    _MenuTile(
                      icon: Icons.auto_awesome,
                      label: 'My Estimates',
                      subtitle: 'View past estimates',
                      onTap: () => Navigator.push(context,
                        MaterialPageRoute(builder: (_) => const MyEstimatesScreen())),
                    ),
                    const Divider(height: 1, indent: 56),
                    _MenuTile(
                      icon: Icons.notifications,
                      label: 'Notifications',
                      subtitle: 'View all notifications',
                      onTap: () => Navigator.push(context,
                        MaterialPageRoute(builder: (_) => const NotificationsScreen())),
                    ),
                    const Divider(height: 1, indent: 56),
                    _MenuTile(
                      icon: Icons.help_outline,
                      label: 'Help & Support',
                      subtitle: 'FAQ, contact us',
                      onTap: () => Navigator.push(context,
                        MaterialPageRoute(builder: (_) => const HelpSupportScreen())),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Logout
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: () => _showLogoutDialog(context),
                  icon: const Icon(Icons.logout, color: AppTheme.errorColor),
                  label: const Text('Sign Out', style: TextStyle(color: AppTheme.errorColor)),
                  style: OutlinedButton.styleFrom(
                    side: BorderSide(color: AppTheme.errorColor.withAlpha(100)),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  void _showLogoutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Sign Out'),
        content: const Text('Are you sure you want to sign out?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              await StorageService.clearAll();
              if (context.mounted) {
                Navigator.of(context).pushAndRemoveUntil(
                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                  (route) => false,
                );
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.errorColor),
            child: const Text('Sign Out'),
          ),
        ],
      ),
    );
  }
}

class _InfoTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  const _InfoTile({required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Container(
        width: 40, height: 40,
        decoration: BoxDecoration(
          color: AppTheme.primaryColor.withAlpha(15),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon, color: AppTheme.primaryColor, size: 20),
      ),
      title: Text(label, style: TextStyle(color: Colors.grey[500], fontSize: 12)),
      subtitle: Text(value, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500)),
    );
  }
}

class _MenuTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final String subtitle;
  final VoidCallback onTap;
  const _MenuTile({required this.icon, required this.label, required this.subtitle, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Container(
        width: 40, height: 40,
        decoration: BoxDecoration(
          color: AppTheme.primaryColor.withAlpha(15),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon, color: AppTheme.primaryColor, size: 20),
      ),
      title: Text(label, style: const TextStyle(fontWeight: FontWeight.w600)),
      subtitle: Text(subtitle, style: TextStyle(color: Colors.grey[500], fontSize: 12)),
      trailing: const Icon(Icons.chevron_right, color: Colors.grey),
      onTap: onTap,
    );
  }
}
