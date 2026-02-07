package com.snametech.employeetrackerWorker

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

object LocationStore {
    data class LocationState(
        val latitude: Double,
        val longitude: Double,
        val address: String? = null
    )

    private val _location = MutableStateFlow<LocationState?>(null)
    val location: StateFlow<LocationState?> = _location
    

    fun update(lat: Double, lng: Double, address: String?) {
        _location.value = LocationState(lat, lng, address)
    }
}