package com.example.spacedrepetition.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.navigation.fragment.findNavController
import androidx.navigation.fragment.navArgs
import com.example.spacedrepetition.R
import com.example.spacedrepetition.databinding.FragmentAddEditTopicBinding
import com.example.spacedrepetition.model.RevisionSetting
import com.example.spacedrepetition.model.Topic
import com.example.spacedrepetition.ui.viewmodel.TopicViewModel
import com.example.spacedrepetition.ui.viewmodel.TopicViewModelFactory
import com.google.android.material.snackbar.Snackbar

class AddEditTopicFragment : Fragment() {

    private var _binding: FragmentAddEditTopicBinding? = null
    private val binding get() = _binding!!

    private val topicViewModel: TopicViewModel by viewModels {
        TopicViewModelFactory(requireActivity().application)
    }
    private val args: AddEditTopicFragmentArgs by navArgs()

    private var currentTopic: Topic? = null
    private var revisionSettingsList: List<RevisionSetting> = emptyList()
    private var selectedRevisionSetting: RevisionSetting? = null

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentAddEditTopicBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupObservers()
        setupClickListeners()

        if (args.topicId != -1) {
            // Editing existing topic
            (activity as? AppCompatActivity)?.supportActionBar?.title = "Edit Topic"
            topicViewModel.getTopicById(args.topicId).observe(viewLifecycleOwner) { topic ->
                topic?.let {
                    currentTopic = it
                    binding.editTextTopicName.setText(it.name)
                    // Spinner selection will be handled by revisionSettings observer
                    binding.buttonDeleteTopic.visibility = View.VISIBLE
                }
            }
        } else {
            // Adding new topic
             (activity as? AppCompatActivity)?.supportActionBar?.title = "Add Topic"
            binding.buttonDeleteTopic.visibility = View.GONE
        }
    }

    private fun setupObservers() {
        topicViewModel.allRevisionSettings.observe(viewLifecycleOwner) { settings ->
            settings?.let {
                revisionSettingsList = it
                val settingNames = it.map { s -> s.name }
                val adapter = ArrayAdapter(requireContext(), android.R.layout.simple_spinner_item, settingNames)
                adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
                binding.spinnerRevisionSettings.adapter = adapter

                if (it.isNotEmpty()) {
                    // Pre-select spinner if editing or default
                    val settingToSelectId = currentTopic?.currentRevisionSettingId ?: it.first().id
                    val currentSettingIndex = it.indexOfFirst { s -> s.id == settingToSelectId }
                    if (currentSettingIndex != -1) {
                        binding.spinnerRevisionSettings.setSelection(currentSettingIndex)
                        selectedRevisionSetting = it[currentSettingIndex]
                    } else if (it.isNotEmpty()){
                        binding.spinnerRevisionSettings.setSelection(0)
                        selectedRevisionSetting = it[0]
                    }
                }
            }
        }
    }

    private fun setupClickListeners() {
        binding.buttonSaveTopic.setOnClickListener { saveTopic() }
        binding.buttonDeleteTopic.setOnClickListener { deleteTopic() }
        binding.buttonManageRevisionSettings.setOnClickListener {
            // Navigate to ManageRevisionSettingsFragment
            val action = AddEditTopicFragmentDirections.actionAddEditTopicFragmentToManageRevisionSettingsFragment()
            findNavController().navigate(action)
        }

        binding.spinnerRevisionSettings.onItemSelectedListener = object : android.widget.AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: android.widget.AdapterView<*>?, view: View?, position: Int, id: Long) {
                if (revisionSettingsList.isNotEmpty() && position < revisionSettingsList.size) {
                    selectedRevisionSetting = revisionSettingsList[position]
                }
            }
            override fun onNothingSelected(parent: android.widget.AdapterView<*>?) {
                selectedRevisionSetting = null
            }
        }
    }

    private fun saveTopic() {
        val topicName = binding.editTextTopicName.text.toString().trim()
        if (topicName.isEmpty()) {
            Toast.makeText(context, "Topic name cannot be empty", Toast.LENGTH_SHORT).show()
            return
        }

        if (selectedRevisionSetting == null && revisionSettingsList.isNotEmpty()) {
             // Default to first if nothing explicitly selected but list is available
            selectedRevisionSetting = revisionSettingsList.first()
        }

        if (selectedRevisionSetting == null && revisionSettingsList.isEmpty()){
            Snackbar.make(binding.root, "No revision strategies available. Please add one first.", Snackbar.LENGTH_LONG).show()
            return
        }


        selectedRevisionSetting?.let { setting ->
            if (currentTopic != null) { // Editing
                val updatedTopic = currentTopic!!.copy(
                    name = topicName,
                    currentRevisionSettingId = setting.id // Update setting if changed
                )
                // Reschedule only if setting changed or if it's a new topic being saved
                topicViewModel.updateTopic(updatedTopic, setting.id)
                Snackbar.make(binding.root, "Topic updated", Snackbar.LENGTH_SHORT).show()
            } else { // Adding new
                topicViewModel.insertTopic(topicName, setting.id)
                Snackbar.make(binding.root, "Topic added", Snackbar.LENGTH_SHORT).show()
            }
            findNavController().popBackStack()
        } ?: run {
             Snackbar.make(binding.root, "Please select a revision strategy.", Snackbar.LENGTH_SHORT).show()
        }
    }

    private fun deleteTopic() {
        currentTopic?.let { topic ->
            AlertDialog.Builder(requireContext())
                .setTitle("Delete Topic")
                .setMessage("Are you sure you want to delete '${topic.name}'?")
                .setPositiveButton("Delete") { _, _ ->
                    topicViewModel.deleteTopic(topic)
                    Snackbar.make(binding.root, "Topic deleted", Snackbar.LENGTH_SHORT).show()
                    findNavController().popBackStack()
                }
                .setNegativeButton("Cancel", null)
                .show()
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
