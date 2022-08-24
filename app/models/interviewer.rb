class Interviewer < ApplicationRecord
  has_many :calendar_items

  def calendar_item_list(date)
    existing = self.calendar_items.where(start_time: date..(date + 1.day)).group_by(&:start_time)

    CalendarItem.day_loop(date).map do |start_time, end_time|
      existing[start_time]&.first || CalendarItem.new(interviewer: self, start_time:, duration: CalendarItem::Duration)
    end
  end
end
