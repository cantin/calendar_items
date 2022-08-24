class CalendarItemsChannel < ApplicationCable::Channel
  def subscribed
    @interviewer = Interviewer.find params[:id]
    stream_from "#{@interviewer.id}-#{params[:date]}"
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end
end
