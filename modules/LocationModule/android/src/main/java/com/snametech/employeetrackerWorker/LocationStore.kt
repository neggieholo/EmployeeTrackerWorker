package com.snametech.employeetrackerWorker

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

object LocationStore {
    data class LocationState(
        val latitude: Double,
        val longitude: Double,
        val address: String? = null, // 👈 ADDED COMMA HERE
        val timestamp: Long = System.currentTimeMillis()
    )

    private val _location = MutableStateFlow<LocationState?>(null)
    val location: StateFlow<LocationState?> = _location
    
    fun update(lat: Double, lng: Double, address: String?) {
        // This is correct now! It passes all 4 parameters.
        _location.value = LocationState(lat, lng, address, System.currentTimeMillis())
    }
}