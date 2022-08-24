class CalendarItem < ApplicationRecord
  Mins = [0, 15, 30, 45]
  Duration = 15.minutes
  HourRange = 9...17

  belongs_to :interviewee, optional: true
  belongs_to :interviewer

  enum :status, [:available, :booked, :canceled]
  validates :start_time, :duration, presence: true

  validate :validate_time, on: :create
  validate :validaet_interviewee

  def self.day_loop(date)
    HourRange.flat_map do |hour|
      Mins.map do |min|
        start_time = date.clone.change(hour:, min:, sec: 0, usec: 0)
        [start_time, start_time.clone + Duration]
      end
    end
  end

  def apply!(interviewee)
    with_lock do
      raise "already booked" if self.interviewee.present?
      self.update!(interviewee:, status: :booked)
    end
  end

  def cancel!(interviewee)
    with_lock do
      raise "wrong interviewee" if interviewee != self.interviewee
      self.update!(interviewee: nil, status: :available)
    end
  end

  def self.within_a_day(date)
    date = date.beginning_of_day
    self.where(start_time: date..(date+1.day))
  end

  private def validate_time
    errors.add('', "The minute of start time must be one of #{mins}") if !Mins.include?(start_time.min)
    errors.add(:meeting_duration, "should be 15 minutes") if duration != Duration

    ids = interviewer.calendar_items.where(start_time: start_time...(start_time + duration)).pluck(:id)
    if (ids - [id]).present?
      errors.add(:calendar_items, "is conflict with others.")
    end
  end

  private def validaet_interviewee
    if interviewee.present?
      date = start_time.beginning_of_day
      ids = interviewer.calendar_items.where(start_time: date...(date + 1.day)).where(interviewee: interviewee).pluck(:id)
      if (ids - [id]).present?
        errors.add(:interviewee, "can only see particular interviewer once in a day")
      end
    end
  end
end
