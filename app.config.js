export default {
  expo: {
    name: "hvac-app",
    slug: "hvac-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "hvacapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.nicholaslarson.hvacapp",
      infoPlist: {
        UIBackgroundModes: ["location", "fetch"],
        NSLocationAlwaysAndWhenInUseUsageDescription:
          "HVAC Pro needs your location to track technician positions while clocked in.",
        NSLocationWhenInUseUsageDescription:
          "HVAC Pro needs your location to show your position on the map.",
        NSLocationAlwaysUsageDescription:
          "HVAC Pro needs background location to track your position while working.",
      },
    },
    android: {
      package: "com.nicholaslarson.hvacapp",
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      permissions: [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION",
        "ACCESS_BACKGROUND_LOCATION",
        "FOREGROUND_SERVICE",
        "FOREGROUND_SERVICE_LOCATION",
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.ACCESS_BACKGROUND_LOCATION",
        "android.permission.FOREGROUND_SERVICE",
        "android.permission.FOREGROUND_SERVICE_LOCATION",
      ],
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000",
          },
        },
      ],
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission:
            "HVAC Pro needs your location to track technician positions while clocked in for optimized job scheduling.",
          locationAlwaysPermission:
            "HVAC Pro needs background location access to track your position while you're working.",
          locationWhenInUsePermission:
            "HVAC Pro needs your location to show your position on the map.",
          isAndroidBackgroundLocationEnabled: true,
          isIosBackgroundLocationEnabled: true,
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: "093bf6cf-96f1-4992-92af-ac14e1dd97b3",
      },
    },
    owner: "nicklarson2002",
  },
};
