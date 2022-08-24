import consumer from "./consumer"
import { runYetAnotherTurboStream } from '../src/yet_another_turbo_stream'
import $ from 'jQuery'

const init = () => {
  let id = $('[data-calendar-item-list]').data('calendar-item-list').id
  consumer.subscriptions.create({
    channel: "CalendarItemsChannel",
    id: id,
  }, {
    connected() {
      console.log('connected')
    },

    disconnected() {
      // Called when the subscription has been terminated by the server
    },

    received(data) {
      if (data.message == 'update') {
        let doc = new DOMParser().parseFromString(data.content, "text/html")
        runYetAnotherTurboStream(doc)
      }
    }
  });
}

$(() => {
  if ($('[data-calendar-item-list]').length) {
    init()
  }
})

