package com.example.spacedrepetition.utils

import com.example.spacedrepetition.model.RevisionSetting
import com.example.spacedrepetition.model.Topic
import java.util.Calendar
import java.util.concurrent.TimeUnit

object SpacedRepetitionScheduler {

    /**
     * Calculates the list of revision dates for a topic based on its creation date and a revision setting.
     * @param topic The topic for which to calculate revision dates.
     * @param setting The revision setting defining the intervals.
     * @return A list of timestamps representing the calculated revision dates.
     */
    fun calculateRevisionDates(creationDate: Long, setting: RevisionSetting): List<Long> {
        val intervals = setting.getIntervals()
        if (intervals.isEmpty()) return emptyList()

        val calendar = Calendar.getInstance()
        calendar.timeInMillis = creationDate

        return intervals.map { days ->
            // Clone the calendar instance for each calculation to avoid modification issues
            val revisionCalendar = calendar.clone() as Calendar
            revisionCalendar.add(Calendar.DAY_OF_YEAR, days)
            // Normalize to the start of the day for consistency
            normalizeToStartOfDay(revisionCalendar).timeInMillis
        }
    }

    /**
     * Updates the topic's revision schedule after a revision is completed or when it's first scheduled.
     * @param topic The topic to update.
     * @param allRevisionSettings List of all available revision settings to find the one used.
     */
    fun scheduleNextRevision(topic: Topic, revisionSetting: RevisionSetting): Topic {
        if (topic.isLearned) {
            topic.nextRevisionDate = null
            return topic
        }

        val allCalculatedRevisionDates = calculateRevisionDates(topic.creationDate, revisionSetting)
        topic.revisionDates = allCalculatedRevisionDates
        topic.currentRevisionSettingId = revisionSetting.id

        val now = normalizeToStartOfDay(Calendar.getInstance()).timeInMillis
        var nextDate: Long? = null

        // If lastRevisedDate is null, it means it's the first time scheduling or it was reset.
        // So, the first date in revisionDates that is >= today is the next revision.
        if (topic.lastRevisedDate == null) {
            nextDate = allCalculatedRevisionDates.firstOrNull { it >= now }
        } else {
            // Find the next revision date strictly after the last revised date.
            nextDate = allCalculatedRevisionDates.firstOrNull { it > topic.lastRevisedDate!! && it >= now }
        }

        topic.nextRevisionDate = nextDate
        if (nextDate == null && allCalculatedRevisionDates.isNotEmpty() && (topic.lastRevisedDate ?: 0) >= allCalculatedRevisionDates.last()) {
            // All scheduled revisions are done or in the past relative to last revision
            topic.isLearned = true
        } else if (nextDate == null && allCalculatedRevisionDates.isEmpty()) {
            // No revision intervals defined
            topic.isLearned = true
        }


        return topic
    }

    /**
     * Marks a topic as revised for today and schedules the next revision.
     * @param topic The topic that was revised.
     * @param revisionSetting The revision setting currently applied to this topic.
     * @return The updated topic.
     */
    fun markAsRevised(topic: Topic, revisionSetting: RevisionSetting): Topic {
        val today = normalizeToStartOfDay(Calendar.getInstance()).timeInMillis
        topic.lastRevisedDate = today
        return scheduleNextRevision(topic, revisionSetting)
    }


    /**
     * Normalizes a Calendar instance to the start of the day (00:00:00.000).
     */
    fun normalizeToStartOfDay(calendar: Calendar): Calendar {
        calendar.set(Calendar.HOUR_OF_DAY, 0)
        calendar.set(Calendar.MINUTE, 0)
        calendar.set(Calendar.SECOND, 0)
        calendar.set(Calendar.MILLISECOND, 0)
        return calendar
    }

    /**
     * Gets the start of today as a timestamp.
     */
    fun getTodayStartTime(): Long {
        return normalizeToStartOfDay(Calendar.getInstance()).timeInMillis
    }
}
