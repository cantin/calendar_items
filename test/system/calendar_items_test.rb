require "application_system_test_case"

class CalendarItemsTest < ApplicationSystemTestCase
  setup do
    @calendar_item = calendar_items(:one)
  end

  test "visiting the index" do
    visit calendar_items_url
    assert_selector "h1", text: "Calendar items"
  end

  test "should create calendar item" do
    visit calendar_items_url
    click_on "New calendar item"

    fill_in "End time", with: @calendar_item.end_time
    fill_in "Interviewee", with: @calendar_item.interviewee_id
    fill_in "Interviewer", with: @calendar_item.interviewer_id
    fill_in "Start time", with: @calendar_item.start_time
    click_on "Create Calendar item"

    assert_text "Calendar item was successfully created"
    click_on "Back"
  end

  test "should update Calendar item" do
    visit calendar_item_url(@calendar_item)
    click_on "Edit this calendar item", match: :first

    fill_in "End time", with: @calendar_item.end_time
    fill_in "Interviewee", with: @calendar_item.interviewee_id
    fill_in "Interviewer", with: @calendar_item.interviewer_id
    fill_in "Start time", with: @calendar_item.start_time
    click_on "Update Calendar item"

    assert_text "Calendar item was successfully updated"
    click_on "Back"
  end

  test "should destroy Calendar item" do
    visit calendar_item_url(@calendar_item)
    click_on "Destroy this calendar item", match: :first

    assert_text "Calendar item was successfully destroyed"
  end
end
