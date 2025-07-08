package com.example.spacedrepetition.utils

import com.example.spacedrepetition.model.RevisionSetting
import com.example.spacedrepetition.model.Topic
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import java.util.Calendar
import java.util.concurrent.TimeUnit

class SpacedRepetitionSchedulerTest {

    private lateinit var standardSetting: RevisionSetting
    private lateinit var shortSetting: RevisionSetting
    private val todayStartMillis: Long = SpacedRepetitionScheduler.normalizeToStartOfDay(Calendar.getInstance()).timeInMillis

    @Before
    fun setUp() {
        standardSetting = RevisionSetting(id = 1, name = "Standard", intervalsDays = "1, 3, 7, 14, 30")
        shortSetting = RevisionSetting(id = 2, name = "Short", intervalsDays = "1, 2")
    }

    private fun getDayMillis(daysFromToday: Int): Long {
        val cal = Calendar.getInstance()
        cal.timeInMillis = todayStartMillis
        cal.add(Calendar.DAY_OF_YEAR, daysFromToday)
        return cal.timeInMillis
    }

    @Test
    fun `calculateRevisionDates returns correct dates for standard setting`() {
        val creationDate = todayStartMillis
        val expectedDates = listOf(
            getDayMillis(1),
            getDayMillis(3),
            getDayMillis(7),
            getDayMillis(14),
            getDayMillis(30)
        )
        val actualDates = SpacedRepetitionScheduler.calculateRevisionDates(creationDate, standardSetting)
        assertEquals(expectedDates, actualDates)
    }

    @Test
    fun `calculateRevisionDates returns empty list for empty intervals`() {
        val emptySetting = RevisionSetting(id = 3, name = "Empty", intervalsDays = "")
        val creationDate = todayStartMillis
        val actualDates = SpacedRepetitionScheduler.calculateRevisionDates(creationDate, emptySetting)
        assertTrue(actualDates.isEmpty())
    }

    @Test
    fun `calculateRevisionDates returns empty list for malformed intervals`() {
        val malformedSetting = RevisionSetting(id = 4, name = "Malformed", intervalsDays = "1,three,7")
        val creationDate = todayStartMillis
        val expectedDates = listOf(getDayMillis(1), getDayMillis(7)) // Should skip "three"
        val actualDates = SpacedRepetitionScheduler.calculateRevisionDates(creationDate, malformedSetting)
        assertEquals(expectedDates, actualDates)
    }

    @Test
    fun `normalizeToStartOfDay sets time correctly`() {
        val calendar = Calendar.getInstance() // Current time
        SpacedRepetitionScheduler.normalizeToStartOfDay(calendar)
        assertEquals(0, calendar.get(Calendar.HOUR_OF_DAY))
        assertEquals(0, calendar.get(Calendar.MINUTE))
        assertEquals(0, calendar.get(Calendar.SECOND))
        assertEquals(0, calendar.get(Calendar.MILLISECOND))
    }

    @Test
    fun `scheduleNextRevision for new topic sets first revision date correctly`() {
        val newTopic = Topic(name = "New Topic", creationDate = todayStartMillis)
        val updatedTopic = SpacedRepetitionScheduler.scheduleNextRevision(newTopic, standardSetting)

        assertEquals(getDayMillis(1), updatedTopic.nextRevisionDate)
        assertFalse(updatedTopic.isLearned)
        assertEquals(standardSetting.id, updatedTopic.currentRevisionSettingId)
        assertNotNull(updatedTopic.revisionDates)
        assertTrue(updatedTopic.revisionDates.isNotEmpty())
    }

    @Test
    fun `scheduleNextRevision for topic created yesterday, first revision today`() {
        val yesterdayStartMillis = getDayMillis(-1)
        val topic = Topic(name = "Topic from Yesterday", creationDate = yesterdayStartMillis)
        val updatedTopic = SpacedRepetitionScheduler.scheduleNextRevision(topic, standardSetting) // 1,3,7...

        assertEquals(todayStartMillis, updatedTopic.nextRevisionDate) // 1 day after yesterday is today
    }


