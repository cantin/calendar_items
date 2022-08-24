// Yet Another Turbo Frame.
//
// Why: The offical Turbo Frame is highly integrated into the Turbo Drive which we don't want to use.
//
// Functions:
// YATF supports the replacing feature and attributes src, disabled, data-ya-turbo-method and data-ya-turbo-frame.
// Other than that, we also added some customizations:
//
//  <ya-turbo-frame> Custom Attributes:
//     global:
//       Indicates whether enable gloabl error handler or not, check ajax.js for more details.
//
//     handle-flash:
//       Indicates whether enable the default handle flash function or not.
//       The default one is showing the flash content via a modal.
//
//     targets:
//       A way to update multiple frames in one request. The value must be a list of frame id, split by comma
//       e.g:
//         <ya-turbo-frame id='repalce1' targets='replace2, replace3'>
//         The replace1, repalce2 and replace3 frames will be replaced correspondingly when the response of replace1 frame comes
//
//   HTML Element Custom Attributes:
//     be-ya-turbo-frame:
//       The <ya-turbo-frame> element can't be embedded in some elements such as <table>, <tbody>.
//       To be able to repalce elements like <tbody>, <tr>, we introduced a attribute called be-ya-turbo-frame.
//       If a element has attribute be-ya-turbo-frame, then it would be treated as a ya-turbo-frame.
//
//       e.g: given a tr
//         <tr id='replace-me' be-ya-turbo-frame=true>...</tr>
//       This tr would be replaced with element matched either ya-turbo-frame#replace-me or tr#replace-me[be-ya-turbo-frame].
//
//       Caveat: in the case above you must return tr#replace-me[be-ya-turbo-frame] as the top element of response,
//       because the ya-turbo-frame#replace-me is invalid in <tbody> for browser.
//
//       References:
//         https://github.com/hotwired/turbo/issues/48
//         Suggested solutions from Rails community: using turbo stream instead, or building a fake table via css + div.
//         Rails team even removed tables from its scaffold templates
//
//   <a>/<form> Custom Attribute
//     data-ya-turbo-confirm:
//       A modal is displayed before issuing a request if a link or a form has this attribute.
//       The value of data-confirm is displayed as the modal content.
//
//     data-ya-turbo-confirm-options
//       used for setting the confirm modal options. More details see modal.js
//
//   <ya-turbo-frame> Custom Events:
//     ajax-html:before-send: fired before sending a request, return false to cancel the request
//     ajax-html:replace-error: fired if error occured in ajax. Event handler arguments: same as the error callback of jQuery.ajax.
//     ajax-html:replace-success: fired on successful replacing. Event handler arguments: [event, replacedNode, documentFromResponse]
//     ajax-html:replace-missing: fired when the response doesn't contain the frame that used for replacing. Event handler arguments: [$frame, documentFromResponse]
//     ya-turbo-confirm:confirmed: fired when user confirmed to issue the request. Event handler arguments: [$linkOrForm, $frame]
//     ya-turbo-confirm:canceled: fired when user canceled the request. Event handler arguments: [$linkOrForm, $frame]
//     ajax-html:handle-flash: fired when the response contains flash. Usually it's an error flash.Event handler arguments: [documentFromResponse, ajaxOptions]
//
//     e.g: modal an error message when ajax failed
//      $(document).on('ajax-html:replace-error', 'ya-turbo-frame#bidding-frame', (e, jqXHR, textStatus, errorThrown) => {
//        modal(`Unable to save bid. Please refresh and try again.`)
//      })
//
//
import { ajaxHTMLReplace } from './ajax'
import modal from './modal'

const activateYetAnotherTurboFrame = () => {
  $(document).on('click.ya-turbo-frame', 'ya-turbo-frame a, a[data-ya-turbo-frame], [be-ya-turbo-frame] a', handler)
  $(document).on('submit.ya-turbo-frame', 'ya-turbo-frame form, form[data-ya-turbo-frame], [be-ya-turbo-frame] form', handler)

  $('ya-turbo-frame[src], [be-ya-turbo-frame][src]').toArray().forEach(loadFrame)

  let observer = new MutationObserver((mutationsList, _observer) => {
    for(const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        //mutation.addedNodes.forEach(node => node.nodeType == node.ELEMENT_NODE && console.log('added Node', node))
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === node.ELEMENT_NODE) {
            if ($(node).is('ya-turbo-frame[src], [be-ya-turbo-frame][src]')) {
              setTimeout(() => loadFrame(node), 1)
            } else {
              let nodes = node.querySelectorAll('ya-turbo-frame[src], [be-ya-turbo-frame][src]')
              nodes.length > 0 && setTimeout(() => nodes.forEach(loadFrame), 1)
            }
          }
        })
      }
    }
  })
  observer.observe(document, { childList: true, subtree: true })
}

