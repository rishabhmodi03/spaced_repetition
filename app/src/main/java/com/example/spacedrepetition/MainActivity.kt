package com.example.spacedrepetition

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.navigation.NavController
import androidx.navigation.fragment.NavHostFragment
import androidx.navigation.ui.AppBarConfiguration
import androidx.navigation.ui.setupActionBarWithNavController
import androidx.navigation.ui.setupWithNavController
import com.example.spacedrepetition.databinding.ActivityMainBinding

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var navController: NavController

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val navHostFragment = supportFragmentManager
            .findFragmentById(R.id.fragment_container) as NavHostFragment
        navController = navHostFragment.navController

        // Setup BottomNavigationView
        binding.bottomNavigation.setupWithNavController(navController)

        // Setup ActionBar with NavController
        // Define top-level destinations for AppBarConfiguration
        val appBarConfiguration = AppBarConfiguration(
            setOf(
                R.id.topicListFragment, R.id.calendarFragment, R.id.nav_settings // Use the ID from menu/nav_graph
            )
        )
        setupActionBarWithNavController(navController, appBarConfiguration)

        // Optional: Handle reselection of bottom navigation items
        binding.bottomNavigation.setOnItemReselectedListener { item ->
            // To prevent reloading the fragment, or to scroll to top etc.
            // For now, default behavior (do nothing extra)
        }
    }

    override fun onSupportNavigateUp(): Boolean {
        return navController.navigateUp() || super.onSupportNavigateUp()
    }
}
