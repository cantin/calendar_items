class IntervieweesController < ApplicationController
  before_action :set_interviewee, only: %i[ show edit update destroy ]

  # GET /interviewees or /interviewees.json
  def index
    @interviewees = Interviewee.all
  end

  # GET /interviewees/1 or /interviewees/1.json
  def show
    @date = params[:date] ? Time.zone.parse(params[:date]) : Time.zone.now.beginning_of_day
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_interviewee
      @interviewee = Interviewee.find(params[:id])
    end
end
