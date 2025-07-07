import AsyncStorage from '@react-native-async-storage/async-storage';

const TOPICS_KEY = 'app_topics';
const SCHEDULES_KEY = 'app_revision_schedules';

// --- Generic Helper Functions ---

/**
 * Saves a value to AsyncStorage after converting it to a JSON string.
 * @param {string} key The key to save under.
 * @param {any} value The value to save.
 */
export const saveItem = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    console.error('Error saving item to AsyncStorage:', key, e);
    // Handle saving error
  }
};

/**
 * Retrieves an item from AsyncStorage and parses it as JSON.
 * @param {string} key The key to retrieve.
 * @returns {Promise<any|null>} The retrieved value, or null if not found or error.
 */
export const getItem = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error('Error getting item from AsyncStorage:', key, e);
    return null; // Handle error or return default
  }
};

/**
 * Removes an item from AsyncStorage.
 * @param {string} key The key to remove.
 */
export const removeItem = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.error('Error removing item from AsyncStorage:', key, e);
    // Handle removing error
  }
};

// --- Topic Specific Functions ---

/**
 * Retrieves all topics.
 * @returns {Promise<Array<Object>>} An array of topic objects.
 */
export const getAllTopics = async () => {
  const topics = await getItem(TOPICS_KEY);
  return topics || [];
};

/**
 * Saves a single topic. If the topic has an ID, it tries to update it.
 * Otherwise, it adds it as a new topic.
 * @param {Object} topicData The topic object to save. Should not have id if new.
 * @returns {Promise<Object|null>} The saved topic object (with id and createdAt if new) or null on error.
 */
export const saveTopic = async (topicData) => {
  const topics = await getAllTopics();
  let topicToSave;

  if (topicData.id) { // Update existing
    const existingIndex = topics.findIndex(t => t.id === topicData.id);
    if (existingIndex > -1) {
      topics[existingIndex] = { ...topics[existingIndex], ...topicData };
      topicToSave = topics[existingIndex];
    } else {
      console.error("saveTopic: Tried to update non-existent topic ID:", topicData.id);
      return null; // Or throw error
    }
  } else { // Add new
    topicToSave = {
      ...topicData,
      id: Date.now().toString(), // Simple unique ID
      createdAt: new Date().toISOString(),
    };
    topics.push(topicToSave);
  }

  await saveItem(TOPICS_KEY, topics);
  return topicToSave; // Return the actual object that was saved/updated
};

/**
 * Deletes a topic by its ID.
 * Also, this should ideally trigger deletion of its related schedules (cascading delete).
 * @param {string} topicId The ID of the topic to delete.
 * @returns {Promise<Array<Object>>} The updated list of all topics.
 */
export const deleteTopic = async (topicId) => {
  let topics = await getAllTopics();
  topics = topics.filter(t => t.id !== topicId);
  await saveItem(TOPICS_KEY, topics);
  // Also delete associated revision instances
  await deleteAllSchedulesForTopic(topicId);
  return topics;
};

// --- Revision Schedule Specific Functions ---

/**
 * Retrieves all revision instances.
 * @returns {Promise<Array<Object>>} An array of revision instance objects.
 */
export const getAllSchedules = async () => {
  const schedules = await getItem(SCHEDULES_KEY);
  return schedules || [];
};

/**
 * Saves a single revision instance.
 * @param {Object} scheduleData The revision instance object to save.
 * @returns {Promise<Array<Object>>} The updated list of all schedules.
 */
export const saveRevisionInstance = async (scheduleData) => {
  if (!scheduleData.id) {
    // Create a unique ID, perhaps combining topicId and scheduledDate for idempotency if needed, or just a timestamp
    scheduleData.id = `${scheduleData.topicId}_${scheduleData.scheduledDate}_${Date.now()}`;
  }
  const schedules = await getAllSchedules();
  const existingIndex = schedules.findIndex(s => s.id === scheduleData.id);

  if (existingIndex > -1) {
    schedules[existingIndex] = { ...schedules[existingIndex], ...scheduleData };
  } else {
    schedules.push(scheduleData);
  }
  await saveItem(SCHEDULES_KEY, schedules);
  return schedules;
};

/**
 * Deletes a revision instance by its ID.
 * @param {string} instanceId The ID of the revision instance to delete.
 * @returns {Promise<Array<Object>>} The updated list of all schedules.
 */
import { cancelNotification } from './notificationUtils'; // Import cancelNotification

export const deleteRevisionInstance = async (instanceId) => {
  let schedules = await getAllSchedules();
  const scheduleToDelete = schedules.find(s => s.id === instanceId);

  if (scheduleToDelete && scheduleToDelete.notificationId) {
    await cancelNotification(scheduleToDelete.notificationId);
  }

  schedules = schedules.filter(s => s.id !== instanceId);
  await saveItem(SCHEDULES_KEY, schedules);
  return schedules;
};

/**
 * Retrieves all revision instances for a specific date.
 * @param {string} dateString The date string (YYYY-MM-DD).
 * @returns {Promise<Array<Object>>} An array of schedule objects for that date.
 */
export const getSchedulesByDate = async (dateString) => {
  const allSchedules = await getAllSchedules();
  return allSchedules.filter(s => s.scheduledDate === dateString && !s.isCompleted);
};

/**
 * Retrieves all revision instances for a specific topic.
 * @param {string} topicId The ID of the topic.
 * @returns {Promise<Array<Object>>} An array of schedule objects for that topic.
 */
export const getSchedulesForTopic = async (topicId) => {
  const allSchedules = await getAllSchedules();
  return allSchedules.filter(s => s.topicId === topicId);
};

/**
 * Deletes all revision instances for a specific topic.
 * Useful when a topic is deleted.
 * @param {string} topicId The ID of the topic.
 * @returns {Promise<Array<Object>>} The updated list of all schedules.
 */
// cancelNotification is already imported from previous change

export const deleteAllSchedulesForTopic = async (topicId) => {
  let allSchedules = await getAllSchedules();
  const schedulesForTopic = allSchedules.filter(s => s.topicId === topicId);

  // Cancel notifications for each schedule being deleted
  for (const schedule of schedulesForTopic) {
    if (schedule.notificationId) {
      await cancelNotification(schedule.notificationId);
    }
  }

  const remainingSchedules = allSchedules.filter(s => s.topicId !== topicId);
  await saveItem(SCHEDULES_KEY, remainingSchedules);
  return remainingSchedules;
};

/**
 * Marks a specific revision instance as completed.
 * @param {string} instanceId The ID of the revision instance.
 * @returns {Promise<Object|null>} The updated schedule instance or null if not found.
 */
export const completeRevisionInstance = async (instanceId) => {
  const schedules = await getAllSchedules();
  const scheduleIndex = schedules.findIndex(s => s.id === instanceId);
  if (scheduleIndex > -1) {
    schedules[scheduleIndex].isCompleted = true;
    await saveItem(SCHEDULES_KEY, schedules);
    return schedules[scheduleIndex];
  }
  return null;
};


// Utility to clear all data - for development/testing
export const clearAllData = async () => {
  try {
    await AsyncStorage.removeItem(TOPICS_KEY);
    await AsyncStorage.removeItem(SCHEDULES_KEY);
    // You can also use AsyncStorage.clear() but it clears EVERYTHING
    // await AsyncStorage.clear();
    console.log('All app data cleared.');
  } catch (e) {
    console.error('Error clearing all data from AsyncStorage:', e);
  }
};
