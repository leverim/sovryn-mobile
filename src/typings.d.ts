type Nullable<T = any> = T | null;

declare module '*.svg' {
  import React = require('react');
  export const ReactComponent: React.SFC<React.SVGProps<SVGSVGElement>>;
  // const src: string;
  // export default src;
  export default ReactComponent;
}

declare module 'obj-multiplex' {
  //
}

declare module 'eth-json-rpc-filters' {
  //
}

declare module 'eth-json-rpc-filters/subscriptionManager' {
  //
}

declare module 'eth-json-rpc-middleware/providerAsMiddleware' {
  //
}
