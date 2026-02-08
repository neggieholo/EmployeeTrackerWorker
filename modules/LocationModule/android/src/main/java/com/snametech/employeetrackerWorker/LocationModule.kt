package com.snametech.employeetrackerWorker

import android.annotation.SuppressLint
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.graphics.Paint
import android.graphics.pdf.PdfDocument
import androidx.core.content.ContextCompat
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.*
import android.util.Log
import androidx.core.net.toUri
import android.os.PowerManager
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.Settings
import java.io.File
import java.io.FileOutputStream
import android.app.DatePickerDialog
import java.util.Calendar
import expo.modules.kotlin.Promise

class LocationModule : Module() {

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main)

    @SuppressLint("BatteryLife")
    override fun definition() = ModuleDefinition {

        Name("LocationModule")

        Events("onLocationUpdate")

        OnCreate {
            Log.d("LocationModule", "EXPO MODULE INITIALIZED")
            val manager = appContext.reactContext?.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val channel = NotificationChannel(
                    "location_channel",
                    "Location Tracking Channel",
                    NotificationManager.IMPORTANCE_LOW
                )
                manager.createNotificationChannel(channel)
                }
            scope.launch {
                // LocationStore is now found locally
                LocationStore.location.collect { state ->
                    if (state != null) {
                        sendEvent(
                            "onLocationUpdate",
                            mapOf(
                                "latitude" to state.latitude,
                                "longitude" to state.longitude,
                                "address" to (state.address ?: "Searching..."),
                                "timestamp" to state.timestamp
                            )
                        )
                    }
                }
            }
        }

        OnDestroy {
            scope.cancel()
        }

        Function("startTracking") {
            Log.d("LocationModule", "StartTracking function called from JS") // <--- NATIVE LOG
            
            val mContext = appContext.reactContext ?: run {
                Log.e("LocationModule", "Context is NULL!")
                return@Function false
            }
            
            val intent = Intent(mContext, LocationService::class.java)
            
            ContextCompat.startForegroundService(mContext, intent)
            Log.d("LocationModule", "Foreground Service intent sent") // <--- NATIVE LOG
            return@Function true
        }

        
        Function("stopTracking") {
            val mContext = appContext.reactContext ?: return@Function false
            val intent = Intent(mContext, LocationService::class.java)
            mContext.stopService(intent)
            return@Function true
        }

        // Inside LocationModule.kt
        Function("requestBatteryOptimization") {
            val intent = Intent()
            val packageName = appContext.reactContext?.packageName
            
            // Check if we can go directly to the app's specific toggle
            intent.action = android.provider.Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS
            intent.data = "package:$packageName".toUri()
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            
            appContext.reactContext?.startActivity(intent)
        }


        Function("isBatteryOptimizationIgnored") {
            val powerManager = appContext.reactContext?.getSystemService(Context.POWER_SERVICE) as? PowerManager
            val packageName = appContext.reactContext?.packageName
            return@Function powerManager?.isIgnoringBatteryOptimizations(packageName) ?: false
        }

        Function("saveCSV") { fileName: String, content: String ->
            try {
                // Use the Public Downloads folder
                val downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
                val file = File(downloadsDir, fileName)

                file.writeText(content)
                return@Function "Saved to Downloads: ${file.name}"
            } catch (e: Exception) {
                return@Function "Error: ${e.message}"
            }
        }

        Function("generateSimplePDF") { fileName: String, content: String ->
            try {
                val downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
                val file = File(downloadsDir, fileName)

                val pdfDocument = PdfDocument()
                val pageInfo = PdfDocument.PageInfo.Builder(595, 842, 1).create()
                val page = pdfDocument.startPage(pageInfo)

                val canvas = page.canvas
                val paint = Paint()
                paint.textSize = 12f

                var y = 40f
                content.split("\n").forEach { line ->
                    canvas.drawText(line, 40f, y, paint)
                    y += 20f
                }

                pdfDocument.finishPage(page)
                val outputStream = FileOutputStream(file)
                pdfDocument.writeTo(outputStream)

                pdfDocument.close()
                outputStream.close()

                return@Function "Saved to Downloads: ${file.name}"
            } catch (e: Exception) {
                return@Function "Error: ${e.message}"
            }
        }
        
       
        AsyncFunction("showNativePicker") { promise: Promise ->
            // The label here MUST match the "AsyncFunction" name
            val activity = appContext.currentActivity ?: return@AsyncFunction
            
            val cal = Calendar.getInstance()
            val dpd = DatePickerDialog(activity, { _, year, month, dayOfMonth ->
                val m = month + 1
                val dateString = String.format("%d-%02d-%02d", year, m, dayOfMonth)
                promise.resolve(dateString)
            }, cal.get(Calendar.YEAR), cal.get(Calendar.MONTH), cal.get(Calendar.DAY_OF_MONTH))
            
            dpd.show()
        }
    } 
}