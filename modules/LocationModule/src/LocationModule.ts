import { NativeModule, requireNativeModule } from 'expo';

import { LocationModuleEvents } from './LocationModule.types';

declare class LocationModule extends NativeModule<LocationModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<LocationModule>('LocationModule');
