package com.sololeveling.companion

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.lifecycleScope
import com.sololeveling.companion.api.ApiClient
import com.sololeveling.companion.api.ApiResponse
import com.sololeveling.companion.health.HealthConnectManager
import com.sololeveling.companion.ui.theme.SoloLevelingCompanionTheme
import kotlinx.coroutines.launch
import java.time.LocalDate
import java.time.ZoneId
import java.time.format.DateTimeFormatter

class MainActivity : ComponentActivity() {

    private lateinit var healthConnectManager: HealthConnectManager
    private lateinit var permissionLauncher: ActivityResultLauncher<Set<String>>

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        healthConnectManager = HealthConnectManager(this)

        // Register permission launcher
        permissionLauncher = registerForActivityResult(
            ActivityResultContracts.RequestMultiplePermissions()
        ) { permissions ->
            // Handle permission results
            val allGranted = permissions.values.all { it }
            if (allGranted) {
                // Permissions granted, can read health data
            }
        }

        setContent {
            SoloLevelingCompanionTheme {
                MainScreen(
                    healthConnectManager = healthConnectManager,
                    onRequestPermissions = { requestHealthPermissions() }
                )
            }
        }
    }

    private fun requestHealthPermissions() {
        val permissions = healthConnectManager.getRequiredPermissions()
        permissionLauncher.launch(permissions)
    }
}

@Composable
fun MainScreen(
    healthConnectManager: HealthConnectManager,
    onRequestPermissions: () -> Unit
) {
    var isHealthConnectAvailable by remember { mutableStateOf(false) }
    var hasPermissions by remember { mutableStateOf(false) }
    var stepsToday by remember { mutableStateOf<Int?>(null) }
    var statusMessage by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }

    // TODO: Get from Supabase auth session
    val accessToken = "YOUR_SUPABASE_ACCESS_TOKEN"

    LaunchedEffect(Unit) {
        isHealthConnectAvailable = healthConnectManager.isAvailable()
        if (isHealthConnectAvailable) {
            healthConnectManager.initialize()
            hasPermissions = healthConnectManager.hasAllPermissions()
        }
    }

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = MaterialTheme.colorScheme.background
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text(
                text = "⚔️ Solo Leveling",
                style = MaterialTheme.typography.headlineMedium,
                color = MaterialTheme.colorScheme.primary
            )

            Spacer(modifier = Modifier.height(32.dp))

            // Health Connect Status
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant
                )
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Health Connect Status",
                        style = MaterialTheme.typography.titleMedium
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = if (isHealthConnectAvailable) {
                            "✓ Available"
                        } else {
                            "✗ Not Available"
                        },
                        style = MaterialTheme.typography.bodyMedium
                    )
                    Text(
                        text = "Permissions: ${if (hasPermissions) "✓ Granted" else "✗ Not Granted"}",
                        style = MaterialTheme.typography.bodyMedium
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Steps Display
            if (stepsToday != null) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.primaryContainer
                    )
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "Steps Today",
                            style = MaterialTheme.typography.titleMedium
                        )
                        Text(
                            text = stepsToday.toString(),
                            style = MaterialTheme.typography.displayLarge,
                            color = MaterialTheme.colorScheme.primary
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))
            }

            // Action Buttons
            if (!isHealthConnectAvailable) {
                Text(
                    text = "Health Connect is not available on this device",
                    color = MaterialTheme.colorScheme.error,
                    style = MaterialTheme.typography.bodySmall
                )
            } else if (!hasPermissions) {
                Button(
                    onClick = onRequestPermissions,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("Grant Health Permissions")
                }
            } else {
                Button(
                    onClick = {
                        isLoading = true
                        kotlinx.coroutines.MainScope().launch {
                            val stepsData = healthConnectManager.readStepsForDay()
                            stepsToday = stepsData?.steps
                            statusMessage = if (stepsData != null) {
                                "Read ${stepsData.steps} steps from ${stepsData.dataOrigin}"
                            } else {
                                "No steps data available"
                            }
                            isLoading = false
                        }
                    },
                    modifier = Modifier.fillMaxWidth(),
                    enabled = !isLoading
                ) {
                    Text(if (isLoading) "Reading..." else "Read Steps Today")
                }

                Spacer(modifier = Modifier.height(12.dp))

                Button(
                    onClick = {
                        isLoading = true
                        kotlinx.coroutines.MainScope().launch {
                            val stepsData = healthConnectManager.readStepsForDay()
                            if (stepsData != null) {
                                val apiClient = ApiClient(accessToken = accessToken)
                                val response = apiClient.sendDailySummary(
                                    date = stepsData.date,
                                    steps = stepsData.steps,
                                    dataOrigin = stepsData.dataOrigin,
                                    computedAt = stepsData.readAt.atZone(ZoneId.systemDefault())
                                        .format(DateTimeFormatter.ISO_OFFSET_DATE_TIME)
                                )

                                statusMessage = when (response) {
                                    is ApiResponse.Success -> "✓ ${response.message}"
                                    is ApiResponse.Error -> "✗ ${response.message}"
                                }
                            } else {
                                statusMessage = "✗ No steps data to sync"
                            }
                            isLoading = false
                        }
                    },
                    modifier = Modifier.fillMaxWidth(),
                    enabled = !isLoading && stepsToday != null
                ) {
                    Text(if (isLoading) "Syncing..." else "Sync to Backend")
                }
            }

            // Status Message
            if (statusMessage.isNotEmpty()) {
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = statusMessage,
                    style = MaterialTheme.typography.bodySmall,
                    color = if (statusMessage.startsWith("✓")) {
                        MaterialTheme.colorScheme.primary
                    } else {
                        MaterialTheme.colorScheme.error
                    }
                )
            }
        }
    }
}
