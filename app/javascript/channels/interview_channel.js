import consumer from "./consumer"
import { ajaxHTML } from '../src/ajax'
import $ from 'jQuery'

const init = () => {
  consumer.subscriptions.create("InterviewChannel", {
    connected() {
      // Called when the subscription is ready for use on the server
    },

    disconnected() {
      // Called when the subscription has been terminated by the server
    },

    received(data) {
      let config = $('[data-interview]').data('interview')
      if (data.message == 'update' && data.date == config.date && data.interviewee_id != config.id) {
        ajaxHTML({
          url: config.url,
          data: data
        })
      }
    }
  });
}

$(() => {
  if ($('[data-interview]').length) {
    init()
  }
})

