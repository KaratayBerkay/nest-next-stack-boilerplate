-- Rewrite tag based on the `category` field for structured event routing.
-- session.* events → session-logs index
-- exception.* events → exception-logs index
-- page.* events (frontend) → page-logs index
-- Unmatched records keep their original tag.
function route_category(tag, timestamp, record)
  local cat = record["category"]
  if cat == "session" then
    return 0, "session", timestamp, record
  end
  if cat == "exception" then
    return 0, "exception", timestamp, record
  end
  if cat == "page" then
    return 0, "page", timestamp, record
  end
  return 1, tag, timestamp, record
end
