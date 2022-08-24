import consumer from "./consumer"
import { ajaxHTML } from '../src/ajax'

const init = () => {
  consumer.subscriptions.create("InterviewChannel", {
    connected() {
      // Called when the subscription is ready for use on the server
    },

    disconnected() {
      // Called when the subscription has been terminated by the server
    },

    received(data) {
      if (data.date == DATE && data.interviewee_id != IntervieweeID) {
        ajaxHTML({
          url: FetchInterviewUrl,
          data: data
        })
      }
    }
  });
}

typeof IntervieweeID != 'undefined' && init()
