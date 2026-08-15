export type TelephonyConnectionType = "analog" | "digital";
export type TelephonyTariff = "unlimited" | "timed";

export const telephonyPricing = {
  ordinary: {
    connectionOneTime: { analog: 244, digital: 155 },
    monthly: { unlimited: 555, timed: 0 },
    trafficPerMinute: 0.6
  },
  multichannel: {
    portMonthly: {
      analog: { unlimited: 799, timed: 244 },
      digital: { unlimited: 710, timed: 155 }
    },
    trafficPerMinute: 0.6,
    setup: {
      analog: {
        base: [
          { ports: 2, price: 6000 },
          { ports: 4, price: 8000 },
          { ports: 8, price: 14000 }
        ],
        additional: [
          { ports: 1, price: 2000 },
          { ports: 2, price: 3500 },
          { ports: 4, price: 6000 }
        ]
      },
      digital: {
        base: [
          { ports: 4, price: 3000 },
          { ports: 8, price: 5000 }
        ],
        additional: [
          { ports: 1, price: 1000 },
          { ports: 4, price: 3000 }
        ]
      }
    }
  },
  pro: {
    installation: 5000,
    portOneTime: 155,
    lineMonthly: { unlimited: 799, timed: 155 },
    extraNumberMonthly: 100,
    trafficPerMinute: 0.6
  },
  virtualPbx: {
    portMonthly: {
      analog: 244,
      digital: 155
    },
    externalLineMonthly: {
      analog: { unlimited: 555, timed: 0 },
      digital: { unlimited: 555, timed: 0 }
    },
    extraNumberMonthly: 100,
    extraNumberOneTime: 155,
    extraExternalLineOneTime: 155,
    trafficPerMinute: 0.6,
    setup: {
      analog: {
        base: [
          { ports: 2, price: 6000 },
          { ports: 4, price: 8000 },
          { ports: 8, price: 14000 }
        ],
        additional: [
          { ports: 1, price: 2000 },
          { ports: 2, price: 3500 },
          { ports: 4, price: 6000 }
        ]
      },
      digital: {
        base: [
          { ports: 4, price: 3000 },
          { ports: 8, price: 5000 }
        ],
        additional: [
          { ports: 1, price: 1000 },
          { ports: 4, price: 3000 }
        ]
      }
    }
  }
} as const;

export type TelephonyPricing = typeof telephonyPricing;
