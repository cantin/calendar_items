
import $ from 'jquery'
import modal from './modal'
import { runYetAnotherTurboStream } from './yet_another_turbo_stream'

const ajax = function(opts) {
  if(typeof opts["timeout"] == 'undefined') {
    opts["timeout"] = ajax.timeout;
  }

  //disabled failed callback if gbloal is false
  if (opts['global'] === false) {
    return $.ajax(opts);
  } else {
    return $.ajax(opts).fail((jqxhr, textStatus, errorThrown) => ajax.ajaxErrorCallback(jqxhr, textStatus, errorThrown, opts));
  }
}

ajax.timeout = 10 * 1000

ajax.ajaxErrorCallback = function (jqxhr, exception, _errorThrown) {
  //For error caused by user clicking other links while jqxhr is processing
  if (exception != 'timeout' && !jqxhr.getAllResponseHeaders()) {
    return;
  }
  ajax.showErrorMsg(jqxhr);
};

ajax.showErrorMsg = function() {
  var text = "We're experiencing internet connection issues. Please refresh the page. If the problem persists, please contact the manager.";
  modal(text, { class: 'error ', action_text: 'Refresh' });
};

// Inspired by turbo frame
// Use ajax to request HTML and parse to a document object, and then pass to the next done()
const ajaxHTML = (options) => {
  let $element = options.$element || $(document)
  return ajax({
    dataType: 'html',
    beforeSend: (xhr, settings) => {
      if (!fire($element, 'ajax-html:before-send', [xhr, settings, options])) {
        return false
      }
    },
    ...options
  }).then(function (html) {
    return new DOMParser().parseFromString(html, "text/html")
  }).done((newDocument) => {
    // Handle the first flash message in case of redirection. Usually it's a redirection with error flash.
    // e.g:
    //   In a normal get request, if you are in logged out status, you will be redirect to login page with a flash message.
    //   But with ajaxHTML, instead of redirecting,, you will see a modal with the flash message beacuse of the handle flash function.
    if (newDocument.querySelector('[data-flash]')) {
      let $flash = $(newDocument.querySelector('[data-flash]'))
      if (options.handleFlash !== false) {
        let handleFlash = typeof options.handleFlash == 'function' ? options.handleFlash : (($flash) => {
          $flash.find('button[data-close]').remove()
          modal($flash.html())
        })
        handleFlash($flash)
      }
      $element.trigger('ajax-html:handle-flash', [newDocument, options])
    }
  }).done(newDocument => options.turboStream !== false && runYetAnotherTurboStream(newDocument))
}

const fire = (obj, name, data) => {
  var event = $.Event(name);
  obj.trigger(event, data);
  return event.result !== false;
}

// Replace the selector element with ajax HTML
// Accepts multiple selectors to replace multiple elements
// The last argument is the ajax options
// e.g
//  ajaxHTMLReplace('#replace-me', '#replace-me-two', { url: '..', data: {} })
const ajaxHTMLReplace = (...args) => {
  let options = args.pop()
  let selectors = args

  if ($(selectors[0]).length == 0) {
    throw new Error(`Can't find element with selector ${selectors[0]}.`)
  }

  return ajaxHTML(options).done(newDocument => {
    let nodes = []
    selectors.forEach((selector) => {
      let $node = $(newDocument).find(selector).eq(0)
      if ($node.length) {
        $(selector).eq(0).replaceWith($node)
        $node.trigger('ajax-html:replace-success', [$node, newDocument])
        nodes.push($node)
      } else {
        $(selector).eq(0).trigger('ajax-html:replace-missing', [$(selector).eq(0), newDocument])
      }
    })
    return [selectors, options, nodes, newDocument]
  }).fail((...args) => {
    selectors.forEach(selector => $(selector).eq(0).trigger('ajax-html:replace-error', args))
  })
}

export { ajax, ajaxHTML, ajaxHTMLReplace }

