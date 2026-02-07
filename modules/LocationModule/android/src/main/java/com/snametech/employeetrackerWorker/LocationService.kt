package com.snametech.employeetrackerWorker

import android.annotation.SuppressLint
import android.app.Service
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.IBinder
import android.os.Looper
import android.util.Log
import androidx.core.app.NotificationCompat
import com.google.android.gms.location.*
import android.location.Geocoder
import android.os.Build
import com.google.android.gms.location.FusedLocationProviderClient
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.util.Locale

class LocationService : Service() {

    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private lateinit var locationCallback: LocationCallback
    private val serviceScope = CoroutineScope(Dispatchers.IO)

    private var lastGeocodedLat: Double = 0.0
    private var lastGeocodedLon: Double = 0.0
    private var lastAddress: String = "Locating..."
    private val movementThreshold = 0.0001

    override fun onCreate() {
        super.onCreate()
        Log.d("LocationService", "Native Service is actually CREATED")
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)
        
    }

    private fun shouldUpdateAddress(newLat: Double, newLon: Double): Boolean {
        val latDiff = Math.abs(newLat - lastGeocodedLat)
        val lonDiff = Math.abs(newLon - lastGeocodedLon)
        return latDiff > movementThreshold || lonDiff > movementThreshold
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // Foreground notification required for continuous tracking
        val notification = NotificationCompat.Builder(this, "location_channel")
            .setContentTitle("Location Tracking Active")
            .setContentText("Your current location is being fetched in the background.")
            .setSmallIcon(R.drawable.ic_location)
            .setOngoing(true)
            .build()

        // Instead of the old way, use this for Android 14 compatibility:
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            startForeground(1, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION)
        } else {
            startForeground(1, notification)
        }

        // Start GPS tracking
        startLocationUpdates()

        return START_STICKY
    }

    @SuppressLint("MissingPermission")
    private fun startLocationUpdates() {
        val request = LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 5000L)
            .setMinUpdateIntervalMillis(3000L)
            .build()

        locationCallback = object : LocationCallback() {
            override fun onLocationResult(result: LocationResult) {
                val location = result.lastLocation ?: return

                // Check if we actually need to hit the network/geocoder
                if (shouldUpdateAddress(location.latitude, location.longitude)) {
                    lastGeocodedLat = location.latitude
                    lastGeocodedLon = location.longitude

                    serviceScope.launch {
                        try {
                            val geocoder = Geocoder(applicationContext, Locale.getDefault())
                            
                            if (Build.VERSION.SDK_INT >= 33) {
                                geocoder.getFromLocation(location.latitude, location.longitude, 1) { addresses ->
                                    lastAddress = if (addresses.isNotEmpty()) addresses[0].getAddressLine(0) else "Address not found"
                                    LocationStore.update(location.latitude, location.longitude, lastAddress)
                                }
                            } else {
                                val addresses = geocoder.getFromLocation(location.latitude, location.longitude, 1)
                                lastAddress = if (!addresses.isNullOrEmpty()) addresses[0].getAddressLine(0) else "Address not found"
                                LocationStore.update(location.latitude, location.longitude, lastAddress)
                            }
                        } catch (e: Exception) {
                            Log.e("LocationService", "Geocoder error: ${e.message}")
                        }
                    }
                } else {
                    // Just update the coords in UI, reuse the last address string
                    LocationStore.update(location.latitude, location.longitude, lastAddress)
                    Log.d("LocationService", "Skipping Geocoder - Movement below threshold")
                }
            }
        }

        fusedLocationClient.requestLocationUpdates(request, locationCallback, Looper.getMainLooper())
    }

    override fun onDestroy() {
        fusedLocationClient.removeLocationUpdates(locationCallback)
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
