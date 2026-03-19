-- Run this in Supabase SQL Editor to pin all Bookmarks Bar items
-- that were already imported without the pinned flag

UPDATE bookmarks
SET pinned = true
WHERE description LIKE '%Bookmarks Bar%'
  AND pinned = false;
