package com.sololeveling.companion.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val DarkColorScheme = darkColorScheme(
    primary = Color(0xFFB8860B), // Gold - Solo Leveling theme
    secondary = Color(0xFF4A4A4A),
    tertiary = Color(0xFF7A7A7A),
    background = Color(0xFF1A1A1A),
    surface = Color(0xFF2A2A2A),
    onPrimary = Color.Black,
    onSecondary = Color.White,
    onBackground = Color.White,
    onSurface = Color.White,
)

@Composable
fun SoloLevelingCompanionTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        content = content
    )
}
