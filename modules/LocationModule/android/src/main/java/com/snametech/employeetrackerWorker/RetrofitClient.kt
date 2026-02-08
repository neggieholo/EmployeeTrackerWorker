package com.snametech.employeetrackerWorker

import com.google.gson.annotations.SerializedName
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.GET
import retrofit2.http.Query

data class GeoResponse(
    @SerializedName("display_name")
    val display_name: String?
)

interface LocationApiService {
    @GET("reverse.php")
    suspend fun getAddress(
        @Query("lat") latitude: Double,
        @Query("lon") longitude: Double,
        @Query("format") format: String = "json"
    ): Response<GeoResponse>
}

object RetrofitClient {
    private const val BASE_URL = "https://geo.employeetracker.app/"

    val api: LocationApiService by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(LocationApiService::class.java)
    }
}