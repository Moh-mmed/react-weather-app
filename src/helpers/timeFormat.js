import moment from "moment";

export const formatTime = (timestamp, timezoneOffset, hourFormat = "24h") => {
  if (!Number.isFinite(timestamp) || !Number.isFinite(timezoneOffset)) {
    return "--";
  }

  return moment
    .unix(timestamp)
    .utcOffset(timezoneOffset / 3600)
    .format(hourFormat === "12h" ? "h:mm A" : "HH:mm");
};

export const formatHour = (timestamp, timezoneOffset, hourFormat = "24h") => {
  if (!Number.isFinite(timestamp) || !Number.isFinite(timezoneOffset)) {
    return "--";
  }

  return moment
    .unix(timestamp)
    .utcOffset(timezoneOffset / 3600)
    .format(hourFormat === "12h" ? "h A" : "HH");
};

export const formatTime24 = (timestamp, timezoneOffset) =>
  formatTime(timestamp, timezoneOffset, "24h");

export const formatHour24 = (timestamp, timezoneOffset) =>
  formatHour(timestamp, timezoneOffset, "24h");
