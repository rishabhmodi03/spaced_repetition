package com.example.spacedrepetition.ui.settings

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import androidx.appcompat.app.AlertDialog
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.spacedrepetition.R
import com.example.spacedrepetition.databinding.FragmentManageRevisionSettingsBinding
import com.example.spacedrepetition.model.RevisionSetting
import com.example.spacedrepetition.ui.adapter.RevisionSettingAdapter
import com.example.spacedrepetition.ui.viewmodel.TopicViewModel
import com.example.spacedrepetition.ui.viewmodel.TopicViewModelFactory
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.google.android.material.snackbar.Snackbar
import com.google.android.material.textfield.TextInputLayout

class ManageRevisionSettingsFragment : Fragment() {

    private var _binding: FragmentManageRevisionSettingsBinding? = null
    private val binding get() = _binding!!

    private val topicViewModel: TopicViewModel by viewModels {
        TopicViewModelFactory(requireActivity().application)
    }
    private lateinit var revisionSettingAdapter: RevisionSettingAdapter

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentManageRevisionSettingsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupRecyclerView()
        setupObservers()

        binding.fabAddRevisionSetting.setOnClickListener {
            showAddEditRevisionSettingDialog(null)
        }
    }

    private fun setupRecyclerView() {
        revisionSettingAdapter = RevisionSettingAdapter { setting ->
            // Confirm before deleting
            MaterialAlertDialogBuilder(requireContext())
                .setTitle("Delete Strategy")
                .setMessage("Are you sure you want to delete '${setting.name}'? This cannot be undone.")
                .setNegativeButton("Cancel", null)
                .setPositiveButton("Delete") { _, _ ->
                    topicViewModel.deleteRevisionSetting(setting)
                    Snackbar.make(binding.root, "Strategy '${setting.name}' deleted.", Snackbar.LENGTH_SHORT).show()
                }
                .show()
        }
        binding.recyclerViewRevisionSettings.apply {
            adapter = revisionSettingAdapter
            layoutManager = LinearLayoutManager(context)
        }
    }

    private fun setupObservers() {
        topicViewModel.allRevisionSettings.observe(viewLifecycleOwner) { settings ->
            settings?.let {
                revisionSettingAdapter.submitList(it)
                binding.textViewNoSettings.visibility = if (it.isEmpty()) View.VISIBLE else View.GONE
            }
        }
    }

    private fun showAddEditRevisionSettingDialog(setting: RevisionSetting?) {
        val dialogView = LayoutInflater.from(context).inflate(R.layout.dialog_add_edit_revision_setting, null)
        val editTextName = dialogView.findViewById<EditText>(R.id.editTextSettingNameDialog)
        val editTextIntervals = dialogView.findViewById<EditText>(R.id.editTextSettingIntervalsDialog)
        // Add TextInputLayout references if you use them in the dialog layout for error handling
        // val inputLayoutName = dialogView.findViewById<TextInputLayout>(R.id.textInputLayoutNameDialog)
        // val inputLayoutIntervals = dialogView.findViewById<TextInputLayout>(R.id.textInputLayoutIntervalsDialog)


        setting?.let {
            editTextName.setText(it.name)
            editTextIntervals.setText(it.intervalsDays)
        }

        MaterialAlertDialogBuilder(requireContext())
            .setTitle(if (setting == null) "Add Revision Strategy" else "Edit Revision Strategy")
            .setView(dialogView)
            .setNegativeButton("Cancel", null)
            .setPositiveButton(if (setting == null) "Add" else "Save") { dialog, _ ->
                val name = editTextName.text.toString().trim()
                val intervalsStr = editTextIntervals.text.toString().trim()

                if (name.isBlank() || intervalsStr.isBlank()) {
                    Snackbar.make(binding.root, "Name and intervals cannot be empty.", Snackbar.LENGTH_SHORT).show()
                    // Potentially re-show dialog or highlight errors within dialog
                    return@setPositiveButton
                }
                // Validate intervals (e.g., comma-separated numbers)
                val intervals = intervalsStr.split(",").mapNotNull { it.trim().toIntOrNull() }
                if (intervals.isEmpty() || intervals.any{ it <= 0}) {
                     Snackbar.make(binding.root, "Intervals must be positive numbers, separated by commas.", Snackbar.LENGTH_LONG).show()
                     return@setPositiveButton
                }

                val validatedIntervalsStr = intervals.joinToString(",")

                if (setting == null) { // Add new
                    topicViewModel.insertRevisionSetting(name, validatedIntervalsStr)
                    Snackbar.make(binding.root, "Strategy '$name' added.", Snackbar.LENGTH_SHORT).show()
                } else { // Edit existing - For simplicity, current ViewModel doesn't have update. Re-inserting.
                    // This would ideally be an update operation.
                    // topicViewModel.updateRevisionSetting(setting.copy(name = name, intervalsDays = validatedIntervalsStr))
                    // For now, delete and insert if name changed or use as is if only intervals changed for some reason
                     Snackbar.make(binding.root, "Edit functionality for strategies is illustrative. Re-add if needed.", Snackbar.LENGTH_LONG).show()
                }
            }
            .show()
    }


    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
