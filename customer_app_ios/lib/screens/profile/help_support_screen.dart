import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../config/theme.dart';

class HelpSupportScreen extends StatelessWidget {
  const HelpSupportScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Help & Support')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Contact card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [AppTheme.primaryColor, Color(0xFFFF6B00)],
                ),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                children: [
                  const Icon(Icons.support_agent, size: 48, color: Colors.white),
                  const SizedBox(height: 12),
                  const Text('Need Help?', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  Text('We\'re here to help you 24/7',
                    style: TextStyle(color: Colors.white.withAlpha(200))),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _ContactButton(icon: Icons.phone, label: 'Call Us', onTap: () => launchUrl(Uri.parse('tel:+919876543210'))),
                      const SizedBox(width: 16),
                      _ContactButton(icon: Icons.email, label: 'Email', onTap: () => launchUrl(Uri.parse('mailto:support@heavyrent.in'))),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            const Text('Frequently Asked Questions',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),

            _FaqTile(
              question: 'How do I book a machine?',
              answer: 'Browse machines from the home screen or search for specific equipment. Select a machine, choose your dates, and submit a booking request. The vendor will confirm your booking.',
            ),
            _FaqTile(
              question: 'What is Smart Estimate?',
              answer: 'Smart Estimate is our AI-powered tool that calculates the estimated time and cost for your project based on work type, area size, and soil conditions. Upload site photos for better accuracy.',
            ),
            _FaqTile(
              question: 'How can I track my machine?',
              answer: 'Once your booking status changes to "In Progress", you\'ll see a "Track Vehicle" button. Tap it to see the real-time location of the machine on its way to your work site.',
            ),
            _FaqTile(
              question: 'What if the vendor rejects my booking?',
              answer: 'If a vendor cannot fulfill your booking, you\'ll receive a notification. You can then search for other available machines in your area.',
            ),
            _FaqTile(
              question: 'How do I cancel a booking?',
              answer: 'Contact the vendor directly through the app or call our support team. Cancellation policies may vary depending on the vendor and timing.',
            ),
            _FaqTile(
              question: 'Is there a minimum booking duration?',
              answer: 'Minimum booking duration depends on the vendor. Most vendors accept hourly bookings (minimum 4 hours) or daily bookings.',
            ),
            const SizedBox(height: 16),

            // App version
            Center(
              child: Column(
                children: [
                  Text('HeavyRent v1.0.0', style: TextStyle(color: Colors.grey[500])),
                  const SizedBox(height: 4),
                  Text('Made with love by Vibe6 Digital', style: TextStyle(color: Colors.grey[400], fontSize: 12)),
                ],
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}

class _ContactButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  const _ContactButton({required this.icon, required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
        decoration: BoxDecoration(
          color: Colors.white.withAlpha(30),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            Icon(icon, color: Colors.white, size: 20),
            const SizedBox(width: 8),
            Text(label, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
          ],
        ),
      ),
    );
  }
}

class _FaqTile extends StatelessWidget {
  final String question;
  final String answer;
  const _FaqTile({required this.question, required this.answer});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: ExpansionTile(
        tilePadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        childrenPadding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
        leading: const Icon(Icons.help_outline, color: AppTheme.primaryColor),
        title: Text(question, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15)),
        children: [
          Text(answer, style: TextStyle(color: Colors.grey[700], height: 1.5)),
        ],
      ),
    );
  }
}