    @Test
    fun `markAsRevised correctly updates lastRevisedDate and schedules next revision`() {
        var topic = Topic(name = "Test Topic", creationDate = getDayMillis(-1), currentRevisionSettingId = standardSetting.id) // Created yesterday
        topic = SpacedRepetitionScheduler.scheduleNextRevision(topic, standardSetting) // Next revision is today

        assertEquals(todayStartMillis, topic.nextRevisionDate)

        topic = SpacedRepetitionScheduler.markAsRevised(topic, standardSetting)

        assertEquals(todayStartMillis, topic.lastRevisedDate)
        assertEquals(getDayMillis(2), topic.nextRevisionDate) // Original creation was yesterday (-1) + 3 days (next interval) = 2 days from today
        assertFalse(topic.isLearned)
    }

    @Test
    fun `markAsRevised for last revision makes topic learned`() {
        // Topic created such that its last revision (at 2 days) is today
        val creation = getDayMillis(-1) // created 1 day ago
        // Short setting: 1, 2 days. Last revision is at 2 days.
        var topic = Topic(name = "Almost Learned", creationDate = creation, currentRevisionSettingId = shortSetting.id)
        topic = SpacedRepetitionScheduler.scheduleNextRevision(topic, shortSetting) // Should be due today (creation + 1 day)
        assertEquals(todayStartMillis, topic.nextRevisionDate)

        // Mark as revised today (completes 1st interval)
        topic = SpacedRepetitionScheduler.markAsRevised(topic, shortSetting)
        assertEquals(todayStartMillis, topic.lastRevisedDate)
        assertEquals(getDayMillis(1), topic.nextRevisionDate) // Next is (creation + 2 days) = (-1 + 2) = 1 day from today

        // Simulate time passing to the next revision date
        // To test marking the *final* revision, we need to simulate that the nextRevisionDate IS today
        // So, let's adjust the 'lastRevisedDate' as if the previous revision happened making the *final* one due today.
        // If shortSetting is "1,2", and creation is `c`. Revisions are at c+1, c+2.
        // To make c+2 today, creation must be 2 days ago.
        val creationTwoDaysAgo = getDayMillis(-2)
        topic = Topic(name = "Final Revision", creationDate = creationTwoDaysAgo, currentRevisionSettingId = shortSetting.id)
        // Schedule it: first revision at c+1 (yesterday), next at c+2 (today)
        // We need to simulate it was revised yesterday.
        topic.lastRevisedDate = getDayMillis(-1)
        topic = SpacedRepetitionScheduler.scheduleNextRevision(topic, shortSetting)

        assertEquals(todayStartMillis, topic.nextRevisionDate) // Final revision is today

        // Mark as revised today (completes 2nd and final interval)
        topic = SpacedRepetitionScheduler.markAsRevised(topic, shortSetting)

        assertEquals(todayStartMillis, topic.lastRevisedDate)
        assertTrue(topic.isLearned)
        assertNull(topic.nextRevisionDate)
    }

    @Test
    fun `scheduleNextRevision when all revisions past and last revision was on last schedule makes learned`() {
        val creationDate = getDayMillis(-30) // Created long ago
        var topic = Topic(name = "Old Topic", creationDate = creationDate, currentRevisionSettingId = shortSetting.id) // intervals 1, 2
        // Calculated revisions: creationDate+1, creationDate+2

        // Simulate it was last revised on its last possible revision date (creationDate + 2 days)
        topic.lastRevisedDate = getDayMillis(-28) // creationDate + 2 days

        topic = SpacedRepetitionScheduler.scheduleNextRevision(topic, shortSetting)

        assertTrue(topic.isLearned)
        assertNull(topic.nextRevisionDate)
    }

    @Test
    fun `scheduleNextRevision for topic with future creation date`() {
        val futureCreationDate = getDayMillis(5) // Created 5 days in the future
        val topic = Topic(name = "Future Topic", creationDate = futureCreationDate)
        val updatedTopic = SpacedRepetitionScheduler.scheduleNextRevision(topic, standardSetting)

        assertEquals(getDayMillis(5+1), updatedTopic.nextRevisionDate) // First revision is 1 day after its future creation
    }

    @Test
    fun `scheduleNextRevision with no revision setting intervals makes topic learned`() {
        val settingNoIntervals = RevisionSetting(id = 5, name = "No Intervals", intervalsDays = "")
        val topic = Topic(name = "No Interval Topic", creationDate = todayStartMillis)
        val updatedTopic = SpacedRepetitionScheduler.scheduleNextRevision(topic, settingNoIntervals)
        assertTrue(updatedTopic.isLearned)
        assertNull(updatedTopic.nextRevisionDate)
    }
}
