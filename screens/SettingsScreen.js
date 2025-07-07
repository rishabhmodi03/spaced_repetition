import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { GlobalStyles, Colors, getButtonStyle } from '../styles/commonStyles';
import { clearAllData } from '../utils/storage'; // Import function to clear data
import { requestNotificationPermissions, cancelAllNotifications } from '../utils/notificationUtils'; // For permissions & clearing notifications

export default function SettingsScreen() {

  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "Are you sure you want to delete all topics and schedules? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All Data",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelAllNotifications(); // Cancel any pending notifications first
              await clearAllData();
              Alert.alert("Data Cleared", "All application data has been cleared.");
            } catch (error) {
              console.error("Error clearing data:", error);
              Alert.alert("Error", "Could not clear data.");
            }
          },
        },
      ]
    );
  };

  const handleRequestPermissions = async () => {
    const granted = await requestNotificationPermissions();
    if (granted) {
      Alert.alert("Permissions", "Notification permissions are granted.");
    } else {
      Alert.alert("Permissions", "Notification permissions were not granted. Please enable them in your device settings if you wish to receive reminders.");
    }
  };

  return (
    <View style={[GlobalStyles.container, styles.settingsContainer]}>
      <Text style={GlobalStyles.titleText}>App Settings</Text>

      <View style={styles.settingItem}>
        <Text style={styles.settingText}>Manage Notification Permissions</Text>
        <TouchableOpacity
            style={[getButtonStyle('secondary'), styles.settingsButton]}
            onPress={handleRequestPermissions}
        >
          <Text style={GlobalStyles.buttonText}>Check/Request Permissions</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.settingItem}>
        <Text style={styles.settingText}>Clear All Application Data</Text>
        <Text style={styles.warningText}>(Topics, Schedules, Notifications)</Text>
        <TouchableOpacity
            style={[getButtonStyle('danger'), styles.settingsButton]}
            onPress={handleClearData}
        >
          <Text style={GlobalStyles.buttonText}>Clear All Data</Text>
        </TouchableOpacity>
      </View>

      {/* Placeholder for future settings */}
      {/* <View style={styles.settingItem}>
        <Text style={styles.settingText}>Manage Custom Durations (Coming Soon)</Text>
      </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  settingsContainer: {
    // alignItems: 'center', // Let items take full width
  },
  settingItem: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  settingText: {
    fontSize: 17,
    color: Colors.text,
    marginBottom: 10,
    fontWeight: '600',
  },
  warningText: {
    fontSize: 13,
    color: Colors.darkGray,
    marginBottom: 15,
  },
  settingsButton: { // Override some global button styles if needed for this screen
    minWidth: '100%', // Make button take full width of its container
    paddingVertical: 10, // Slightly smaller padding
  }
});
