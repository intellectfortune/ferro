-- Add "Content Shoot" as a calendar event type, alongside service/detailing/
-- inspection/blocked, for when a vehicle is out for photo/video content
-- instead of maintenance.
alter type calendar_event_type add value 'content_shoot';
