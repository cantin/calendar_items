class CalendarItemsController < ApplicationController
  before_action :set_interviewer

  def create
    @calendar_item = @interviewer.calendar_items.build(
      start_time: Time.zone.at(Integer(params[:start_time_in_sec])),
      duration: CalendarItem::Duration,
      status: :available
    )
    @calendar_item.save!

    @date = @calendar_item.start_time.beginning_of_day
    ActionCable.server.broadcast(
      "interviewees", { message: :open, date: @date.to_i, item_id: @calendar_item.id }
    )
  rescue => e
    flash[:error] = "Unable to make calendar item available. Please try again. #{e}"
  end

  def update
    @calendar_item = @interviewer.calendar_items.find(params[:id])

    raise 'Wrong state' unless @calendar_item.canceled?
    @calendar_item.update!(status: :available)

    @date = @calendar_item.start_time.beginning_of_day
    ActionCable.server.broadcast(
      "interviewees", { message: :open, date: @date.to_i, item_id: @calendar_item.id }
    )
    render 'create'
  end

  def cancel
    @calendar_item = @interviewer.calendar_items.find(params[:id])
    @interviewee = @calendar_item.interviewee
    @calendar_item.dismiss!

    @date = @calendar_item.start_time.beginning_of_day
    if @interviewee
      InterviewChannel.broadcast_to(@interviewee, { message: :dismiss, interviewee_id: @interviewee.id, date: @date.to_i, item_id: @calendar_item.id })
    else
      ActionCable.server.broadcast(
        "interviewees", { message: :dismiss, date: @date.to_i, item_id: @calendar_item.id }
      )
    end
  end

  private def set_interviewer
    @interviewer = Interviewer.find(params[:interviewer_id])
  end

  private
  # Use callbacks to share common setup or constraints between actions.
  def set_calendar_item
    @calendar_item = CalendarItem.find(params[:id])
  end
end

