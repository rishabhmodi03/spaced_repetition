package com.example.spacedrepetition.model

import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.TypeConverters
import com.example.spacedrepetition.data.Converters // To be created

@Entity(tableName = "topics")
@TypeConverters(Converters::class)
data class Topic(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val name: String,
    val creationDate: Long = System.currentTimeMillis(), // Store as Long (timestamp)
    var revisionDates: List<Long> = emptyList(), // List of timestamps for scheduled revisions
    var nextRevisionDate: Long? = null, // Timestamp for the very next revision
    var lastRevisedDate: Long? = null, // Timestamp of the last completed revision
    var currentRevisionSettingId: Int? = null, // Foreign key to RevisionSetting used for the current schedule
    var isLearned: Boolean = false // Flag to mark if the topic is fully learned (all revisions done)
)
