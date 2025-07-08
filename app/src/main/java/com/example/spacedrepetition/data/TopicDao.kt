package com.example.spacedrepetition.data

import androidx.room.*
import com.example.spacedrepetition.model.Topic
import kotlinx.coroutines.flow.Flow

@Dao
interface TopicDao {
    @Query("SELECT * FROM topics ORDER BY nextRevisionDate ASC, creationDate DESC")
    fun getAllTopics(): Flow<List<Topic>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTopic(topic: Topic): Long

    @Update
    suspend fun updateTopic(topic: Topic)

    @Delete
    suspend fun deleteTopic(topic: Topic)

    @Query("SELECT * FROM topics WHERE id = :topicId")
    fun getTopicById(topicId: Int): Flow<Topic?> // Changed to Flow

    @Query("SELECT * FROM topics WHERE nextRevisionDate = :dateMillis ORDER BY name ASC")
    fun getTopicsForDate(dateMillis: Long): Flow<List<Topic>>
}
