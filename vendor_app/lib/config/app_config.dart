class AppConfig {
  static const String appName = 'HeavyRent Vendor';

  // Production: Firebase Functions URL (via Hosting rewrite)
  static const String apiBaseUrl = 'https://rentzoo-a39ea.web.app/api';

  // For local development, temporarily switch to:
  // static const String apiBaseUrl = 'http://10.0.2.2:3000/api'; // Android emulator
  // static const String apiBaseUrl = 'http://192.168.68.69:3000/api'; // real device same WiFi

  static const String firebaseProjectId = 'rentzoo-a39ea';
  static const String firebaseStorageBucket = 'rentzoo-a39ea.firebasestorage.app';

  // Google Maps API key — same key used in AndroidManifest.xml
  static const String googleMapsApiKey = 'AIzaSyAJ-cep-pgl0iO2qcZ_UlZ35xBDac6DjUY';
}
