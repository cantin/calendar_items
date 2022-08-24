module CalendarItemsHelper
  def calendar_item_candidate_list(date, interviewer)
    existing = interviewer.calendar_items.where(start_time: date..(date + 1.day)).group_by(&:start_time)

    CalendarItem.day_loop(date).map do |start_time, end_time|
      existing[start_time]&.first || CalendarItem.new(interviewer:, start_time:, duration: CalendarItem::Duration)
    end
  end

  def interview_list_for_interviwee(date, interviewee)
    sql = CalendarItem.where(start_time: date..(date+1.day)).order(:id)
    booked = sql.where(interviewee: interviewee, status: :booked).pluck(:interviewer_id)
    records = sql.where(status: :available).where.not(interviewer_id: booked).to_a +
      sql.where(status: :booked, interviewee: interviewee).to_a
    existing = records.group_by(&:start_time)

    #sql = CalendarItem.includes(:interviewer).where(start_time: date..(date+1.day))
    #records = sql.where(status: :available).merge(sql.where(status: :booked, interviewee: interviewee)).to_a
    #booked = records.select(&:booked?).map(&:interviewer)

    #existing = sql.group_by(&:start_time).transform_values do |arr|
      #arr.select do |item|
        #item.booked? || !booked.include?(item.interviewer)
      #end
    #end

    CalendarItem.day_loop(date).map do |start_time, end_time|
      Interview.new(interviewee, start_time, existing[start_time] || [])
    end
  end

  def fmt_calendar_item_time(item)
    item.start_time.strftime("%H:%M")
  end
end
