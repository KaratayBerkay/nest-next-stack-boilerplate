plugins {
    id("com.android.application")
    // The Flutter Gradle Plugin must be applied after the Android and Kotlin Gradle plugins.
    id("dev.flutter.flutter-gradle-plugin")
}

import java.util.Properties
import java.io.FileInputStream

val keystoreProperties = Properties().apply {
    val f = rootProject.file("key.properties")
    if (f.exists()) load(FileInputStream(f))
}
val hasReleaseKeystore = rootProject.file("key.properties").exists()

// A release build with no key.properties used to fall back to the debug
// keystore *silently* (MOB-047). Say so on every such build, and let CI /
// store builds make it fatal:
//   flutter build apk --release --android-project-arg=requireReleaseSigning=true
// Scoped to release tasks (assembleRelease/bundleRelease) so plain debug
// builds and `flutter run` stay quiet.
val buildingRelease = gradle.startParameter.taskNames.any {
    it.contains("release", ignoreCase = true)
}
if (!hasReleaseKeystore && buildingRelease) {
    val required = (project.findProperty("requireReleaseSigning") as String?) == "true"
    val message =
        "android/key.properties not found — this release build is signed with the DEBUG " +
            "keystore and must not be distributed (README § Release builds)"
    if (required) throw GradleException(message)
    logger.warn("WARNING: $message")
}

android {
    namespace = "tr.gen.eys.app"
    compileSdk = flutter.compileSdkVersion
    ndkVersion = flutter.ndkVersion

    compileOptions {
        isCoreLibraryDesugaringEnabled = true
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    defaultConfig {
        // TODO: Specify your own unique Application ID (https://developer.android.com/studio/build/application-id.html).
        applicationId = "tr.gen.eys.app"
        // You can update the following values to match your application needs.
        // For more information, see: https://flutter.dev/to/review-gradle-config.
        minSdk = flutter.minSdkVersion
        targetSdk = flutter.targetSdkVersion
        versionCode = flutter.versionCode
        versionName = flutter.versionName
    }

    signingConfigs {
        create("release") {
            keyAlias = keystoreProperties["keyAlias"] as String?
            keyPassword = keystoreProperties["keyPassword"] as String?
            storeFile = (keystoreProperties["storeFile"] as String?)?.let { file(it) }
            storePassword = keystoreProperties["storePassword"] as String?
        }
    }

    buildTypes {
        release {
            signingConfig = if (hasReleaseKeystore)
                signingConfigs.getByName("release")
            else
                signingConfigs.getByName("debug")
        }
    }

    lint {
        // stripe_android's lint classpath references play-services-tapandpay,
        // which Google does not publish publicly — lintVitalAnalyzeRelease can
        // never resolve it, so release lint-vital must be off (flutter_stripe FAQ).
        checkReleaseBuilds = false
    }
}

kotlin {
    compilerOptions {
        jvmTarget = org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17
    }
}

dependencies {
    coreLibraryDesugaring("com.android.tools:desugar_jdk_libs:2.1.5")
}

flutter {
    source = "../.."
}
