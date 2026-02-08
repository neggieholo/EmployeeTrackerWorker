import android.util.Log
import com.snametech.employeetrackerWorker.RetrofitClient
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

suspend fun fetchAddressFromAaPanel(lat: Double, lon: Double): String {
    return try {
        val response = RetrofitClient.api.getAddress(lat, lon)
        
        if (response.isSuccessful) {
            // response.body() is the GeoResponse object
            response.body()?.display_name ?: "Address not found"
        } else {
            Log.e("LocationService", "Server error: ${response.code()}")
            "Address not found"
        }
    } catch (e: Exception) {
        Log.e("LocationService", "Retrofit fetch failed: ${e.message}")
        "Address not found"
    }
}