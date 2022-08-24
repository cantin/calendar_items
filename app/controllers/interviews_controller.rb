class InterviewsController < ApplicationController
  before_action :prepare

  def apply
    begin
      @date = @item.start_time.beginning_of_day
      @item.apply!(@interviewee)
      broadcast_changes
    rescue => e
      flash.now[:error] = e
    end
    render 'interviewees/show'
  end

  def cancel
    begin
      @date = @item.start_time.beginning_of_day
      @item.cancel!(@interviewee)
      broadcast_changes
    rescue => e
      flash.now[:error] = e
    end
    render 'interviewees/show'
  end

  def show
    @date = Time.zone.at(Integer(params[:date]))
    @interview = view_context.interview_list_for_interviwee(@date, @interviewee).find { _1.start_time == @item.start_time }
  end

  private def broadcast_changes
    ActionCable.server.broadcast(
      #"#{@item.interviewer.id}-#{@date.to_i}",
      "#{@item.interviewer.id}",
      {
        message: :update,
        content: render_to_string('manage/calendar_items/notify', locals: { item: @item, interviewer: @item.interviewer })
      }
    )

    ActionCable.server.broadcast(
      "interviewees", { message: :update, interviewee_id: @interviewee.id, date: @date.to_i, item_id: @item.id }
    )
  end

  private def prepare
    @interviewee = Interviewee.find(params[:id])
    @item = CalendarItem.find(params[:item_id])
  end
end
