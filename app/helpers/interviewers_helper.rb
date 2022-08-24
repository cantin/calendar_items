module InterviewersHelper

  def date_selector_options
    10.times.map do |i|
      time = Time.zone.now.beginning_of_day + i.days
      [time.strftime("%F"), time.strftime("%F")]
    end
  end
end
