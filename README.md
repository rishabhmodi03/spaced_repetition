# Spaced Repetition Android App

## Overview

This is a simple offline Android application designed to help users learn and retain information using the spaced repetition technique. Users can add topics they want to study, and the app will schedule revisions at increasing intervals. Reminders are sent on the day a revision is due.

The app allows users to:
- Add new topics.
- Select from predefined revision strategies (e.g., "Standard", "Short Term") or create custom ones.
- View scheduled revisions on a calendar.
- Receive notifications when a topic is due for revision.
- Mark topics as revised.

The app is built using Kotlin and utilizes Android Architecture Components like Room for database storage, ViewModel, LiveData, and Navigation Component for UI flow.

## Features

- **Topic Management:** Create, edit, and delete study topics.
- **Revision Strategies:**
    - Use default strategies (e.g., 1, 3, 7, 14, 30 days).
    - Create and manage custom revision interval patterns.
- **Spaced Repetition Scheduling:** Automatically calculates and schedules revision dates.
- **Calendar View:** See which topics are due on any given day.
- **Notifications:** Receive reminders for topics due for revision.
- **Offline First:** All data is stored locally on the device using Room.

## Code Workflow & Architecture

The app follows a standard Android architecture pattern, leveraging Android Architecture Components.

### Key Components:

-   **`MainActivity.kt`**: The main entry point of the app. Hosts the `NavHostFragment` for managing UI navigation and sets up the BottomNavigationView.
-   **UI Layer (`ui` package):**
    -   **Fragments** (`TopicListFragment`, `AddEditTopicFragment`, `CalendarFragment`, `settings.ManageRevisionSettingsFragment`): Represent different screens in the app. They observe data from ViewModels and update the UI. User interactions are typically passed to the ViewModel.
    -   **ViewModels** (`TopicViewModel`): Prepare and manage data for the UI. They survive configuration changes and fetch data from the repository (indirectly, via DAOs in this case). Logic for UI events and navigation triggers often resides here.
    -   **Adapters** (`TopicAdapter`, `CalendarTopicAdapter`, `RevisionSettingAdapter`): Manage how data is displayed in `RecyclerView`s.
    -   **Layouts (`res/layout`):** XML files defining the structure of each screen and list item.
    -   **Navigation (`res/navigation/nav_graph.xml`):** Defines the navigation flow between different fragments.
-   **Data Layer (`data` package):**
    -   **Room Database (`AppDatabase.kt`):** The main database class that defines entities, DAOs, and provides access to the database instance.
    -   **DAOs (Data Access Objects)** (`TopicDao.kt`, `RevisionSettingDao.kt`): Interfaces that define methods for interacting with the database tables (CRUD operations, queries). Room generates the implementation.
    -   **Entities (`model` package - `Topic.kt`, `RevisionSetting.kt`):** Kotlin data classes representing the structure of database tables.
    -   **`Converters.kt`**: Handles type conversions for Room (e.g., storing a `List<Long>` as a String).
-   **Logic/Utils Layer (`utils` package):**
    -   **`SpacedRepetitionScheduler.kt`**: Contains the core logic for calculating revision dates and updating topic schedules.
    -   **`AlarmSchedulerUtil.kt`**: Manages scheduling and canceling alarms using Android's `AlarmManager`.
    -   **`AlarmReceiver.kt`**: A `BroadcastReceiver` that listens for scheduled alarms and triggers notifications.

### Data Flow Example (Adding a Topic):

1.  User clicks "Add Topic" FAB in `TopicListFragment`.
2.  `TopicListFragment` tells `TopicViewModel` to navigate to the add topic screen.
3.  Navigation Component loads `AddEditTopicFragment`.
4.  User enters topic details and selects a revision strategy.
5.  On "Save", `AddEditTopicFragment` calls a method in `TopicViewModel` (e.g., `insertTopic`).
6.  `TopicViewModel` creates a `Topic` object.
7.  `TopicViewModel` uses `SpacedRepetitionScheduler` to calculate initial revision dates for the new topic.
8.  `TopicViewModel` calls the appropriate method in `TopicDao` (e.g., `insertTopic()`) to save the topic to the Room database.
9.  `TopicViewModel` uses `AlarmSchedulerUtil` to schedule a reminder for the topic's first revision.
10. `TopicListFragment` (and other relevant UI components) observes `LiveData` from `TopicViewModel` which is backed by the database. When the new topic is inserted, the `LiveData` updates, and the UI refreshes automatically.

