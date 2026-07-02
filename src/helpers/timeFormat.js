import moment from "moment";

export const formatTime24 = (timestamp, timezoneOffset) => {
  if (!Number.isFinite(timestamp) || !Number.isFinite(timezoneOffset)) {
    return "--";
  }

  return moment
    .unix(timestamp)
    .utcOffset(timezoneOffset / 3600)
    .format("HH:mm");
};

export const formatHour24 = (timestamp, timezoneOffset) => {
  if (!Number.isFinite(timestamp) || !Number.isFinite(timezoneOffset)) {
    return "--";
  }

  return moment
    .unix(timestamp)
    .utcOffset(timezoneOffset / 3600)
    .format("HH");
};
