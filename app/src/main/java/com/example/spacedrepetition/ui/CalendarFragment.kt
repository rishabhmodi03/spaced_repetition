package com.example.spacedrepetition.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.spacedrepetition.databinding.FragmentCalendarBinding
import com.example.spacedrepetition.model.Topic
import com.example.spacedrepetition.ui.adapter.CalendarTopicAdapter
import com.example.spacedrepetition.ui.viewmodel.TopicViewModel
import com.example.spacedrepetition.ui.viewmodel.TopicViewModelFactory
import com.example.spacedrepetition.utils.SpacedRepetitionScheduler
import java.text.SimpleDateFormat
import java.util.*

class CalendarFragment : Fragment() {

    private var _binding: FragmentCalendarBinding? = null
    private val binding get() = _binding!!

    private val topicViewModel: TopicViewModel by viewModels {
        TopicViewModelFactory(requireActivity().application)
    }
    private lateinit var calendarTopicAdapter: CalendarTopicAdapter
    private val selectedDateCalendar: Calendar = Calendar.getInstance()
    private val headerDateFormat = SimpleDateFormat("MMMM d, yyyy", Locale.getDefault())


    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentCalendarBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupRecyclerView()
        setupCalendarView()
        updateSelectedDateHeader(selectedDateCalendar.timeInMillis)
        loadTopicsForDate(selectedDateCalendar.timeInMillis)
    }

    private fun setupRecyclerView() {
        calendarTopicAdapter = CalendarTopicAdapter { topic ->
            // Navigate to AddEditTopicFragment to view/edit the topic
            val action = CalendarFragmentDirections.actionCalendarFragmentToAddEditTopicFragment(topic.id)
            findNavController().navigate(action)
        }
        binding.recyclerViewCalendarTopics.apply {
            adapter = calendarTopicAdapter
            layoutManager = LinearLayoutManager(context)
        }
    }

    private fun setupCalendarView() {
        binding.calendarView.setOnDateChangeListener { _, year, month, dayOfMonth ->
            selectedDateCalendar.set(year, month, dayOfMonth)
            val normalizedTime = SpacedRepetitionScheduler.normalizeToStartOfDay(selectedDateCalendar).timeInMillis
            updateSelectedDateHeader(normalizedTime)
            loadTopicsForDate(normalizedTime)
        }
        // Set initial selection to today
        val todayNormalized = SpacedRepetitionScheduler.normalizeToStartOfDay(Calendar.getInstance()).timeInMillis
        binding.calendarView.date = todayNormalized // Ensure calendar view shows today initially
        selectedDateCalendar.timeInMillis = todayNormalized // Sync our internal calendar instance
    }

    private fun updateSelectedDateHeader(dateMillis: Long) {
        binding.textViewSelectedDate.text = "Revisions for ${headerDateFormat.format(Date(dateMillis))}"
    }

    private fun loadTopicsForDate(dateMillis: Long) {
        topicViewModel.getTopicsForDate(dateMillis).observe(viewLifecycleOwner) { topics ->
            topics?.let {
                calendarTopicAdapter.submitList(it)
                binding.textViewNoRevisions.visibility = if (it.isEmpty()) View.VISIBLE else View.GONE
                binding.recyclerViewCalendarTopics.visibility = if (it.isNotEmpty()) View.VISIBLE else View.GONE
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}

// Ensure nav_graph.xml has action from CalendarFragment to AddEditTopicFragment if not already present:
// <fragment
//     android:id="@+id/calendarFragment" ...>
//     <action
//         android:id="@+id/action_calendarFragment_to_addEditTopicFragment"
//         app:destination="@id/addEditTopicFragment" ... />
// </fragment>
