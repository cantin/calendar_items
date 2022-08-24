class InterviewersController < ApplicationController
  before_action :set_interviewer, only: %i[ show edit update destroy ]

  # GET /interviewers or /interviewers.json
  def index
    @interviewers = Interviewer.all
  end

  # GET /interviewers/1 or /interviewers/1.json
  def show
    @date = params[:date] ? Time.zone.parse(params[:date]) : Time.zone.now.beginning_of_day
  end

  private
  # Use callbacks to share common setup or constraints between actions.
  def set_interviewer
    @interviewer = Interviewer.find(params[:id])
  end
end
