import * as React from 'react';

import { LocationModuleViewProps } from './LocationModule.types';

export default function LocationModuleView(props: LocationModuleViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
