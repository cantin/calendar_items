module CalendarItemsHelper
  def fmt_calendar_item_time(item)
    item.start_time.strftime("%H:%M")
  end
end
