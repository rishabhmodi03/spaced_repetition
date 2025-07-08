package com.example.spacedrepetition.data

import androidx.room.TypeConverter

class Converters {
    @TypeConverter
    fun fromTimestampList(value: List<Long>?): String? {
        return value?.joinToString(",")
    }

    @TypeConverter
    fun toTimestampList(value: String?): List<Long>? {
        return value?.split(',')?.mapNotNull { it.toLongOrNull() }
    }

    @TypeConverter
    fun fromIntList(value: List<Int>?): String? {
        return value?.joinToString(",")
    }

    @TypeConverter
    fun toIntList(value: String?): List<Int>? {
        return value?.split(',')?.mapNotNull { it.toIntOrNull() }
    }
}
