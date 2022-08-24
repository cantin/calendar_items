class Interviewee < ApplicationRecord
  has_many :calendar_items

  def interview_list(date)
    sql = CalendarItem.within_a_day(date).order(:id)
    booked = sql.where(interviewee: self, status: :booked).pluck(:interviewer_id)
    records = sql.where(status: :available).where.not(interviewer_id: booked).to_a +
      sql.where(status: :booked, interviewee: self).to_a
    existing = records.group_by(&:start_time)

    #sql = CalendarItem.includes(:interviewer).where(start_time: date..(date+1.day))
    #records = sql.where(status: :available).merge(sql.where(status: :booked, self: interviewee)).to_a
    #booked = records.select(&:booked?).map(&:interviewer)

    #existing = sql.group_by(&:start_time).transform_values do |arr|
      #arr.select do |item|
        #item.booked? || !booked.include?(item.interviewer)
      #end
    #end

    CalendarItem.day_loop(date).map do |start_time, end_time|
      Interview.new(self, start_time, existing[start_time] || [])
    end
  end
end
