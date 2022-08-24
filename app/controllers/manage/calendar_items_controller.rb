class Manage::CalendarItemsController < ApplicationController
  before_action :set_interviewer

  def create
    @calendar_item = @interviewer.calendar_items.build(
      start_time: Time.zone.at(Integer(params[:start_time_in_sec])),
      duration: CalendarItem::Duration,
      status: 'available'
    )
    @index = params[:index]
    @calendar_item.save!
  rescue => e
    flash[:error] = "Unable to make calendar item available. Please try again. #{e}"
  end

  def update
    @calendar_item = @interviewer.calendar_items.find(params[:id])
    @calendar_item.update!(status: :available)
    @index = params[:index]
    render 'create'
  end

  def cancel
    @calendar_item = @interviewer.calendar_items.find(params[:id])
    @calendar_item.update!(status: :canceled)
    @index = params[:index]
  end

  private def set_interviewer
    @interviewer = Interviewer.find(params[:interviewer_id])
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_calendar_item
      @calendar_item = CalendarItem.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def calendar_item_params
      params.require(:calendar_item).permit(:interviewee_id, :interviewer_id, :start_time, :end_time)
    end
end

