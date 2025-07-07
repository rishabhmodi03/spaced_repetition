import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, TouchableOpacity } from 'react-native'; // Removed Button
import { saveTopic, saveRevisionInstance } from '../utils/storage';
import { getISODateString, addDaysToDate } from '../utils/dateUtils';
import { DEFAULT_DURATIONS_DAYS } from '../constants/appConstants';
import { requestNotificationPermissions, scheduleRevisionNotification } from '../utils/notificationUtils';
import { GlobalStyles, Colors, getButtonStyle } from '../styles/commonStyles'; // Import common styles


export default function AddTopicScreen({ navigation }) {
  const [topicName, setTopicName] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(DEFAULT_DURATIONS_DAYS[0]);

  useEffect(() => {
    // Request permissions when the component mounts or focuses
    // This could also be triggered by a button in settings or a one-time App.js effect
    requestNotificationPermissions();
  }, []);

  const handleSaveTopic = async () => {
    const trimmedName = topicName.trim();
    if (trimmedName) {
      try {
        const newTopicData = {
          name: trimmedName,
          isArchived: false,
          // id and createdAt will be added by saveTopic
        };
        const savedTopic = await saveTopic(newTopicData); // saveTopic now returns the saved object

        if (savedTopic && savedTopic.id) {
          // Schedule the first revision using the selected duration
          const today = new Date();
          const firstRevisionDate = addDaysToDate(today, selectedDuration); // Use selectedDuration
          const firstRevisionDateString = getISODateString(firstRevisionDate);

          // Schedule the notification
          const notificationId = await scheduleRevisionNotification(
            savedTopic.name,
            firstRevisionDate, // Pass the Date object
            savedTopic.id
          );

          const firstRevisionInstance = {
            topicId: savedTopic.id,
            topicName: savedTopic.name, // Denormalize for easy display
            scheduledDate: firstRevisionDateString,
            isCompleted: false,
            notificationId: notificationId, // Store the notification ID
          };
          await saveRevisionInstance(firstRevisionInstance);

          let alertMessage = `"${trimmedName}" saved. Next revision in ${selectedDuration} day(s).`;
          if (notificationId) {
            alertMessage += ' Notification scheduled.';
          } else {
            alertMessage += ' Notification could not be scheduled (check permissions?).';
          }
          Alert.alert('Topic Saved', alertMessage);
          setTopicName(''); // Clear input
          setSelectedDuration(DEFAULT_DURATIONS_DAYS[0]); // Reset duration
          navigation.navigate('Topics'); // Navigate to Topics list
        } else {
          Alert.alert('Error', 'Could not save topic details to schedule revision.');
        }
      } catch (error) {
        console.error('Error saving topic:', error);
        Alert.alert('Error', 'Could not save topic.');
      }
    } else {
      Alert.alert('Validation', 'Topic name cannot be empty.');
    }
  };

  return (
    <View style={[GlobalStyles.container, styles.containerSpecific]}>
      <Text style={GlobalStyles.titleText}>Add New Topic</Text>
      <TextInput
        style={[GlobalStyles.input, styles.inputSpecific]}
        placeholder="Enter topic name"
        placeholderTextColor={Colors.darkGray}
        value={topicName}
        onChangeText={setTopicName}
      />

      <Text style={styles.durationTitle}>Initial Revision In (Days):</Text>
      <View style={styles.durationsContainer}>
        {DEFAULT_DURATIONS_DAYS.map((duration) => (
          <TouchableOpacity
            key={duration}
            style={[
              styles.durationButton,
              selectedDuration === duration && styles.selectedDurationButton,
            ]}
            onPress={() => setSelectedDuration(duration)}
          >
            <Text
              style={[
                styles.durationButtonText,
                selectedDuration === duration && styles.selectedDurationButtonText,
              ]}
            >
              {duration}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={getButtonStyle('primary')} onPress={handleSaveTopic}>
        <Text style={GlobalStyles.buttonText}>Save Topic</Text>
      </TouchableOpacity>
    </View>
  );
}

// Specific styles for this screen, complementing commonStyles
const styles = StyleSheet.create({
  containerSpecific: { // Overrides or additions to GlobalStyles.container
    alignItems: 'center', // Keep content centered
    paddingTop: 20,
  },
  inputSpecific: { // Overrides or additions to GlobalStyles.input
     width: '95%', // Slightly adjust width if needed from global
     marginBottom: 20,
  },
  durationTitle: {
    fontSize: 16,
    fontWeight: '600', // Bolder
    color: Colors.text, // Use color from commonStyles
    marginBottom: 10,
    alignSelf: 'flex-start',
    marginLeft: '2.5%', // Adjust if inputSpecific width changes
  },
  durationsContainer: {
    flexDirection: 'row',
    justifyContent: 'center', // Center buttons
    flexWrap: 'wrap',
    width: '95%',
    marginBottom: 30,
  },
  durationButton: {
    backgroundColor: Colors.lightGray, // Use common color
    borderWidth: 1,
    borderColor: Colors.mediumGray,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    margin: 5,
    minWidth: 55,
    alignItems: 'center',
  },
  selectedDurationButton: {
    backgroundColor: Colors.primary, // Use common color
    borderColor: Colors.primaryDark,
  },
  durationButtonText: {
    color: Colors.text, // Use common color
    fontSize: 15,
    fontWeight: '500',
  },
  selectedDurationButtonText: {
    color: Colors.white, // Use common color
    fontWeight: 'bold',
  }
});
