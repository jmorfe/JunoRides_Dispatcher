import AuthenticationServices
import Firebase
import GoogleMaps
import GooglePlaces
import React
import ReactAppDependencyProvider
import React_RCTAppDelegate
import SafariServices
import UIKit
import UserNotifications

@main
class AppDelegate: UIResponder, UIApplicationDelegate, MessagingDelegate, UNUserNotificationCenterDelegate {
    var window: UIWindow?

    var reactNativeDelegate: ReactNativeDelegate?
    var reactNativeFactory: RCTReactNativeFactory?

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
    ) -> Bool {
        // Configure Firebase
        FirebaseApp.configure()
        Messaging.messaging().delegate = self

        // Required for notifee and foreground notification display
        UNUserNotificationCenter.current().delegate = self

        // Configure Google Maps/Places
        if let googlePlacesKey = Bundle.main.object(
            forInfoDictionaryKey: "PROJECT_GOOGLE_PLACE_KEY") as? String
        {
            GMSServices.provideAPIKey(googlePlacesKey)
            GMSPlacesClient.provideAPIKey(googlePlacesKey)
        }

        let delegate = ReactNativeDelegate()
        let factory = RCTReactNativeFactory(delegate: delegate)
        delegate.dependencyProvider = RCTAppDependencyProvider()

        reactNativeDelegate = delegate
        reactNativeFactory = factory

        window = UIWindow(frame: UIScreen.main.bounds)

        factory.startReactNative(
            withModuleName: "RoyoDriverApp",
            in: window,
            launchOptions: launchOptions
        )

        return true
    }

    // Allow notifee/Firebase notifications to display when app is in the foreground
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        completionHandler([.badge, .sound, .banner, .list])
    }

    // Required by UNUserNotificationCenterDelegate — lets notifee handle the tap event
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse,
        withCompletionHandler completionHandler: @escaping () -> Void
    ) {
        completionHandler()
    }

    func application(
        _ app: UIApplication,
        open url: URL,
        options: [UIApplication.OpenURLOptionsKey: Any] = [:]
    ) -> Bool {
        return RCTLinkingManager.application(app, open: url, options: options)

    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Clear pasteboard
        UIPasteboard.general.string = ""
    }

    func application(
        _ application: UIApplication,
        continue userActivity: NSUserActivity,
        restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
    ) -> Bool {
        return RCTLinkingManager.application(
            application,
            continue: userActivity,
            restorationHandler: restorationHandler
        )
    }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
    override func sourceURL(for bridge: RCTBridge) -> URL? {
        self.bundleURL()
    }

    override func bundleURL() -> URL? {
        #if DEBUG
            RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
        #else
            Bundle.main.url(forResource: "main", withExtension: "jsbundle")
        #endif
    }
}
