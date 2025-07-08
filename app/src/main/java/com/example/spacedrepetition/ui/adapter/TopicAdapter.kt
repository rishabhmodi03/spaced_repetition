package com.example.spacedrepetition.ui.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.example.spacedrepetition.R
import com.example.spacedrepetition.databinding.ItemTopicBinding
import com.example.spacedrepetition.model.Topic
import com.example.spacedrepetition.utils.SpacedRepetitionScheduler
import java.text.SimpleDateFormat
import java.util.*
import java.util.concurrent.TimeUnit

class TopicAdapter(
    private val onItemClicked: (Topic) -> Unit,
    private val onMarkAsRevisedClicked: (Topic) -> Unit
) : ListAdapter<Topic, TopicAdapter.TopicViewHolder>(TopicDiffCallback()) {

    private val dateFormat = SimpleDateFormat("MMM dd, yyyy", Locale.getDefault())

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): TopicViewHolder {
        val binding = ItemTopicBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return TopicViewHolder(binding)
    }

    override fun onBindViewHolder(holder: TopicViewHolder, position: Int) {
        val topic = getItem(position)
        holder.bind(topic)
    }

    inner class TopicViewHolder(private val binding: ItemTopicBinding) : RecyclerView.ViewHolder(binding.root) {
        fun bind(topic: Topic) {
            binding.textViewTopicName.text = topic.name

            val todayStart = SpacedRepetitionScheduler.getTodayStartTime()

            if (topic.isLearned) {
                binding.textViewNextRevision.text = "Learned!"
                binding.textViewNextRevision.setTextColor(ContextCompat.getColor(itemView.context, R.color.teal_700))
                binding.buttonMarkAsRevised.visibility = View.GONE
                binding.imageViewLearned.visibility = View.VISIBLE
                binding.textViewStatus.text = "Status: Completed"
            } else {
                binding.imageViewLearned.visibility = View.GONE
                topic.nextRevisionDate?.let { nextDate ->
                    when {
                        nextDate < todayStart -> { // Overdue
                            binding.textViewNextRevision.text = "Due: ${dateFormat.format(Date(nextDate))}"
                            binding.textViewNextRevision.setTextColor(ContextCompat.getColor(itemView.context, R.color.purple_700)) // Or a specific overdue color
                            binding.buttonMarkAsRevised.visibility = View.VISIBLE
                            binding.textViewStatus.text = "Status: Overdue"
                        }
                        nextDate == todayStart -> { // Due today
                            binding.textViewNextRevision.text = "Due: Today"
                            binding.textViewNextRevision.setTextColor(ContextCompat.getColor(itemView.context, R.color.purple_500))
                            binding.buttonMarkAsRevised.visibility = View.VISIBLE
                            binding.textViewStatus.text = "Status: Due Today"
                        }
                        else -> { // Scheduled for future
                            val daysUntilNext = TimeUnit.MILLISECONDS.toDays(nextDate - todayStart)
                            val nextRevisionText = if (daysUntilNext == 1L) "Tomorrow" else "In ${daysUntilNext + 1} days (${dateFormat.format(Date(nextDate))})"
                            binding.textViewNextRevision.text = "Next: $nextRevisionText"
                            binding.textViewNextRevision.setTextColor(ContextCompat.getColor(itemView.context, android.R.color.darker_gray))
                            binding.buttonMarkAsRevised.visibility = View.GONE // Hide if not due yet
                            binding.textViewStatus.text = "Status: Scheduled"
                        }
                    }
                } ?: run {
                    binding.textViewNextRevision.text = "Not scheduled"
                    binding.textViewNextRevision.setTextColor(ContextCompat.getColor(itemView.context, android.R.color.darker_gray))
                    binding.buttonMarkAsRevised.visibility = View.GONE
                     binding.textViewStatus.text = "Status: Pending Initial Schedule"
                }
            }

            topic.lastRevisedDate?.let {
                binding.textViewLastRevised.text = "Last revised: ${dateFormat.format(Date(it))}"
                binding.textViewLastRevised.visibility = View.VISIBLE
            } ?: run {
                binding.textViewLastRevised.visibility = View.GONE
            }


            binding.buttonMarkAsRevised.setOnClickListener {
                onMarkAsRevisedClicked(topic)
            }
            itemView.setOnClickListener {
                onItemClicked(topic)
            }
        }
    }
}

class TopicDiffCallback : DiffUtil.ItemCallback<Topic>() {
    override fun areItemsTheSame(oldItem: Topic, newItem: Topic): Boolean {
        return oldItem.id == newItem.id
    }

    override fun areContentsTheSame(oldItem: Topic, newItem: Topic): Boolean {
        return oldItem == newItem
    }
}
