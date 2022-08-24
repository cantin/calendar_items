// Yet Another Turbo Stream
//
// Why: The offical Turbo Stream is highly integrated into the Turbo Drive which we don't want to use.
//
// Unlike the offical turbo-stream who has a dedicated MIME type, YATS uses plain html.
// Always use .html.haml to return a HTML response which contains ya-turbo-stream tags.
//
// How it works:
//   You make a request via either ajaxHTML() or <ya-turbo-frame>.
//   The server returns a HTML response which contains ya-turbo-stream tags.
//   ya-turbo-stream tags get detected and executed.
//
// Custom Action:
//   We are able to define custom actions by pushing action to constant Actions.
//   e.g: add action 'debug'
//   import { Actions } from 'yet_another_turbo_stream'
//   Actions['debug'] = (node, responseDocument) => {
//      console.log(node, document.querySelectorAll('interesting-section'))
//   }

const runYetAnotherTurboStream = (responseDocument) => {
  responseDocument.querySelectorAll('ya-turbo-stream').forEach(node => {
    let action = $(node).attr("action")
    if (Actions[action]) {
      Actions[action](node, responseDocument)
    } else {
      console.log(`Missing action function for action ${action}`)
    }
  })
}

const getTagets = (node) => {
  return $(node).attr('targets') || `#${$(node).attr('target')}`
}

const getTemplate = (node) => {
  return $(node).children('template:first').html()
}

const Actions = {
  append: (node, _responseDocument) => {
    $(getTemplate(node)).appendTo(getTagets(node))
  },
  prepend: (node, _responseDocument) => {
    $(getTemplate(node)).prependTo(getTagets(node))
  },
  before: (node, _responseDocument) => {
    $(getTemplate(node)).insertBefore(getTagets(node))
  },
  after: (node, _responseDocument) => {
    $(getTemplate(node)).insertAfter(getTagets(node))
  },
  replace: (node, _responseDocument) => {
    $(getTagets(node)).replaceWith($(getTemplate(node)))
  },
  update: (node, _responseDocument) => {
    $(getTagets(node)).html($(getTemplate(node)))
  },
  remove: (node, _responseDocument) => {
    $(getTagets(node)).remove()
  },
}

export { Actions, runYetAnotherTurboStream }

