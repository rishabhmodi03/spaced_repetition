package com.example.spacedrepetition.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "revision_settings")
data class RevisionSetting(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val name: String, // e.g., "Standard", "Aggressive"
    // List of intervals in days (e.g., [1, 3, 7, 14, 30])
    // Stored as a comma-separated string to simplify Room storage without a separate table for intervals
    val intervalsDays: String
) {
    // Helper to get intervals as a list of integers
    fun getIntervals(): List<Int> {
        return intervalsDays.split(",").mapNotNull { it.trim().toIntOrNull() }
    }

    companion object {
        fundefaultSettings(): List<RevisionSetting> {
            return listOf(
                RevisionSetting(name = "Standard", intervalsDays = "1, 3, 7, 14, 30, 60"),
                RevisionSetting(name = "Short Term", intervalsDays = "1, 2, 4, 7, 12"),
                RevisionSetting(name = "Exam Prep", intervalsDays = "1, 1, 2, 3, 5, 8") // More frequent early on
            )
        }
    }
}
