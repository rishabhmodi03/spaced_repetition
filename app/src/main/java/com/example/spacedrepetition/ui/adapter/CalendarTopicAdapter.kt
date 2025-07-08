package com.example.spacedrepetition.ui.adapter

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.example.spacedrepetition.databinding.ItemTopicSimpleBinding
import com.example.spacedrepetition.model.Topic

class CalendarTopicAdapter(
    private val onItemClicked: (Topic) -> Unit
) : ListAdapter<Topic, CalendarTopicAdapter.CalendarTopicViewHolder>(TopicDiffCallback()) { // Reusing TopicDiffCallback

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): CalendarTopicViewHolder {
        val binding = ItemTopicSimpleBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return CalendarTopicViewHolder(binding)
    }

    override fun onBindViewHolder(holder: CalendarTopicViewHolder, position: Int) {
        val topic = getItem(position)
        holder.bind(topic)
    }

    inner class CalendarTopicViewHolder(private val binding: ItemTopicSimpleBinding) : RecyclerView.ViewHolder(binding.root) {
        fun bind(topic: Topic) {
            binding.textViewTopicNameSimple.text = topic.name
            // Potentially set a specific icon based on topic type or status if desired in the future
            // binding.imageViewTopicIcon.setImageResource(...)
            itemView.setOnClickListener {
                onItemClicked(topic)
            }
        }
    }
}
