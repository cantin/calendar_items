module ApplicationHelper
  def flash_content(type, message)
    klass = { error: 'danger', notice: 'success', info: 'info', warning: 'warning' }.with_indifferent_access

    content_tag(:div, class: "alert alert-#{klass[type]} alert-dismissible", role: 'alert', 'data-flash': true, 'data-closable': 'true',) do
      content_tag(:span, message, class: "flash-msg") + button_tag('', class: "btn-close", 'data-close': true, 'data-bs-dismiss': 'alert')
    end
  end
end
