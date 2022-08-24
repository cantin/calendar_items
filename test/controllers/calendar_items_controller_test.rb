require "test_helper"

class CalendarItemsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @calendar_item = calendar_items(:one)
  end

  test "should get index" do
    get calendar_items_url
    assert_response :success
  end

  test "should get new" do
    get new_calendar_item_url
    assert_response :success
  end

  test "should create calendar_item" do
    assert_difference("CalendarItem.count") do
      post calendar_items_url, params: { calendar_item: { end_time: @calendar_item.end_time, interviewee_id: @calendar_item.interviewee_id, interviewer_id: @calendar_item.interviewer_id, start_time: @calendar_item.start_time } }
    end

    assert_redirected_to calendar_item_url(CalendarItem.last)
  end

  test "should show calendar_item" do
    get calendar_item_url(@calendar_item)
    assert_response :success
  end

  test "should get edit" do
    get edit_calendar_item_url(@calendar_item)
    assert_response :success
  end

  test "should update calendar_item" do
    patch calendar_item_url(@calendar_item), params: { calendar_item: { end_time: @calendar_item.end_time, interviewee_id: @calendar_item.interviewee_id, interviewer_id: @calendar_item.interviewer_id, start_time: @calendar_item.start_time } }
    assert_redirected_to calendar_item_url(@calendar_item)
  end

  test "should destroy calendar_item" do
    assert_difference("CalendarItem.count", -1) do
      delete calendar_item_url(@calendar_item)
    end

    assert_redirected_to calendar_items_url
  end
end
