import 'package:flutter/material.dart';
import 'package:smooth_page_indicator/smooth_page_indicator.dart';
import '../../config/theme.dart';
import '../../services/storage_service.dart';
import '../auth/login_screen.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen>
    with TickerProviderStateMixin {
  final _controller = PageController();
  int _currentPage = 0;

  late AnimationController _iconAnimController;
  late Animation<double> _iconBounce;

  @override
  void initState() {
    super.initState();
    _iconAnimController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);
    _iconBounce = Tween<double>(begin: 0, end: -12).animate(
      CurvedAnimation(parent: _iconAnimController, curve: Curves.easeInOut),
    );
  }

  final _pages = const [
    _PageData(
      icon: Icons.search_rounded,
      secondaryIcon: Icons.construction,
      title: 'Find Equipment',
      subtitle: 'Search JCB, Excavator, Crane & more\nheavy machines available near you',
      gradientColors: [Color(0xFFFF8C00), Color(0xFFFF6B00)],
      bgPattern: Icons.grid_view_rounded,
    ),
    _PageData(
      icon: Icons.auto_awesome_rounded,
      secondaryIcon: Icons.camera_alt_rounded,
      title: 'Smart Estimate',
      subtitle: 'Upload site photos & get AI-powered\ncost and time estimates instantly',
      gradientColors: [Color(0xFF1A1A2E), Color(0xFF16213E)],
      bgPattern: Icons.bubble_chart_rounded,
    ),
    _PageData(
      icon: Icons.local_shipping_rounded,
      secondaryIcon: Icons.location_on_rounded,
      title: 'Book & Track Live',
      subtitle: 'Book machines in one tap and\ntrack them in real-time on map',
      gradientColors: [Color(0xFF43A047), Color(0xFF2E7D32)],
      bgPattern: Icons.route_rounded,
    ),
  ];

  void _next() {
    if (_currentPage < _pages.length - 1) {
      _controller.nextPage(
        duration: const Duration(milliseconds: 400),
        curve: Curves.easeInOut,
      );
    } else {
      _finish();
    }
  }

  void _finish() async {
    await StorageService.setTourSeen();
    if (mounted) {
      Navigator.pushReplacement(
        context,
        PageRouteBuilder(
          pageBuilder: (_, __, ___) => const LoginScreen(),
          transitionsBuilder: (_, anim, __, child) =>
              FadeTransition(opacity: anim, child: child),
          transitionDuration: const Duration(milliseconds: 500),
        ),
      );
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    _iconAnimController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Animated background gradient
          AnimatedContainer(
            duration: const Duration(milliseconds: 400),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: _currentPage < _pages.length
                    ? [
                        _pages[_currentPage].gradientColors[0].withAlpha(15),
                        _pages[_currentPage].gradientColors[1].withAlpha(8),
                        Colors.white,
                      ]
                    : [Colors.white, Colors.white, Colors.white],
                stops: const [0.0, 0.3, 0.6],
              ),
            ),
          ),

          SafeArea(
            child: Column(
              children: [
                // Top bar with skip
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Page counter
                      Padding(
                        padding: const EdgeInsets.only(left: 16),
                        child: Text(
                          '${_currentPage + 1}/${_pages.length}',
                          style: TextStyle(
                            color: Colors.grey[400],
                            fontWeight: FontWeight.w600,
                            fontSize: 14,
                          ),
                        ),
                      ),
                      TextButton(
                        onPressed: _finish,
                        style: TextButton.styleFrom(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 20, vertical: 8),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(20),
                            side: BorderSide(color: Colors.grey[300]!),
                          ),
                        ),
                        child: const Text(
                          'Skip Tour',
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.grey,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                // Pages
                Expanded(
                  child: PageView.builder(
                    controller: _controller,
                    itemCount: _pages.length,
                    onPageChanged: (i) => setState(() => _currentPage = i),
                    itemBuilder: (_, i) => _OnboardingPageWidget(
                      data: _pages[i],
                      bounceAnimation: _iconBounce,
                      isActive: i == _currentPage,
                    ),
                  ),
                ),

                // Bottom section
                Padding(
                  padding: const EdgeInsets.fromLTRB(24, 0, 24, 16),
                  child: Column(
                    children: [
                      // Indicators
                      SmoothPageIndicator(
                        controller: _controller,
                        count: _pages.length,
                        effect: ExpandingDotsEffect(
                          dotColor: Colors.grey[300]!,
                          activeDotColor: _currentPage < _pages.length
                              ? _pages[_currentPage].gradientColors[0]
                              : AppTheme.primaryColor,
                          dotHeight: 8,
                          dotWidth: 8,
                          expansionFactor: 4,
                        ),
                      ),
                      const SizedBox(height: 32),

                      // Button
                      SizedBox(
                        width: double.infinity,
                        height: 58,
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 300),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(18),
                            gradient: LinearGradient(
                              colors: _currentPage < _pages.length
                                  ? _pages[_currentPage].gradientColors
                                  : [AppTheme.primaryColor, AppTheme.primaryColor],
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: (_currentPage < _pages.length
                                        ? _pages[_currentPage].gradientColors[0]
                                        : AppTheme.primaryColor)
                                    .withAlpha(80),
                                blurRadius: 16,
                                offset: const Offset(0, 6),
                              ),
                            ],
                          ),
                          child: ElevatedButton(
                            onPressed: _next,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.transparent,
                              shadowColor: Colors.transparent,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(18),
                              ),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(
                                  _currentPage == _pages.length - 1
                                      ? 'Get Started'
                                      : 'Next',
                                  style: const TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.white),
                                ),
                                const SizedBox(width: 8),
                                Icon(
                                  _currentPage == _pages.length - 1
                                      ? Icons.rocket_launch_rounded
                                      : Icons.arrow_forward_rounded,
                                  color: Colors.white,
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                    ],
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

class _PageData {
  final IconData icon;
  final IconData secondaryIcon;
  final String title;
  final String subtitle;
  final List<Color> gradientColors;
  final IconData bgPattern;

  const _PageData({
    required this.icon,
    required this.secondaryIcon,
    required this.title,
    required this.subtitle,
    required this.gradientColors,
    required this.bgPattern,
  });
}

class _OnboardingPageWidget extends StatelessWidget {
  final _PageData data;
  final Animation<double> bounceAnimation;
  final bool isActive;

  const _OnboardingPageWidget({
    required this.data,
    required this.bounceAnimation,
    required this.isActive,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 32),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Illustration area
          SizedBox(
            height: 280,
            child: Stack(
              alignment: Alignment.center,
              children: [
                // Background circle pattern
                Container(
                  width: 220,
                  height: 220,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: RadialGradient(
                      colors: [
                        data.gradientColors[0].withAlpha(20),
                        data.gradientColors[0].withAlpha(8),
                        Colors.transparent,
                      ],
                    ),
                  ),
                ),

                // Outer ring
                Container(
                  width: 200,
                  height: 200,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: data.gradientColors[0].withAlpha(30),
                      width: 2,
                    ),
                  ),
                ),

                // Floating secondary icons
                Positioned(
                  top: 20,
                  right: 40,
                  child: AnimatedBuilder(
                    listenable: bounceAnimation,
                    builder: (_, child) => Transform.translate(
                      offset: Offset(0, bounceAnimation.value * 0.7),
                      child: child,
                    ),
                    child: Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        color: data.gradientColors[0].withAlpha(20),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                            color: data.gradientColors[0].withAlpha(40)),
                      ),
                      child: Icon(data.secondaryIcon,
                          color: data.gradientColors[0], size: 24),
                    ),
                  ),
                ),

                Positioned(
                  bottom: 30,
                  left: 30,
                  child: AnimatedBuilder(
                    listenable: bounceAnimation,
                    builder: (_, child) => Transform.translate(
                      offset: Offset(0, -bounceAnimation.value * 0.5),
                      child: child,
                    ),
                    child: Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: data.gradientColors[1].withAlpha(15),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                            color: data.gradientColors[1].withAlpha(30)),
                      ),
                      child: Icon(data.bgPattern,
                          color: data.gradientColors[1].withAlpha(100),
                          size: 20),
                    ),
                  ),
                ),

                // Main icon with gradient background
                AnimatedBuilder(
                  listenable: bounceAnimation,
                  builder: (_, child) => Transform.translate(
                    offset: Offset(0, bounceAnimation.value),
                    child: child,
                  ),
                  child: Container(
                    width: 140,
                    height: 140,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: data.gradientColors,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: data.gradientColors[0].withAlpha(60),
                          blurRadius: 30,
                          offset: const Offset(0, 12),
                        ),
                      ],
                    ),
                    child: Icon(data.icon, size: 64, color: Colors.white),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 40),

          // Title
          Text(
            data.title,
            style: const TextStyle(
              fontSize: 30,
              fontWeight: FontWeight.w800,
              letterSpacing: -0.5,
            ),
          ),
          const SizedBox(height: 14),

          // Subtitle
          Text(
            data.subtitle,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 16,
              color: Colors.grey[500],
              height: 1.6,
              letterSpacing: 0.2,
            ),
          ),
        ],
      ),
    );
  }
}

class AnimatedBuilder extends AnimatedWidget {
  final Widget Function(BuildContext, Widget?) builder;
  final Widget? child;

  const AnimatedBuilder({
    super.key,
    required super.listenable,
    required this.builder,
    this.child,
  }) : super();

  Animation<double> get animation => listenable as Animation<double>;

  @override
  Widget build(BuildContext context) {
    return builder(context, child);
  }
}
