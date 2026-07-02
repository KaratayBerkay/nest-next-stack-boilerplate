function add_level_name(tag, timestamp, record)
  local names = {
    [10] = "trace",
    [20] = "debug",
    [30] = "info",
    [40] = "warn",
    [50] = "error",
    [60] = "fatal",
  }
  record["level_name"] = names[record["level"]] or "unknown"
  return 1, timestamp, record
end
