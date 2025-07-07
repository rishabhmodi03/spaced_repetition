import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, Modal, TouchableOpacity, ActivityIndicator } from 'react-native'; // Removed Button
import { useFocusEffect } from '@react-navigation/native';
import { getAllTopics, getSchedulesByDate, saveRevisionInstance, completeRevisionInstance } from '../utils/storage';
import { getTodayISODate, formatDateReadable, addDaysToDate, getISODateString } from '../utils/dateUtils';
import { DEFAULT_DURATIONS_DAYS } from '../constants/appConstants';
import { scheduleRevisionNotification, cancelNotification } from '../utils/notificationUtils';
import { GlobalStyles, Colors, getButtonStyle } from '../styles/commonStyles'; // Import common styles

export default function HomeScreen() {
  const [isLoading, setIsLoading] = useState(true); // Start true
  const [dueTodaySchedules, setDueTodaySchedules] = useState([]);
  const [totalActiveTopics, setTotalActiveTopics] = useState(0);

  // State for "Mark Revised" Modal (similar to TopicsListScreen)
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentScheduleForReschedule, setCurrentScheduleForReschedule] = useState(null); // Store schedule object
  const [selectedNextDuration, setSelectedNextDuration] = useState(DEFAULT_DURATIONS_DAYS[0]);

  const loadHomeData = useCallback(async () => {
    setIsLoading(true);
    try {
      const today = getTodayISODate();
      const schedules = await getSchedulesByDate(today); // Fetches non-completed for today
      setDueTodaySchedules(schedules);

      const topics = await getAllTopics();
      setTotalActiveTopics(topics.filter(t => !t.isArchived).length);

    } catch (error) {
      console.error("Error loading home screen data:", error);
      Alert.alert("Error", "Could not load data for home screen.");
    }
    setIsLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHomeData();
    }, [loadHomeData])
  );

  // --- "Mark Revised" Logic (adapted from TopicsListScreen) ---
  const openRescheduleModal = (schedule) => { // Takes a schedule item
    setCurrentScheduleForReschedule(schedule);
    setSelectedNextDuration(DEFAULT_DURATIONS_DAYS[0]);
    setIsModalVisible(true);
  };

  const handleConfirmReschedule = async () => {
    if (!currentScheduleForReschedule || selectedNextDuration == null) {
      Alert.alert("Error", "Something went wrong. Please try again.");
      setIsModalVisible(false);
      return;
    }

    const scheduleItem = currentScheduleForReschedule; // This is a RevisionInstance
    const topicId = scheduleItem.topicId;
    const topicName = scheduleItem.topicName; // Already denormalized in RevisionInstance

    try {
      // 1. Mark current instance as completed
      await completeRevisionInstance(scheduleItem.id);
      if (scheduleItem.notificationId) {
        await cancelNotification(scheduleItem.notificationId);
      }

      // 2. Calculate new revision date from today
      const today = new Date();
      const nextRevisionDate = addDaysToDate(today, selectedNextDuration);
      const nextRevisionDateString = getISODateString(nextRevisionDate);

      // 3. Schedule new notification
      const newNotificationId = await scheduleRevisionNotification(
        topicName,
        nextRevisionDate,
        topicId
      );

      // 4. Create new RevisionInstance
      const newRevisionInstance = {
        topicId: topicId,
        topicName: topicName,
        scheduledDate: nextRevisionDateString,
        isCompleted: false,
        notificationId: newNotificationId,
      };
      await saveRevisionInstance(newRevisionInstance);

      Alert.alert("Topic Revised!", `${topicName} marked as revised. Next review in ${selectedNextDuration} days.`);
      setIsModalVisible(false);
      setCurrentScheduleForReschedule(null);
      loadHomeData(); // Refresh home data
    } catch (error) {
      console.error("Error rescheduling topic from home:", error);
      Alert.alert("Error", "Could not reschedule the topic.");
      setIsModalVisible(false);
    }
  };
  // --- End "Mark Revised" Logic ---


  const renderDueItem = ({ item }) => ( // item is a RevisionInstance
    <View style={[GlobalStyles.listItem, styles.dueItemSpecific]}>
      <Text style={styles.dueItemText}>{item.topicName}</Text>
      <TouchableOpacity
        style={[getButtonStyle('success'), styles.reviseButtonSmall]} // 'success' is green
        onPress={() => openRescheduleModal(item)}
      >
        <Text style={GlobalStyles.buttonText}>Mark Revised</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return <View style={GlobalStyles.centeredContainer}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  return (
    <View style={GlobalStyles.container}>
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Quick Stats</Text>
        <Text style={styles.statsText}>Active Topics: {totalActiveTopics}</Text>
        <Text style={styles.statsText}>Due Today: {dueTodaySchedules.length}</Text>
      </View>

      <Text style={styles.dueHeader}>Due for Revision Today ({formatDateReadable(getTodayISODate())})</Text>

      {dueTodaySchedules.length === 0 && !isLoading ? (
        <View style={styles.noDueContainer}>
            <Text style={styles.noDueText}>Nothing due today. Great job!</Text>
            <TouchableOpacity style={[getButtonStyle('primary'), {marginTop: 20}]} onPress={() => navigation.navigate('Add Topic')}>
                <Text style={GlobalStyles.buttonText}>Add New Topic</Text>
            </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={dueTodaySchedules}
          renderItem={renderDueItem}
          keyExtractor={(item) => item.id.toString()}
          // style={styles.list} // Not needed if container has padding
        />
      )}

      {/* Reschedule Modal (using styles from TopicsListScreen for consistency) */}
      {currentScheduleForReschedule && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={() => {
            setIsModalVisible(false);
            setCurrentScheduleForReschedule(null);
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, {paddingBottom: 20}]}>
              <Text style={styles.modalTitle}>Reschedule "{currentScheduleForReschedule.topicName}"</Text>
              <Text style={styles.modalSubtitle}>Next revision in (days):</Text>
              <View style={styles.durationsContainer}>
                {DEFAULT_DURATIONS_DAYS.map((duration) => (
                  <TouchableOpacity
                    key={duration}
                    style={[
                      styles.durationButton,
                      selectedNextDuration === duration && styles.selectedDurationButton,
                    ]}
                    onPress={() => setSelectedNextDuration(duration)}
                  >
                    <Text
                      style={[
                        styles.durationButtonText,
                        selectedNextDuration === duration && styles.selectedDurationButtonText,
                      ]}
                    >
                      {duration}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.modalActions}>
                 <TouchableOpacity style={getButtonStyle('primary')} onPress={handleConfirmReschedule}>
                    <Text style={GlobalStyles.buttonText}>Confirm</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[getButtonStyle('secondary'), {backgroundColor: Colors.mediumGray, marginLeft: 10}]} onPress={() => {
                    setIsModalVisible(false);
                    setCurrentScheduleForReschedule(null);
                }}>
                    <Text style={[GlobalStyles.buttonText, {color: Colors.text}]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

// Some styles are copied/adapted from TopicsListScreen for the modal for consistency.
// Ideally, the modal would be a shared component.
const styles = StyleSheet.create({
  statsContainer: {
    padding: 15,
    backgroundColor: Colors.white,
    borderRadius: 10, // More rounded
    marginBottom: 20, // More space
    alignItems: 'center',
    elevation: 3, // Slightly more shadow
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 10,
  },
  statsText: {
    fontSize: 17,
    color: Colors.text,
    marginBottom: 5,
  },
  dueHeader: {
    fontSize: 18, // Slightly smaller than stats title
    fontWeight: 'bold',
    color: Colors.secondary, // Use secondary color
    marginBottom: 10,
    paddingLeft: 5, // Align with list items if they have padding
  },
  dueItemSpecific: { // Styles for the due item, extending GlobalStyles.listItem
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10, // Space between due items
  },
  dueItemText: {
    fontSize: 16,
    color: Colors.text,
    flex: 1,
    marginRight: 10,
  },
  reviseButtonSmall: { // Specific for the "Mark Revised" button on home screen
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 120, // Ensure enough space for "Mark Revised"
  },
  noDueContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noDueText: {
    textAlign: 'center',
    fontSize: 17,
    color: Colors.darkGray,
    marginBottom: 10,
  },
  // Modal styles (largely copied from TopicsListScreen for consistency)
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 25,
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 15,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  durationsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    width: '100%',
    marginBottom: 25,
  },
  durationButton: {
    backgroundColor: Colors.lightGray,
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
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryDark,
  },
  durationButtonText: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '500',
  },
  selectedDurationButtonText: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
    marginTop: 10, // Reduced from 20 to make modal shorter if needed
  }
});
