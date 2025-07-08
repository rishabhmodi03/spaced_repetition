package com.example.spacedrepetition.utils

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import com.example.spacedrepetition.model.Topic
import java.util.*

object AlarmSchedulerUtil {

    private const val TAG = "AlarmSchedulerUtil"

    fun scheduleAlarm(context: Context, topic: Topic) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

        topic.nextRevisionDate?.let { revisionTime ->
            if (revisionTime < System.currentTimeMillis()) {
                // Don't schedule alarms for past dates, though notifications for overdue might be handled differently (e.g., immediate or daily digest)
                Log.d(TAG, "Not scheduling alarm for ${topic.name} as revision date is in the past.")
                return
            }

            val intent = Intent(context, AlarmReceiver::class.java).apply {
                putExtra("TOPIC_ID", topic.id)
                putExtra("TOPIC_NAME", topic.name)
            }
            // Use topic.id as the requestCode to ensure uniqueness for each topic's alarm
            // Use FLAG_IMMUTABLE or FLAG_MUTABLE as appropriate. FLAG_UPDATE_CURRENT will update if an existing one is there.
            val pendingIntentFlag = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            } else {
                PendingIntent.FLAG_UPDATE_CURRENT
            }
            val pendingIntent = PendingIntent.getBroadcast(context, topic.id, intent, pendingIntentFlag)

            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    if (alarmManager.canScheduleExactAlarms()) {
                        // Set alarm to trigger at the start of the revision day, e.g., 8 AM
                        val calendar = Calendar.getInstance().apply {
                            timeInMillis = revisionTime // This is already normalized to start of day
                            set(Calendar.HOUR_OF_DAY, 8) // Example: 8 AM
                            set(Calendar.MINUTE, 0)
                            set(Calendar.SECOND, 0)
                        }
                        // If 8 AM on the revision day is already past, schedule for next minute for testing or handle appropriately
                        if (calendar.timeInMillis < System.currentTimeMillis()) {
                             Log.d(TAG, "Scheduled time ${calendar.time} for ${topic.name} is in the past. Scheduling for ~now for overdue.")
                            //  alarmManager.setExactAndAllowWhileIdle(System.currentTimeMillis() + 10000, pendingIntent) // ~10s from now
                             // For a real app, you might not schedule if it's past, or have a different logic for overdue items.
                             // For now, we will just log and not schedule if the 8 AM target is past.
                             Log.d(TAG, "Target alarm time ${calendar.time} for ${topic.name} is in the past. Not scheduling.")
                             return
                        }

                        alarmManager.setExactAndAllowWhileIdle(calendar.timeInMillis, pendingIntent)
                        Log.d(TAG, "Exact alarm scheduled for topic '${topic.name}' (ID: ${topic.id}) at ${Date(calendar.timeInMillis)}")
                    } else {
                        // Fallback or request permission. For now, just log.
                        Log.w(TAG, "Cannot schedule exact alarms. App needs SCHEDULE_EXACT_ALARM permission granted by user or fallback.")
                        // Potentially schedule an inexact alarm as a fallback
                        // alarmManager.setWindow(...)
                    }
                } else {
                     val calendar = Calendar.getInstance().apply {
                        timeInMillis = revisionTime
                        set(Calendar.HOUR_OF_DAY, 8)
                        set(Calendar.MINUTE, 0)
                        set(Calendar.SECOND, 0)
                    }
                    if (calendar.timeInMillis < System.currentTimeMillis()) {
                        Log.d(TAG, "Target alarm time ${calendar.time} for ${topic.name} is in the past. Not scheduling.")
                        return
                    }
                    alarmManager.setExactAndAllowWhileIdle(calendar.timeInMillis, pendingIntent)
                    Log.d(TAG, "Exact alarm scheduled for topic '${topic.name}' (ID: ${topic.id}) at ${Date(calendar.timeInMillis)}")
                }
            } catch (se: SecurityException) {
                Log.e(TAG, "SecurityException: Failed to schedule exact alarm. Check permissions.", se)
                // Handle missing permission (e.g., guide user to settings)
            }
        } ?: run {
            Log.d(TAG, "No next revision date for topic '${topic.name}', alarm not scheduled.")
        }
    }

    fun cancelAlarm(context: Context, topicId: Int) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val intent = Intent(context, AlarmReceiver::class.java) // Intent must match the one used for scheduling

        val pendingIntentFlag = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            PendingIntent.FLAG_NO_CREATE or PendingIntent.FLAG_IMMUTABLE // FLAG_NO_CREATE to check if it exists
        } else {
            PendingIntent.FLAG_NO_CREATE
        }
        val pendingIntent = PendingIntent.getBroadcast(context, topicId, intent, pendingIntentFlag)

        if (pendingIntent != null) { // Alarm exists
            alarmManager.cancel(pendingIntent)
            pendingIntent.cancel() // Also cancel the PendingIntent itself
            Log.d(TAG, "Alarm cancelled for topic ID: $topicId")
        } else {
            Log.d(TAG, "No alarm found to cancel for topic ID: $topicId")
        }
    }
}
