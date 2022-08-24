import { createConsumer } from "@rails/actioncable"

let consumer = createConsumer()

let subscriptions = consumer.subscriptions.create({
  channel: "InterviewChannel",
  slug: IntervieweeID,
  date: date,
}, {
  received: data => received(data),
  //initialized: data => this.constructor.emit('initialized'),
  //connected: data => this.constructor.emit('connected'),
  //disconnected: data => this.constructor.emit('disconnected'),
  //rejected: data => this.constructor.emit('rejected')
});

const received = () => {
}
