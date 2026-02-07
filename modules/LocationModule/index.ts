import { requireNativeModule, EventSubscription } from 'expo-modules-core';

// 1. Define the event map
// type LocationEvents = {
//   onLocationUpdate: (event: {
//     latitude: number;
//     longitude: number;
//     address: string;
//   }) => void;
// };

// 2. Load the Native Module 
// We cast it to its type + the emitter logic
const LocationTrackingModule = requireNativeModule('LocationModule');

// 3. Export the functions
export function startTracking(): void {
  return LocationTrackingModule.startTracking();
}

export function stopTracking(): void {
  return LocationTrackingModule.stopTracking();
}

export function requestBatteryOptimization(): void {
  return LocationTrackingModule.requestBatteryOptimization();
}

export function isBatteryOptimizationIgnored(): Promise<boolean> {
  return LocationTrackingModule.isBatteryOptimizationIgnored();
}

// 4. Use the module itself to add the listener
export function addLocationListener(
  listener: (event: { latitude: number; longitude: number; address: string }) => void
): EventSubscription {
  // In SDK 52, we call addListener directly on the module
  return LocationTrackingModule.addListener('onLocationUpdate', listener);
}

// Add to your index.ts

export function saveCSV(fileName: string, content: string): string {
  return LocationTrackingModule.saveCSV(fileName, content);
}

export function generateSimplePDF(fileName: string, content: string): string {
  return LocationTrackingModule.generateSimplePDF(fileName, content);
}

export function showNativePicker(): Promise<string> {
  return LocationTrackingModule.showNativePicker();
}

export default LocationTrackingModule;