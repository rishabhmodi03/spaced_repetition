package com.example.spacedrepetition.ui.adapter

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.example.spacedrepetition.databinding.ItemRevisionSettingBinding
import com.example.spacedrepetition.model.RevisionSetting

class RevisionSettingAdapter(
    private val onDeleteClicked: (RevisionSetting) -> Unit
) : ListAdapter<RevisionSetting, RevisionSettingAdapter.RevisionSettingViewHolder>(RevisionSettingDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RevisionSettingViewHolder {
        val binding = ItemRevisionSettingBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return RevisionSettingViewHolder(binding)
    }

    override fun onBindViewHolder(holder: RevisionSettingViewHolder, position: Int) {
        val setting = getItem(position)
        holder.bind(setting)
    }

    inner class RevisionSettingViewHolder(private val binding: ItemRevisionSettingBinding) : RecyclerView.ViewHolder(binding.root) {
        fun bind(setting: RevisionSetting) {
            binding.textViewSettingName.text = setting.name
            binding.textViewSettingIntervals.text = "Intervals: ${setting.intervalsDays} days"
            binding.buttonDeleteSetting.setOnClickListener {
                onDeleteClicked(setting)
            }
        }
    }
}

class RevisionSettingDiffCallback : DiffUtil.ItemCallback<RevisionSetting>() {
    override fun areItemsTheSame(oldItem: RevisionSetting, newItem: RevisionSetting): Boolean {
        return oldItem.id == newItem.id
    }

    override fun areContentsTheSame(oldItem: RevisionSetting, newItem: RevisionSetting): Boolean {
        return oldItem == newItem
    }
}
