import { requireNativeView } from 'expo';
import * as React from 'react';

import { LocationModuleViewProps } from './LocationModule.types';

const NativeView: React.ComponentType<LocationModuleViewProps> =
  requireNativeView('LocationModule');

export default function LocationModuleView(props: LocationModuleViewProps) {
  return <NativeView {...props} />;
}
