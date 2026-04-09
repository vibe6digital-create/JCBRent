class AppConfig {
  static const String appName = 'HeavyRent';

  // For local development: 'http://10.0.2.2:3000/api' (Android emulator)
  // For real device on same WiFi: 'http://YOUR_PC_IP:3000/api'
  // For production: replace with your deployed backend URL
  static const String apiBaseUrl = 'http://10.0.2.2:3000/api';

  static const String firebaseProjectId = 'rentzoo-a39ea';
  static const String firebaseStorageBucket = 'rentzoo-a39ea.firebasestorage.app';

  // Google Maps API key — add this to AndroidManifest.xml too
  static const String googleMapsApiKey = 'AIzaSyAJ-cep-pgl0iO2qcZ_UlZ35xBDac6DjUY';
}
