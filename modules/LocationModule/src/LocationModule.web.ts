import { registerWebModule, NativeModule } from 'expo';

import { ChangeEventPayload } from './LocationModule.types';

type LocationModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
}

class LocationModule extends NativeModule<LocationModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
};

export default registerWebModule(LocationModule, 'LocationModule');
