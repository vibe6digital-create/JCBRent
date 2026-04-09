import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) throw UnsupportedError('Web not supported');
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      default:
        throw UnsupportedError('Unsupported platform');
    }
  }

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyAj1xSTTivVN9qfXZi0uqFJBRIQeg3b_Ns',
    appId: '1:776788969649:android:e7ea701c1b89dcae24ba90',
    messagingSenderId: '776788969649',
    projectId: 'rentzoo-a39ea',
    storageBucket: 'rentzoo-a39ea.firebasestorage.app',
  );

  // iOS config — register bundle ID com.vibe6.heavyrent.vendor in Firebase Console
  // (rentzoo-a39ea project) then replace apiKey and appId below
  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyAZ82dZ_RyY5lGxYC7YXr754r_wkrc2VDA',
    appId: '1:776788969649:ios:ffc8ebd555e450ae24ba90',
    messagingSenderId: '776788969649',
    projectId: 'rentzoo-a39ea',
    storageBucket: 'rentzoo-a39ea.firebasestorage.app',
    iosBundleId: 'com.vibe6.heavyrent.vendor',
  );
}
