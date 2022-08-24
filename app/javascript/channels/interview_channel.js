import consumer from "./consumer"
import { ajaxHTML } from '../src/ajax'
import $ from 'jQuery'

const init = () => {
  let config = $('[data-interview]').data('interview')
  consumer.subscriptions.create(
    {
      channel: "InterviewChannel",
      id: config.id,
    }, {
    connected() {
      // Called when the subscription is ready for use on the server
    },

    disconnected() {
      // Called when the subscription has been terminated by the server
    },

    received(data) {
      let config = $('[data-interview]').data('interview')
      if (data.message == 'dismiss' && data.date == config.date) {
        $('[data-date-form]').submit()
      }

      let result = (data.message == 'open' && data.date == config.date) ||
        (data.message == 'update' && data.date == config.date)

      if (result) {
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

