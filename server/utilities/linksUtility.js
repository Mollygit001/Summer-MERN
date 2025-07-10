const getDeviceInfo = (userAgent) => {
  const isMobile = /mobile/i.test(userAgent);
  const match = userAgent.match(/(firefox|msie|trident|chrome|safari|opera|opr)/i);
  const browser = match ? match[0] : 'unknown';

  return {
    deviceType: isMobile ? 'Mobile' : 'Desktop',
    browser: browser,
  };
};

export default getDeviceInfo;
