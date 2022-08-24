// Entry point for the build script in your package.json
//import "@hotwired/turbo-rails"
//import "./controllers"
import * as bootstrap from "bootstrap";

import $ from 'jQuery'
import Rails from '@rails/ujs'
import modal from './src/modal'
import { activateYetAnotherTurboFrame } from "./src/yet_another_turbo_frame"
import DRender from './src/d_render'
import { ajax } from './src/ajax'
import "./channels"

window.$ = $
window.modal = modal

const initRailsUJS = (Rails) => {
  // Copied from rails@ujs. Use ajaxPrefilter to set CSRF token for Rails UJS
  $.rails = Rails;
  $.ajaxPrefilter(function(options, _, xhr) {
    if (!options.crossDomain) {
      return Rails.CSRFProtection(xhr);
    }
  });
  Rails.start()

  // Rails ujs data-remote default error handler
  $(document).on('ajax:error', function(event, xhr, _status, _error) {
    if ($(event.target).data('global') === false) {
      return;
    }
    ajax.showErrorMsg(xhr)
  });

  // Override Rails ujs to disable submit button once submitted. Specially for msg form.
  if (Rails.enableFormElement) {
    const originalEnableFormElement = $.rails.enableFormElement;
    $.rails.enableFormElement = function(element) {
      if ($(element).data('disable-once-submitted')) return;
      originalEnableFormElement(element);
    }
  }
}

$(() => {
  initRailsUJS(Rails)
  activateYetAnotherTurboFrame()
  DRender.run()
})
