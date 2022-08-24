class InterviewChannel < ApplicationCable::Channel
  def subscribed
     @interviewee = Interviewee.find(params[:id])

     stream_from "interviewees"
     stream_for @interviewee
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end
end
