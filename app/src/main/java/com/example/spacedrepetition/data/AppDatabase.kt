package com.example.spacedrepetition.data

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import com.example.spacedrepetition.model.RevisionSetting
import com.example.spacedrepetition.model.Topic

@Database(entities = [Topic::class, RevisionSetting::class], version = 1, exportSchema = false)
@TypeConverters(Converters::class)
abstract class AppDatabase : RoomDatabase() {

    abstract fun topicDao(): TopicDao
    abstract fun revisionSettingDao(): RevisionSettingDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "spaced_repetition_database"
                )
                // Add migrations here if version increases in future
                .fallbackToDestructiveMigration() // For simplicity, replace with proper migration in production
                .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
