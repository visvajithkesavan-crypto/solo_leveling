package com.sololeveling.companion.api

import com.google.gson.Gson
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.time.LocalDate
import java.time.format.DateTimeFormatter

/**
 * API client for Solo Leveling backend
 */
class ApiClient(
    private val baseUrl: String = "http://10.0.2.2:3001", // Android emulator localhost
    private val accessToken: String
) {
    private val client = OkHttpClient()
    private val gson = Gson()

    /**
     * Send daily health summary to backend
     */
    suspend fun sendDailySummary(
        date: LocalDate,
        steps: Int,
        dataOrigin: String,
        computedAt: String
    ): ApiResponse = withContext(Dispatchers.IO) {
        val payload = DailyHealthSummaryPayload(
            day = date.format(DateTimeFormatter.ISO_LOCAL_DATE),
            steps = steps,
            dataOrigin = dataOrigin,
            computedAt = computedAt
        )

        val jsonBody = gson.toJson(payload)
        val requestBody = jsonBody.toRequestBody("application/json".toMediaType())

        val request = Request.Builder()
            .url("$baseUrl/api/v1/ingest/health/daily-summary")
            .post(requestBody)
            .addHeader("Authorization", "Bearer $accessToken")
            .addHeader("Content-Type", "application/json")
            .build()

        try {
            val response = client.newCall(request).execute()
            val responseBody = response.body?.string() ?: ""

            if (response.isSuccessful) {
                ApiResponse.Success(message = "Steps synced successfully")
            } else {
                ApiResponse.Error(
                    message = "Failed to sync: ${response.code} - $responseBody"
                )
            }
        } catch (e: Exception) {
            ApiResponse.Error(message = "Network error: ${e.message}")
        }
    }
}

/**
 * Request payload for daily health summary
 */
data class DailyHealthSummaryPayload(
    val day: String,
    val steps: Int,
    val dataOrigin: String,
    val computedAt: String
)

/**
 * API response wrapper
 */
sealed class ApiResponse {
    data class Success(val message: String) : ApiResponse()
    data class Error(val message: String) : ApiResponse()
}
