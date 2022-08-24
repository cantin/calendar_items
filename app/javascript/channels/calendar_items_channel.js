import consumer from "./consumer"
import { runYetAnotherTurboStream } from '../src/yet_another_turbo_stream'

const init = () => {
  consumer.subscriptions.create({
    channel: "CalendarItemsChannel",
    id: InterviewerID,
    date: DATE,
  }, {
    connected() {
      console.log('connected')
    },

    disconnected() {
      // Called when the subscription has been terminated by the server
    },

    received(data) {
      let doc = new DOMParser().parseFromString(data.content, "text/html")
      runYetAnotherTurboStream(doc)
    }
  });
}

typeof InterviewerID !== 'undefined' && init()
