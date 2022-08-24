json.extract! calendar_item, :id, :interviewee_id, :interviewer_id, :start_time, :end_time, :created_at, :updated_at
json.url calendar_item_url(calendar_item, format: :json)