const handler = function(event) {
  let $target = $(this),
    frameID = $target.data('ya-turbo-frame'),
    $frame = frameID ? $(`ya-turbo-frame#${frameID}, #${frameID}[be-ya-turbo-frame]`) : $target.closest('ya-turbo-frame, [be-ya-turbo-frame]'),
    isLink = $target.is('a')

  if ($frame.attr('disabled') || $target.attr('target') == '_top') {
    if (isLink && $target.data('ya-turbo-method') != undefined && $target.data('ya-turbo-method') != 'get') {
      handleNonGetLinkClick(event, $target)
    } else {
      return
    }
  }

  event.preventDefault()

  let message = $target.data('ya-turbo-confirm')
  let options = $target.data('ya-turbo-confirm-options') || {}
  if (message) {
    modal(message, {
      show_close: true,
      show_action: true,
      action_text: 'OK',
      close_text: 'Cancel',
      on_action_click: () => {
        $target.trigger('ya-turbo-confirm:confirmed', [$target, $frame])
        modal({ destroy: true })
        replaceFrame(event, $target, $frame)
      },
      on_close_click: () => {
        $target.trigger('ya-turbo-confirm:canceled', [$target, $frame])
        modal({ destroy: true })
      },
      ...options
    })
  } else {
    replaceFrame(event, $target, $frame)
  }
}

const replaceFrame = (_event, $target, $frame) => {
  let frameID = $frame.attr('id'),
    targets = $frame.attr('targets'),
    isLink = $target.is('a'),
    handleFlash = $frame.attr('handle-flash') !== 'false',
    global = $frame.attr('global') ? $frame.attr('global') !== 'false' : true,
    url, data = {}, type

  if (isLink) {
    url = $target.attr('href')
    type = $target.data('ya-turbo-method') || 'get'
    if (url.startsWith('javascript')) return
  } else {
    type = $target.attr('method') || 'post'
    url = $target.attr('action')
    data = Object.fromEntries(new FormData($target[0]))
  }

  let ids = [`ya-turbo-frame#${frameID}, #${frameID}[be-ya-turbo-frame]`]
  if (targets) {
    ids = ids.concat(targets.split(',').map(id => id.trim()).map(id => `ya-turbo-frame#${id}, #${id}[be-ya-turbo-frame]`))
  }

  if ($frame.attr('loading')) return false
  $frame.attr('loading', true)
  ajaxHTMLReplace(...ids, { type, url, data, handleFlash, global, $element: $frame, elements: [$frame, $target] }).always(() => {
    $frame.removeAttr('loading')
  })
}

const handleNonGetLinkClick = (event, $link) => {
  event.preventDefault()

  var href = $link.attr('href'),
    method = $link.data('ya-turbo-method'),
    target = $link.attr('target'),
    csrfToken = $('meta[name=csrf-token]').attr('content'),
    csrfParam = $('meta[name=csrf-param]').attr('content'),
    form = $('<form method="post" action="' + href + '"></form>'),
    metadataInput = '<input name="_method" value="' + method + '" type="hidden" />';

  if (csrfParam !== undefined && csrfToken !== undefined) {
    metadataInput += '<input name="' + csrfParam + '" value="' + csrfToken + '" type="hidden" />';
  }

  if (target) { form.attr('target', target); }

  form.hide().append(metadataInput).appendTo('body');
  form.trigger('submit')
}

const loadFrame = (frame) => {
  let $frame = $(frame),
    id = $frame.attr('id')
  ajaxHTMLReplace(`ya-turbo-frame#${id}, #${id}[be-ya-turbo-frame]`, {
    type: 'get',
    url: $frame.attr('src'),
    handleFlash: $frame.attr('handle-flash') !== 'false',
    global: $frame.attr('global') !== 'false',
  })
}

export { activateYetAnotherTurboFrame }

