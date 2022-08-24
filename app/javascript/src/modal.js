// Make a modal from scratch
// modal('message', {
//   class: '',                              // class name
//   title: 'title',                         // title of modal
//   show_close: true,                       // indicates whether shows close link or not
//   close_text: '',                         // text of close link
//   on_close_click: function() {},          // event listener on close link clicking
//   show_action: true,                      // indicates whether shows action button (usually an update button) or not
//   action_text: '',                        // text of action button
//   on_action_click: function() {},         // event listener on action button clicking
//   action_goto: '',                        // goto particular page after clicking action button, if on_action_click is not specified
//   destroy: true                           // hide the modal
//   calc_height: function() {}              // calculate and set the modal min/max height. default the max height would be 4/5 of viewport height
// })
//
// Make a modal from existing html element
// modal({
//   modal: '',                              // css selector, for finding existing modal
//   on_close_click: function() {},
//   on_action_click: function() {},
//   destroy: true,
// })

var defaultOptions = {
  action_text: 'Update',
  close_text: 'Close',
  show_close: true,
  show_action: true,
  modal: '#modal'
};

defaultOptions.template = [
  '<div id="modal" class="modal">',
  '  <div class="modal-content">',
  '    <div class="modal-header">',
  '      <h2 class="modal-title"></h2>',
  '    </div>',
  '    <div class="modal-body">',
  '    </div>',
  '    <div class="modal-footer">',
  '      <a class="close" data-modal-close="true">' + defaultOptions.close_text + '</a>',
  '      <button class="action button" data-modal-action="true">' + defaultOptions.action_text + '</button>',
  '    </div>',
  '  </div>',
  '</div>'
].join(' ');

function updateDefault(options) {
  for(var k in options) {
    defaultOptions[k] = options[k];
  }
}

var action_click_handler, close_click_handler, current_modal_selector;

export default function modal(message, options) {
  if (typeof message === 'object') {
    options = message;
    message = null;
  } else {
    message = message.toString();
    options = options ? options : {};
    var renew = true;
  }

  if (options.modal) {
    var modalEle = document.querySelector(options.modal)
    if (!modalEle) {
      throw("HTML element " + options.modal + " not found.");
    }
  } else {
    var modalEle = document.querySelector(defaultOptions.modal);
    if (!modalEle) {
      document.body.insertAdjacentHTML('beforeend', defaultOptions.template);
      var modalEle = document.querySelector(defaultOptions.modal);
    }
  }

  if (options.destroy === true) {
    modalEle.style.display = 'none';
    current_modal_selector = null;

    //Clean up all event handlers
    var action = modalEle.querySelector('[data-modal-action]')
    if (action) {
      action_click_handler && action.removeEventListener('click', action_click_handler);
    }
    var close_link = modalEle.querySelector('[data-modal-close]');
    if (close_link) {
      close_click_handler && close_link.removeEventListener('click', close_click_handler);
    }

    return;
  }

  // Destroy if current modal is showing
  if (current_modal_selector) {
    modal({ modal: current_modal_selector, destroy: true });
  }

  current_modal_selector = options.modal || defaultOptions.modal;


  var action = modalEle.querySelector('[data-modal-action]')
  if (action) {
    action_click_handler && action.removeEventListener('click', action_click_handler);
    if (options.on_action_click) {
      action_click_handler = options.on_action_click;
    } else {
      action_click_handler = function(e) { window.location.href = options.action_goto || window.location.href }
    }
    action.addEventListener('click', action_click_handler);
  }

  var close_link = modalEle.querySelector('[data-modal-close]');
  if (close_link) {
    close_click_handler && close_link.removeEventListener('click', close_click_handler);
    if (options.on_close_click) {
      close_click_handler = options.on_close_click
    } else {
      close_click_handler = function() { modal({ modal: current_modal_selector, destroy: true }) };
    }
    close_link.addEventListener('click', close_click_handler);
  }

  if (renew) {
    if (action) {
      var show_action = typeof options.show_action === 'undefined' ? defaultOptions.show_action : options.show_action;
      action.style.display = (show_action ? 'block' : 'none');
      action.innerHTML = options.action_text || defaultOptions.action_text
    }

    if (close_link) {
      var show_close = typeof options.show_close === 'undefined' ? defaultOptions.show_close : options.show_close;
      close_link.innerHTML = options.close_text || defaultOptions.close_text;
      close_link.style.display = (show_close ? 'block' : 'none');
    }
    modalEle.className = options.class ? 'modal ' + options.class : 'modal';
    modalEle.querySelector('.modal-title').innerHTML = options.title || '';
    modalEle.querySelector('.modal-body').innerHTML = message;
    options.calc_height ? options.calc_height(modalEle) : calcHeight(modalEle);
  }

  options.calc_height ? options.calc_height(modalEle) : calcHeight(modalEle);

  // Blur from active element like input field or button so that press enter does nothing.
  document.activeElement.blur();

  var desktop_message = options.desktop_message || message;
  if (!(options.desktop_notification === false) && typeof desktop_message === 'string') {
  }
};

function calcHeight(modalEle) {
  // Set min/max Height manually
  // modal content height must be a even number, because of css translateY, otherwise text may be blurry
  // https://keithclark.co.uk/articles/gpu-text-rendering-in-webkit/
  var modalContent = modalEle.querySelector('.modal-content');

  modalEle.style.display = 'block';
  modalContent.style.minHeight = '';
  modalContent.style.maxHeight = '';

  var maxHeight = Math.ceil(window.innerHeight * (4 / 5) / 2) * 2;
  var minHeight = Math.ceil(modalContent.offsetHeight / 2) * 2;

  if (minHeight > maxHeight) {
    modalContent.style.maxHeight = maxHeight + 'px'
  } else {
    modalContent.style.minHeight = minHeight + 'px';
  }
}

modal.updateDefault = updateDefault;

