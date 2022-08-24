class Interview
  include ActiveModel::Conversion

  # ContactMessage are never persisted in the DB
  def persisted?
    false
  end

  attr_reader :interviewee, :start_time, :item_candidates

  delegate :status, to: :booked

  def initialize(interviewee, start_time, item_candidates)
    @interviewee = interviewee
    @start_time = start_time
    @item_candidates = item_candidates
  end

  def no_items?
    @item_candidates.empty?
  end

  def available_items
    item_candidates.select(&:available?)
  end

  def can_be_booked?
    available_items.present? && !booked
  end

  def booked
    @item_candidates.find { |item| item.booked? && item.interviewee == interviewee }
  end

  def booked_by_interviewee?
    booked.present?
  end
end
