const RNOtpVerify = {
  getHash: () => Promise.resolve([]),
  getOtp: () => Promise.resolve(false),
  addListener: () => ({remove: () => {}}),
  removeListener: () => {},
  startOtpListener: () => Promise.resolve({remove: () => {}}),
  requestHint: () => Promise.resolve(''),
};

export default RNOtpVerify;