## Building the `.apk`

To build the `.apk` file for this application, you will need Android Studio.

**Prerequisites:**
- Android Studio (latest stable version recommended - e.g., "Flamingo" or newer)
- Android SDK installed (typically comes with Android Studio)
- An Android device or emulator (API Level 24 or higher recommended, as set in `app/build.gradle` `minSdk`)

**Steps:**

1.  **Clone or Download the Project:**
    If the project is in a Git repository:
    ```bash
    git clone <repository_url>
    cd <project_directory>
    ```
    If you have a .zip file, extract it.

2.  **Open the Project in Android Studio:**
    -   Launch Android Studio.
    -   Select "Open" (or "Open an Existing Project").
    -   Navigate to the root directory of the cloned/extracted project (the one containing `settings.gradle` and the `app` folder) and click "OK".

3.  **Let Android Studio Sync and Build:**
    -   Android Studio will automatically start syncing the project with Gradle files. This might take a few minutes, especially on the first open, as it might download necessary dependencies (like Gradle itself, Android SDK components, or libraries).
    -   You can monitor the progress in the "Build" tool window (usually at the bottom of Android Studio).

4.  **Build the APK:**
    -   Once the Gradle sync is successful and there are no build errors, you can build the APK.
    -   Go to the menu: **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
    -   Android Studio will start the build process.
    -   After the build is complete, a notification will appear in the bottom-right corner of Android Studio: "APK(s) generated successfully..."
    -   Click the **"locate"** link in the notification. This will open your file explorer to the directory where the APK is saved.
    -   The APK file is typically located in: `<project_root>/app/build/outputs/apk/debug/app-debug.apk` (for a debug build).

5.  **Install the APK on a Device/Emulator:**
    -   **Using Android Studio:**
        -   Connect your Android device to your computer via USB (ensure USB debugging is enabled on the device).
        -   Or, start an Android emulator from Android Studio (Tools > AVD Manager).
        -   Select your device/emulator from the dropdown menu in the toolbar (next to the "Run" button - green play icon).
        -   Click the "Run" button (green play icon ▶️). Android Studio will build, install, and run the app on the selected device/emulator.
    -   **Manually:**
        -   Copy the `app-debug.apk` file to your Android device.
        -   On your device, open a file manager, navigate to where you copied the APK, and tap on it to install. You might need to enable "Install from unknown sources" in your device settings.

## Understanding the Code & Further Development

**Key areas to explore:**

-   **`model` package:** Understand the structure of `Topic` and `RevisionSetting` data classes. These are the core data elements.
-   **`data` package:**
    -   `AppDatabase.kt`: See how Room is initialized.
    -   `TopicDao.kt` & `RevisionSettingDao.kt`: Examine the SQL queries (even if abstracted by Room annotations) to see how data is fetched and modified.
-   **`ui.viewmodel.TopicViewModel.kt`:** This is a central piece connecting UI to data. Observe how it uses DAOs and schedulers.
-   **`utils.SpacedRepetitionScheduler.kt`:** The heart of the spaced repetition logic.
-   **Fragment classes in the `ui` package:** Each fragment handles a specific screen. Look at how they use `ViewBinding`, observe `LiveData` from the `TopicViewModel`, and handle user interactions.
-   **`res/layout` & `res/navigation`:** Explore the XML files to understand UI structure and navigation flow.

**Possible future enhancements:**
-   User-configurable notification times.
-   Option to import/export topics.
-   More detailed statistics on revision history.
-   Backup and restore functionality.
-   Dark theme improvements.
-   Widget for upcoming revisions.
-   Proper handling for `SCHEDULE_EXACT_ALARM` permission request flow.
-   Runtime permission request for `POST_NOTIFICATIONS` (Android 13+).

This README provides a starting point for understanding and building the Spaced Repetition app. Happy coding!
