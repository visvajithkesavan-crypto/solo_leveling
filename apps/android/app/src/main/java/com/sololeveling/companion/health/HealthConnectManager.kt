package com.sololeveling.companion.health

import android.content.Context
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.request.AggregateRequest
import androidx.health.connect.client.time.TimeRangeFilter
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId

/**
 * Handles Health Connect availability checks, permissions, and data reading
 */
class HealthConnectManager(private val context: Context) {

    private var healthConnectClient: HealthConnectClient? = null

    /**
     * Check if Health Connect is available on this device
     */
    suspend fun isAvailable(): Boolean = withContext(Dispatchers.IO) {
        val availabilityStatus = HealthConnectClient.getSdkStatus(context)
        availabilityStatus == HealthConnectClient.SDK_AVAILABLE
    }

    /**
     * Initialize Health Connect client
     */
    suspend fun initialize() = withContext(Dispatchers.IO) {
        if (isAvailable()) {
            healthConnectClient = HealthConnectClient.getOrCreate(context)
        }
    }

    /**
     * Get required permissions
     */
    fun getRequiredPermissions(): Set<String> {
        return setOf(
            HealthPermission.getReadPermission(StepsRecord::class)
        )
    }

    /**
     * Check if all required permissions are granted
     */
    suspend fun hasAllPermissions(): Boolean = withContext(Dispatchers.IO) {
        val client = healthConnectClient ?: return@withContext false
        val granted = client.permissionController.getGrantedPermissions()
        getRequiredPermissions().all { it in granted }
    }

    /**
     * Read total steps for a specific day
     * @param date The date to read steps for (defaults to today)
     * @return Total steps for the day, or null if no data available
     */
    suspend fun readStepsForDay(date: LocalDate = LocalDate.now()): StepsData? =
        withContext(Dispatchers.IO) {
            val client = healthConnectClient ?: return@withContext null

            try {
                // Define time range for the day (00:00 to 23:59:59.999)
                val startOfDay = date.atStartOfDay(ZoneId.systemDefault()).toInstant()
                val endOfDay = date.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant()

                val timeRangeFilter = TimeRangeFilter.between(startOfDay, endOfDay)

                // Aggregate steps for the day
                val response = client.aggregate(
                    AggregateRequest(
                        metrics = setOf(StepsRecord.COUNT_TOTAL),
                        timeRangeFilter = timeRangeFilter
                    )
                )

                val totalSteps = response[StepsRecord.COUNT_TOTAL] ?: 0L

                // Get data origin (which app contributed the data)
                val dataOrigins = response.dataOrigins.joinToString(", ") { it.packageName }

                StepsData(
                    steps = totalSteps.toInt(),
                    date = date,
                    dataOrigin = dataOrigins.ifEmpty { "unknown" },
                    readAt = Instant.now()
                )
            } catch (e: Exception) {
                e.printStackTrace()
                null
            }
        }
}

/**
 * Data class for steps information
 */
data class StepsData(
    val steps: Int,
    val date: LocalDate,
    val dataOrigin: String,
    val readAt: Instant
)
