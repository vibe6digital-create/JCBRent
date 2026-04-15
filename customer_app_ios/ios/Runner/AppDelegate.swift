import UIKit
import Flutter
import FirebaseCore
import FirebaseMessaging
import GoogleMaps

@UIApplicationMain
@objc class AppDelegate: FlutterAppDelegate {
  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    GMSServices.provideAPIKey("AIzaSyAJ-cep-pgl0iO2qcZ_UlZ35xBDac6DjUY")
    FirebaseApp.configure()
    GeneratedPluginRegistrant.register(with: self)

    // Set FCM delegate
    Messaging.messaging().delegate = self

    // Request provisional notifications (shows in Notification Center without prompting)
    if #available(iOS 10.0, *) {
      UNUserNotificationCenter.current().delegate = self as? UNUserNotificationCenterDelegate
      let authOptions: UNAuthorizationOptions = [.alert, .badge, .sound]
      UNUserNotificationCenter.current().requestAuthorization(options: authOptions) { _, _ in }
    }
    application.registerForRemoteNotifications()

    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

  // Receive APNs token and pass to FCM
  override func application(_ application: UIApplication,
                             didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
    Messaging.messaging().apnsToken = deviceToken
    super.application(application, didRegisterForRemoteNotificationsWithDeviceToken: deviceToken)
  }
}

extension AppDelegate: MessagingDelegate {
  func messaging(_ messaging: Messaging, didReceiveRegistrationToken fcmToken: String?) {
    // FCM token refreshed — Flutter plugin handles saving via firebase_messaging
  }
}
