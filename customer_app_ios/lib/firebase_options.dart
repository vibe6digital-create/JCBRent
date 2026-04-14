import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      throw UnsupportedError('Web not supported in iOS app');
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.iOS:
        return ios;
      default:
        throw UnsupportedError(
          'DefaultFirebaseOptions are not supported for this platform.',
        );
    }
  }

  // Values from ios/Runner/GoogleService-Info.plist
  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyAZ82dZ_RyY5lGxYC7YXr754r_wkrc2VDA',
    appId: '1:776788969649:ios:ffc8ebd555e450ae24ba90',
    messagingSenderId: '776788969649',
    projectId: 'rentzoo-a39ea',
    storageBucket: 'rentzoo-a39ea.firebasestorage.app',
    iosBundleId: 'com.vibe6.heavyrent.customer',
  );
}
