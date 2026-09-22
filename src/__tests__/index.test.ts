/* eslint-disable @typescript-eslint/no-empty-function */
jest.mock('ws', () => {
  const MockWebSocket: jest.Mock & {
    CONNECTING: number;
    OPEN: number;
    CLOSING: number;
    CLOSED: number;
  } = Object.assign(
    jest.fn().mockImplementation(() => {
      const closeListeners: Array<() => void> = [];

      return {
        on: jest.fn((event: string, listener: () => void) => {
          if (event === 'close') {
            closeListeners.push(listener);
          }
        }),
        close: jest.fn(() => {
          closeListeners.forEach((listener) => listener());
        }),
        terminate: jest.fn(),
        send: jest.fn(),
        readyState: 0
      };
    }),
    { CONNECTING: 0, OPEN: 1, CLOSING: 2, CLOSED: 3 }
  );

  return MockWebSocket;
});

import RemootioDevice = require('../index');

const testIp = '192.168.1.15';
const testApiSecretKey =
  'C85B1CF44398C3BA36B35D63CD779C0A265F9592FF9C5D85EFA16E3C4121B4F6';
const testApiAuthKey =
  'F01AEB37D9E79FB213ACA2CFB48BECF6C1513F1C5623534799B3BEFE8EF681A0';

const delay = (ms: number) =>
  new Promise<void>((resolve) =>
    setTimeout(() => {
      resolve();
    }, ms),
  );

test('Can be imported with simple require as shown in docs', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const RequiredRemootioDevice = require('../index');

  expect(RequiredRemootioDevice).not.toBeUndefined();

  const instance = new RequiredRemootioDevice(
      testIp,
      testApiSecretKey,
      testApiAuthKey,
  );

  expect(instance).toBeInstanceOf(RemootioDevice);
});

describe('Test RemootioDevice', () => {
  let instance: RemootioDevice;

  beforeAll(async () => {
    instance = new RemootioDevice(testIp, testApiSecretKey, testApiAuthKey);
  });
  afterAll(() => {
    instance.disconnect();
  });

  test('Client has correct default fields', () => {
    expect(instance).toBeInstanceOf(RemootioDevice);

    // Default client should not be connected nor authenticated
    expect(instance.isConnected).toBe(false);
    expect(instance.isAuthenticated).toBe(false);

    // Last sent action id should be undefined
    expect(instance.theLastActionId).toBeUndefined();
  });

  test('Client can emit events', async () => {
    expect(instance).toBeInstanceOf(RemootioDevice);

    const connectingCallback = jest.fn(() => {});
    instance.on('connecting', connectingCallback);

    const connectedCallback = jest.fn(() => {});
    instance.on('connected', connectedCallback);

    const disconnectCallback = jest.fn(() => {});
    instance.on('disconnect', disconnectCallback);

    instance.connect(false);

    await delay(500);

    expect(connectingCallback).toHaveBeenCalled();
    expect(connectedCallback).not.toHaveBeenCalled();
    expect(disconnectCallback).not.toHaveBeenCalled();

    instance.disconnect();
    await delay(500);
    expect(disconnectCallback).toHaveBeenCalled();
  });
});
