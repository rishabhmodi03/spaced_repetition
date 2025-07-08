package com.example.spacedrepetition.ui.viewmodel

import android.app.Application
import androidx.lifecycle.*
import com.example.spacedrepetition.data.AppDatabase
import com.example.spacedrepetition.data.RevisionSettingDao
import com.example.spacedrepetition.data.TopicDao
import com.example.spacedrepetition.model.RevisionSetting
import com.example.spacedrepetition.model.Topic
import com.example.spacedrepetition.utils.AlarmSchedulerUtil
import com.example.spacedrepetition.utils.SpacedRepetitionScheduler
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class TopicViewModel(application: Application) : AndroidViewModel(application) {

    private val topicDao: TopicDao
    private val revisionSettingDao: RevisionSettingDao

    val allTopics: LiveData<List<Topic>>
    val allRevisionSettings: LiveData<List<RevisionSetting>>

    private val _navigateToTopicForm = MutableLiveData<Int?>()
    val navigateToTopicForm: LiveData<Int?>
        get() = _navigateToTopicForm

    private val _navigateToManageSettings = MutableLiveData<Boolean>()
    val navigateToManageSettings: LiveData<Boolean>
        get() = _navigateToManageSettings

    init {
        val database = AppDatabase.getDatabase(application)
        topicDao = database.topicDao()
        revisionSettingDao = database.revisionSettingDao()
        allTopics = topicDao.getAllTopics().asLiveData()
        allRevisionSettings = revisionSettingDao.getAllRevisionSettings().asLiveData()

        // Populate default revision settings if none exist
        viewModelScope.launch {
            if (revisionSettingDao.getAllRevisionSettings().firstOrNull().isNullOrEmpty()) {
                RevisionSetting.defaultSettings().forEach { setting ->
                    revisionSettingDao.insertRevisionSetting(setting)
                }
            }
        }
    }

    fun insertTopic(topicName: String, settingId: Int) = viewModelScope.launch {
        val setting = revisionSettingDao.getRevisionSettingById(settingId)
        setting?.let {
            var newTopic = Topic(name = topicName, currentRevisionSettingId = it.id)
            newTopic = SpacedRepetitionScheduler.scheduleNextRevision(newTopic, it)
            val topicId = topicDao.insertTopic(newTopic) // Assuming insertTopic returns the ID
            // Schedule alarm for the newly inserted topic
            newTopic.copy(id = topicId.toInt()).let { topicWithId -> // Create a copy with the actual ID
                 if (topicWithId.id != 0) AlarmSchedulerUtil.scheduleAlarm(getApplication(), topicWithId)
            }
        }
    }

    fun updateTopic(topic: Topic, newSettingId: Int? = null) = viewModelScope.launch {
        val settingToUseId = newSettingId ?: topic.currentRevisionSettingId
        settingToUseId?.let { currentSettingId ->
            val setting = revisionSettingDao.getRevisionSettingById(currentSettingId)
            setting?.let {
                var updatedTopic = SpacedRepetitionScheduler.scheduleNextRevision(topic, it)
                // If it becomes learned, cancel any existing alarm
                if (updatedTopic.isLearned) {
                    AlarmSchedulerUtil.cancelAlarm(getApplication(), updatedTopic.id)
                } else {
                    // Otherwise, schedule/reschedule the alarm
                    AlarmSchedulerUtil.scheduleAlarm(getApplication(), updatedTopic)
                }
                topicDao.updateTopic(updatedTopic)
            }
        }
    }

    fun markTopicAsRevised(topic: Topic) = viewModelScope.launch {
        topic.currentRevisionSettingId?.let { settingId ->
            val setting = revisionSettingDao.getRevisionSettingById(settingId)
            setting?.let {
                val updatedTopic = SpacedRepetitionScheduler.markAsRevised(topic, it)
                topicDao.updateTopic(updatedTopic)
                // Reschedule or cancel alarm based on new state
                if (updatedTopic.isLearned || updatedTopic.nextRevisionDate == null) {
                    AlarmSchedulerUtil.cancelAlarm(getApplication(), updatedTopic.id)
                } else {
                    AlarmSchedulerUtil.scheduleAlarm(getApplication(), updatedTopic)
                }
            }
        }
    }

    fun deleteTopic(topic: Topic) = viewModelScope.launch {
        AlarmSchedulerUtil.cancelAlarm(getApplication(), topic.id) // Cancel alarm before deleting
        topicDao.deleteTopic(topic)
    }

    fun getTopicById(topicId: Int): LiveData<Topic?> {
        return topicDao.getTopicById(topicId).asLiveData()
    }

    fun getRevisionSettingById(settingId: Int): LiveData<RevisionSetting?> {
        return revisionSettingDao.getRevisionSettingByIdLD(settingId).asLiveData()
    }

    // Navigation triggers
    var doneNavigatingCalled = false // Prevents re-navigation on config change after nav
    fun onAddNewTopicClicked() {
        doneNavigatingCalled = false
        _navigateToTopicForm.value = null // null for new topic
    }

    fun onTopicClicked(topicId: Int) {
        doneNavigatingCalled = false
        _navigateToTopicForm.value = topicId
    }

    fun doneNavigatingToTopicForm() {
        _navigateToTopicForm.value = null // Clear the trigger
        doneNavigatingCalled = true // Mark as navigation handled for this cycle
    }

    fun onManageRevisionSettingsClicked() {
        _navigateToManageSettings.value = true
    }

    fun doneNavigatingToManageSettings() {
        _navigateToManageSettings.value = false
    }

    // Revision Settings specific functions (could be in a separate ViewModel too)
     fun insertRevisionSetting(name: String, intervalsDays: String) = viewModelScope.launch {
        if (name.isNotBlank() && intervalsDays.isNotBlank()) {
            val setting = RevisionSetting(name = name, intervalsDays = intervalsDays)
            revisionSettingDao.insertRevisionSetting(setting)
        }
    }

    fun deleteRevisionSetting(setting: RevisionSetting) = viewModelScope.launch {
        // Add logic to check if setting is in use by any topic, and handle accordingly
        // For now, direct delete:
        revisionSettingDao.deleteRevisionSetting(setting)
    }

    fun getTopicsForDate(dateMillis: Long): LiveData<List<Topic>> {
        return topicDao.getTopicsForDate(dateMillis).asLiveData()
    }
}

class TopicViewModelFactory(private val application: Application) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(TopicViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return TopicViewModel(application) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}
