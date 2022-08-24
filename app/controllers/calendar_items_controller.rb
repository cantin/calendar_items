class CalendarItemsController < ApplicationController
  before_action :set_calendar_item, only: %i[ show edit update destroy ]

  # GET /calendar_items or /calendar_items.json
  def index
    @calendar_items = CalendarItem.all
  end

  # GET /calendar_items/1 or /calendar_items/1.json
  def show
  end

  # GET /calendar_items/new
  def new
    @calendar_item = CalendarItem.new
  end

  # GET /calendar_items/1/edit
  def edit
  end

  # POST /calendar_items or /calendar_items.json
  def create
    @calendar_item = CalendarItem.new(calendar_item_params)

    respond_to do |format|
      if @calendar_item.save
        format.html { redirect_to calendar_item_url(@calendar_item), notice: "Calendar item was successfully created." }
        format.json { render :show, status: :created, location: @calendar_item }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @calendar_item.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /calendar_items/1 or /calendar_items/1.json
  def update
    respond_to do |format|
      if @calendar_item.update(calendar_item_params)
        format.html { redirect_to calendar_item_url(@calendar_item), notice: "Calendar item was successfully updated." }
        format.json { render :show, status: :ok, location: @calendar_item }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @calendar_item.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /calendar_items/1 or /calendar_items/1.json
  def destroy
    @calendar_item.destroy

    respond_to do |format|
      format.html { redirect_to calendar_items_url, notice: "Calendar item was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_calendar_item
      @calendar_item = CalendarItem.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def calendar_item_params
      params.require(:calendar_item).permit(:interviewee_id, :interviewer_id, :start_time, :end_time)
    end
end
