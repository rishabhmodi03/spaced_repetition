package com.example.spacedrepetition.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.spacedrepetition.databinding.FragmentTopicListBinding
import com.example.spacedrepetition.model.Topic
import com.example.spacedrepetition.ui.adapter.TopicAdapter
import com.example.spacedrepetition.ui.viewmodel.TopicViewModel
import com.example.spacedrepetition.ui.viewmodel.TopicViewModelFactory
import com.google.android.material.snackbar.Snackbar

class TopicListFragment : Fragment() {

    private var _binding: FragmentTopicListBinding? = null
    private val binding get() = _binding!!

    private val topicViewModel: TopicViewModel by viewModels {
        TopicViewModelFactory(requireActivity().application)
    }
    private lateinit var topicAdapter: TopicAdapter

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentTopicListBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupRecyclerView()
        setupObservers()

        binding.fabAddTopic.setOnClickListener {
            topicViewModel.onAddNewTopicClicked()
        }
    }

    private fun setupRecyclerView() {
        topicAdapter = TopicAdapter(
            onItemClicked = { topic ->
                topicViewModel.onTopicClicked(topic.id)
            },
            onMarkAsRevisedClicked = { topic ->
                topicViewModel.markTopicAsRevised(topic)
                Snackbar.make(binding.root, "'${topic.name}' marked as revised!", Snackbar.LENGTH_SHORT).show()
            }
        )
        binding.recyclerViewTopics.apply {
            adapter = topicAdapter
            layoutManager = LinearLayoutManager(context)
        }
    }

    private fun setupObservers() {
        topicViewModel.allTopics.observe(viewLifecycleOwner) { topics ->
            topics?.let {
                topicAdapter.submitList(it)
                binding.textViewEmptyList.visibility = if (it.isEmpty()) View.VISIBLE else View.GONE
            }
        }

        topicViewModel.navigateToTopicForm.observe(viewLifecycleOwner) { topicId ->
            topicId?.let {
                // Navigate to AddEditTopicFragment with topicId
                val action = TopicListFragmentDirections.actionTopicListFragmentToAddEditTopicFragment(it)
                findNavController().navigate(action)
                topicViewModel.doneNavigatingToTopicForm()
            } ?: run {
                // topicId is null, navigate for new topic
                 if (topicViewModel.navigateToTopicForm.value == null && !topicViewModel.doneNavigatingCalled) { // Ensure it's a fresh call
                    val action = TopicListFragmentDirections.actionTopicListFragmentToAddEditTopicFragment(-1) // -1 for new topic
                    findNavController().navigate(action)
                    topicViewModel.doneNavigatingToTopicForm() // Reset after navigation
                }
            }
        }
    }

    // Helper in ViewModel to track if doneNavigatingToTopicForm was called for the current navigation attempt
    // Add this to your TopicViewModel:
    // var doneNavigatingCalled = false
    // fun doneNavigatingToTopicForm() {
    //     _navigateToTopicForm.value = null
    //     doneNavigatingCalled = true
    // }
    // fun onAddNewTopicClicked() {
    //     doneNavigatingCalled = false
    //     _navigateToTopicForm.value = null
    // }
    // fun onTopicClicked(topicId: Int) {
    //    doneNavigatingCalled = false
    //    _navigateToTopicForm.value = topicId
    // }


    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}

// Add NavDirections to your navigation graph (e.g., nav_graph.xml)
// <fragment
//     android:id="@+id/topicListFragment"
//     android:name="com.example.spacedrepetition.ui.TopicListFragment"
//     android:label="Topics"
//     tools:layout="@layout/fragment_topic_list">
//     <action
//         android:id="@+id/action_topicListFragment_to_addEditTopicFragment"
//         app:destination="@id/addEditTopicFragment" />
// </fragment>
// <fragment
//     android:id="@+id/addEditTopicFragment"
//     android:name="com.example.spacedrepetition.ui.AddEditTopicFragment"
//     android:label="Add/Edit Topic"
//     tools:layout="@layout/fragment_add_edit_topic">
//     <argument
//         android:name="topicId"
//         app:argType="integer"
//         android:defaultValue="-1" />
// </fragment>
