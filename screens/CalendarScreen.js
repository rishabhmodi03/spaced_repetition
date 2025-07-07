import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useFocusEffect } from '@react-navigation/native';
import { getAllSchedules } from '../utils/storage';
import { getISODateString, formatDateReadable } from '../utils/dateUtils';
import { GlobalStyles, Colors } from '../styles/commonStyles'; // Import common styles

export default function CalendarScreen() {
  const [isLoading, setIsLoading] = useState(true); // Start true
  const [allSchedules, setAllSchedules] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [selectedDate, setSelectedDate] = useState(getISODateString(new Date())); // Default to today
  const [schedulesForSelectedDate, setSchedulesForSelectedDate] = useState([]);

  const loadSchedules = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedSchedules = await getAllSchedules();
      const nonCompletedSchedules = fetchedSchedules.filter(s => !s.isCompleted);
      setAllSchedules(nonCompletedSchedules);

      const marks = {};
      nonCompletedSchedules.forEach(schedule => {
        const dateStr = schedule.scheduledDate; // Assuming YYYY-MM-DD
        if (!marks[dateStr]) {
          marks[dateStr] = { marked: true, dotColor: 'tomato', activeOpacity: 0 };
        }
      });
      setMarkedDates(marks);
      // Update schedules for the currently selected date as well
      filterSchedulesForDate(selectedDate, nonCompletedSchedules);

    } catch (error) {
      console.error("Error loading schedules for calendar:", error);
    }
    setIsLoading(false);
  }, [selectedDate]); // Add selectedDate as dependency

  // useFocusEffect to reload schedules when the screen is focused
  useFocusEffect(
    useCallback(() => {
      loadSchedules();
    }, [loadSchedules])
  );

  const filterSchedulesForDate = (dateString, schedulesToFilter) => {
    const relevantSchedules = (schedulesToFilter || allSchedules).filter(
      s => s.scheduledDate === dateString && !s.isCompleted
    );
    setSchedulesForSelectedDate(relevantSchedules);
  };

  const onDayPress = (day) => {
    setSelectedDate(day.dateString);
    filterSchedulesForDate(day.dateString, allSchedules);

    // Update markedDates to show selection
    const newMarkedDates = { ...markedDates };
    // Remove previous selection styling if any (simple version: assume only one selected)
    Object.keys(newMarkedDates).forEach(date => {
        if(newMarkedDates[date].selected){
            // Keep other properties like marked, dotColor
            newMarkedDates[date] = { ...newMarkedDates[date], selected: false, selectedColor: undefined };
        }
    });
    if (newMarkedDates[day.dateString]) {
      newMarkedDates[day.dateString] = { ...newMarkedDates[day.dateString], selected: true, selectedColor: 'skyblue' };
    } else {
      newMarkedDates[day.dateString] = { selected: true, selectedColor: 'skyblue', marked: false }; // If day wasn't previously marked
    }
    setMarkedDates(newMarkedDates);
  };

  const renderScheduleItem = ({ item }) => (
    <View style={[GlobalStyles.listItem, styles.scheduleItemSpecific]}>
      <Text style={GlobalStyles.listItemText}>{item.topicName}</Text>
      {/* Date is already clear from the context of selected day, so hiding this sub-text for cleaner UI */}
      {/* <Text style={styles.scheduleItemDate}>Due: {formatDateReadable(item.scheduledDate)}</Text> */}
    </View>
  );

  if (isLoading && !Object.keys(markedDates).length) { // Show full screen loader only on initial load
    return <View style={GlobalStyles.centeredContainer}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  return (
    <View style={GlobalStyles.container}>
      <Calendar
        current={selectedDate}
        markedDates={markedDates}
        onDayPress={onDayPress}
        monthFormat={'yyyy MMMM'}
        theme={{
          backgroundColor: GlobalStyles.container.backgroundColor, // Match screen bg
          calendarBackground: Colors.white, // Calendar itself white
          textSectionTitleColor: Colors.secondary,
          selectedDayBackgroundColor: Colors.primary,
          selectedDayTextColor: Colors.white,
          todayTextColor: Colors.primaryDark,
          dayTextColor: Colors.text,
          textDisabledColor: Colors.mediumGray,
          dotColor: Colors.primary,
          selectedDotColor: Colors.white,
          arrowColor: Colors.primary,
          monthTextColor: Colors.primary,
          indicatorColor: Colors.primary,
          textDayFontWeight: '400',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: 'bold',
          textDayFontSize: 16,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 14,
        }}
        style={styles.calendarStyle}
      />
      <Text style={styles.selectedDateText}>
        Revisions for: {formatDateReadable(selectedDate)}
      </Text>
      {isLoading && schedulesForSelectedDate.length === 0 && ( // Show small loader if loading for selected date
         <ActivityIndicator size="small" color={Colors.primary} style={{marginTop: 20}}/>
      )}
      {!isLoading && schedulesForSelectedDate.length === 0 && (
        <Text style={styles.noSchedulesText}>No revisions scheduled for this day.</Text>
      )}
      {!isLoading && schedulesForSelectedDate.length > 0 && (
        <FlatList
          data={schedulesForSelectedDate}
          renderItem={renderScheduleItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{paddingBottom: 10}} // Add padding at bottom of list
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  calendarStyle: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
    marginBottom: 10,
    // elevation: 2, // Optional shadow for calendar
    // shadowColor: Colors.black,
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.1,
    // shadowRadius: 2,
  },
  selectedDateText: {
    fontSize: 17, // Slightly smaller
    fontWeight: '600', // Semi-bold
    paddingVertical: 12, // Adjust padding
    paddingHorizontal: 15,
    textAlign: 'center',
    backgroundColor: Colors.white,
    color: Colors.primary, // Use primary color for text
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray, // Match calendar border
    marginBottom: 5, // Space before list
  },
  scheduleItemSpecific: { // Extending GlobalStyles.listItem
     marginHorizontal: GlobalStyles.container.padding, // Match container padding
     marginBottom: 8, // Default margin from GlobalStyles.listItem is vertical
  },
  // scheduleItemDate: { // Kept if needed later
  //   fontSize: 12,
  //   color: Colors.darkGray,
  //   marginTop: 3,
  // },
  noSchedulesText: {
    textAlign: 'center',
    marginTop: 30, // More margin
    fontSize: 16, // Consistent with other empty texts
    color: Colors.darkGray,
  }
});
