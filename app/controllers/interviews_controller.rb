class InterviewsController < ApplicationController
  before_action :prepare

  def apply
    begin
      @index = params[:index]
      @date = @item.start_time.beginning_of_day
      @item.apply!(@interviewee)
    rescue => e
      flash.now[:error] = e
    end
    render 'interviewees/show'
  end

  def cancel
    begin
      @index = params[:index]
      @date = @item.start_time.beginning_of_day
      @item.cancel!(@interviewee)
    rescue => e
      flash.now[:error] = e
    end
    render 'interviewees/show'
  end

  private def broadcast

    ActionCable.server.broadcast(
  end

  private def set_interviewee
    @interviewee = Interviewee.find(params[:id])
    @item = CalendarItem.find(params[:item_id])
  end
end
