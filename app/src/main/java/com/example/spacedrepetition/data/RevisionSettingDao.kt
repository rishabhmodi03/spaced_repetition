package com.example.spacedrepetition.data

import androidx.room.*
import com.example.spacedrepetition.model.RevisionSetting
import kotlinx.coroutines.flow.Flow

@Dao
interface RevisionSettingDao {
    @Query("SELECT * FROM revision_settings ORDER BY name ASC")
    fun getAllRevisionSettings(): Flow<List<RevisionSetting>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertRevisionSetting(setting: RevisionSetting): Long

    @Update
    suspend fun updateRevisionSetting(setting: RevisionSetting)

    @Delete
    suspend fun deleteRevisionSetting(setting: RevisionSetting)

    @Query("SELECT * FROM revision_settings WHERE id = :settingId")
    suspend fun getRevisionSettingById(settingId: Int): RevisionSetting? // Suspend function for coroutine calls

    @Query("SELECT * FROM revision_settings WHERE id = :settingId")
    fun getRevisionSettingByIdLD(settingId: Int): Flow<RevisionSetting?> // Flow for LiveData
}
