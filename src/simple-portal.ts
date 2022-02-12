import React, { ReactElement } from 'react';
import { makeObservable, useSimpleState } from '@ivbrajkovic/simple-state';

type Teleport = (
  key: string | ReactElement | undefined,
  value: ReactElement | undefined,
) => void;

type OpenGate = (
  key: string | ReactElement,
  value: ReactElement | undefined,
) => void;
type CloseGate = (key: string | undefined) => void;

const COMMON = 'common';
const DEFAULT_PROPERTIES = new Set([
  'getObserversCount',
  'unobserveAll',
  'observe',
]);

const store = makeObservable({});

const _teleport: Teleport = (key, value) => {
  const _key = typeof key === 'string' ? key : COMMON;
  const _value = typeof key === 'string' ? value : key;
  store[_key] = _value;
  !_value && delete store[_key];
};

export const openGate: OpenGate = (key, value) => {
  _teleport(key, value);
};

export const closeGate: CloseGate = (key) => {
  // eslint-disable-next-line unicorn/no-useless-undefined
  _teleport(key, undefined);
};

export const clearGate = (keys: string | string[] | undefined): void => {
  const _keys = !keys
    ? Object.keys(store)
    : Array.isArray(keys)
    ? keys
    : [keys];

  _keys.filter((key) => !DEFAULT_PROPERTIES.has(key)).forEach(closeGate);
};

export const usePortal = (
  gateName: string,
): [state: unknown, setState: (state: unknown) => void] =>
  useSimpleState(store, gateName);

export const PortalGate: React.FC<{ name: string }> = ({ name = COMMON }) => {
  const [element] = usePortal(name);
  const isValidReactElement =
    typeof element === 'object' && React.isValidElement(element);

  // eslint-disable-next-line unicorn/no-null
  return isValidReactElement ? element : null;
};
