export const getDewPoint = (tempC, humidity) => {
  const temp = Number(tempC);
  const rh = Number(humidity);

  if (!Number.isFinite(temp) || !Number.isFinite(rh) || rh <= 0) {
    return null;
  }

  const a = 17.27;
  const b = 237.7;
  const alpha = (a * temp) / (b + temp) + Math.log(rh / 100);
  const dewPoint = (b * alpha) / (a - alpha);

  return Math.round(dewPoint);
};
