class InterviewChannel < ApplicationCable::Channel
  def subscribed
     stream_from "interviewees"
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end
end
