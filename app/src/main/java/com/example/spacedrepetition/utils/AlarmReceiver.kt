package com.example.spacedrepetition.utils

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import com.example.spacedrepetition.R // Assuming R is generated

class AlarmReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val topicName = intent.getStringExtra("TOPIC_NAME") ?: "Revision Due"
        val topicId = intent.getIntExtra("TOPIC_ID", 0)

        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                "revision_channel",
                "Revision Reminders",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Channel for Spaced Repetition revision reminders"
            }
            notificationManager.createNotificationChannel(channel)
        }

        val notification = NotificationCompat.Builder(context, "revision_channel")
            .setSmallIcon(R.drawable.ic_notification_icon) // Use dedicated notification icon
            .setContentTitle("Revise: $topicName")
            .setContentText("It's time to revise '$topicName'.")
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .build()

        notificationManager.notify(topicId, notification) // Use topicId as notification ID
    }
}
