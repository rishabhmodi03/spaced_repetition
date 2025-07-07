import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, TouchableOpacity, Modal, ActivityIndicator } from 'react-native'; // Removed Button
import { useFocusEffect } from '@react-navigation/native';
import { getAllTopics, deleteTopic, saveRevisionInstance, getSchedulesForTopic, completeRevisionInstance } from '../utils/storage';
import { formatDateReadable, getISODateString, addDaysToDate, getTodayISODate } from '../utils/dateUtils';
import { DEFAULT_DURATIONS_DAYS } from '../constants/appConstants';
import { scheduleRevisionNotification, cancelNotification } from '../utils/notificationUtils';
import { GlobalStyles, Colors, getButtonStyle } from '../styles/commonStyles'; // Import common styles

export default function TopicsListScreen({ navigation }) {
  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentTopicForReschedule, setCurrentTopicForReschedule] = useState(null);
  const [selectedNextDuration, setSelectedNextDuration] = useState(DEFAULT_DURATIONS_DAYS[0]);

  const loadTopics = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedTopics = await getAllTopics();
      setTopics(fetchedTopics.filter(topic => !topic.isArchived)); // Only show non-archived topics
    } catch (error) {
      console.error("Error loading topics:", error);
      Alert.alert("Error", "Could not load topics.");
    }
    setIsLoading(false);
  }, []);

  // useFocusEffect re-fetches data when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadTopics();
      return () => {}; // Optional cleanup function
    }, [loadTopics])
  );

  const handleDeleteTopic = async (topicId, topicName) => {
    Alert.alert(
      "Delete Topic",
      `Are you sure you want to delete "${topicName}" and all its revision schedules? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteTopic(topicId);
              // Alert.alert("Topic Deleted", `"${topicName}" has been deleted.`);
              loadTopics(); // Refresh the list
            } catch (error) {
              console.error("Error deleting topic:", error);
              Alert.alert("Error", "Could not delete topic.");
            }
          },
        },
      ]
    );
  };

  const openRescheduleModal = (topic) => {
    setCurrentTopicForReschedule(topic);
    setSelectedNextDuration(DEFAULT_DURATIONS_DAYS[0]); // Reset to default
    setIsModalVisible(true);
  };

  const handleConfirmReschedule = async () => {
    if (!currentTopicForReschedule || selectedNextDuration == null) {
      Alert.alert("Error", "Something went wrong. Please try again.");
      setIsModalVisible(false);
      return;
    }

    const topic = currentTopicForReschedule;
    const today = new Date();
    const todayString = getISODateString(today);

    try {
      // 1. Find the most recent, non-completed revision instance for this topic
      //    (or the one due today/past if applicable).
      //    For simplicity, we might assume any "Mark Revised" applies to the concept of the topic itself,
      //    and we are scheduling its *next* review from *today*.
      //    A more complex logic would find the specific due RevisionInstance.

      // Let's find all non-completed schedules for this topic
      const topicSchedules = await getSchedulesForTopic(topic.id);
      const openSchedules = topicSchedules.filter(s => !s.isCompleted)
                                         .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));

      let instanceToComplete = openSchedules.find(s => s.scheduledDate <= todayString);
      if (!instanceToComplete && openSchedules.length > 0) {
        // If nothing is due today or past, but there are future schedules,
        // and user marks revised now, it implies they reviewed it ahead of time.
        // We can complete the soonest one.
        // instanceToComplete = openSchedules[0];
        // OR, this action might be disabled if nothing is "due". For now, let's assume "Mark Revised" means "I studied this topic today".
      }

      if (instanceToComplete) {
        await completeRevisionInstance(instanceToComplete.id);
        if (instanceToComplete.notificationId) {
          // Attempt to cancel, though it might have already fired or passed
          await cancelNotification(instanceToComplete.notificationId);
        }
      }
      // If no specific instance was found to complete (e.g. user is reviewing a brand new topic again before its first scheduled review)
      // the following steps will still schedule the *next* one from today.

      // 2. Calculate new revision date
      const nextRevisionDate = addDaysToDate(today, selectedNextDuration);
      const nextRevisionDateString = getISODateString(nextRevisionDate);

      // 3. Schedule new notification
      const newNotificationId = await scheduleRevisionNotification(
        topic.name,
        nextRevisionDate, // Date object
        topic.id
      );

      // 4. Create new RevisionInstance
      const newRevisionInstance = {
        topicId: topic.id,
        topicName: topic.name,
        scheduledDate: nextRevisionDateString,
        isCompleted: false,
        notificationId: newNotificationId,
      };
      await saveRevisionInstance(newRevisionInstance);

      Alert.alert("Topic Revised!", `${topic.name} marked as revised. Next review in ${selectedNextDuration} days.`);
      setIsModalVisible(false);
      setCurrentTopicForReschedule(null);
      loadTopics(); // Refresh topics list (might show updated next review date if we display it)

    } catch (error) {
      console.error("Error rescheduling topic:", error);
      Alert.alert("Error", "Could not reschedule the topic.");
      setIsModalVisible(false);
    }
  };


  const renderTopicItem = ({ item }) => (
    <View style={[GlobalStyles.listItem, styles.topicItemSpecific]}>
      <View style={styles.topicInfo}>
        <Text style={styles.topicName}>{item.name}</Text>
        <Text style={styles.topicDate}>Created: {formatDateReadable(item.createdAt)}</Text>
        {/* TODO: Display next revision date here */}
      </View>
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          onPress={() => openRescheduleModal(item)}
          style={[getButtonStyle('secondary'), styles.actionButtonSmall]}
        >
          <Text style={[GlobalStyles.buttonText, styles.actionButtonSmallText]}>Revise</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeleteTopic(item.id, item.name)}
          style={[getButtonStyle('danger'), styles.actionButtonSmall, {marginTop: 5}]}
        >
          <Text style={[GlobalStyles.buttonText, styles.actionButtonSmallText]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return <View style={GlobalStyles.centeredContainer}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  return (
    <View style={GlobalStyles.container}>
      {topics.length === 0 && !isLoading && (
        <Text style={styles.emptyListText}>No topics yet. Use the "New Topic" tab to add some!</Text>
      )}

      <FlatList
        data={topics}
        renderItem={renderTopicItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={topics.length === 0 ? { flex: 1 } : {}} // Ensure empty list text is centered if list is empty
      />

      {currentTopicForReschedule && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={() => {
            setIsModalVisible(false);
            setCurrentTopicForReschedule(null);
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Reschedule "{currentTopicForReschedule.name}"</Text>
              <Text style={styles.modalSubtitle}>Next revision in (days):</Text>
              <View style={styles.durationsContainer}>
                {DEFAULT_DURATIONS_DAYS.map((duration) => (
                  <TouchableOpacity
                    key={duration}
                    style={[
                      styles.durationButton, // Using AddTopicScreen's styling for these
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
                    setCurrentTopicForReschedule(null);
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

// Using some styles from AddTopicScreen for duration buttons in modal for consistency
// For a larger app, these modal duration styles would be in commonStyles or a ModalComponent.
const styles = StyleSheet.create({
  topicItemSpecific: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topicInfo: {
    flex: 1,
    marginRight: 10,
  },
  topicName: {
    fontSize: 18,
    fontWeight: '600', // Bolder
    color: Colors.text,
  },
  topicDate: {
    fontSize: 13, // Slightly larger
    color: Colors.darkGray, // Darker gray
    marginTop: 4,
  },
  actionsContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  actionButtonSmall: { // For smaller buttons in list items
    paddingVertical: 6,
    paddingHorizontal: 12,
    minWidth: 80, // Adjust width
    borderRadius: 5, // Less rounded for smaller buttons
  },
  actionButtonSmallText: {
    fontSize: 13,
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 17, // Larger
    color: Colors.darkGray,
  },
  // Modal styles (some can be from commonStyles, some specific)
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Darker overlay
  },
  modalContent: {
    width: '90%', // Wider modal
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 25, // More padding
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: { // Using GlobalStyles.titleText and overriding parts
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 15,
    textAlign: 'center',
  },
  modalSubtitle: { // Using GlobalStyles.subtitleText and overriding
    fontSize: 16,
    color: Colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  durationsContainer: { // Copied from AddTopicScreen styles for now
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
    justifyContent: 'flex-end', // Align to right
    width: '100%',
    marginTop: 20,
  }
});
