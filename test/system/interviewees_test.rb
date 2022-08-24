require "application_system_test_case"

class IntervieweesTest < ApplicationSystemTestCase
  setup do
    @interviewee = interviewees(:one)
  end

  test "visiting the index" do
    visit interviewees_url
    assert_selector "h1", text: "Interviewees"
  end

  test "should create interviewee" do
    visit interviewees_url
    click_on "New interviewee"

    fill_in "Name", with: @interviewee.name
    click_on "Create Interviewee"

    assert_text "Interviewee was successfully created"
    click_on "Back"
  end

  test "should update Interviewee" do
    visit interviewee_url(@interviewee)
    click_on "Edit this interviewee", match: :first

    fill_in "Name", with: @interviewee.name
    click_on "Update Interviewee"

    assert_text "Interviewee was successfully updated"
    click_on "Back"
  end

  test "should destroy Interviewee" do
    visit interviewee_url(@interviewee)
    click_on "Destroy this interviewee", match: :first

    assert_text "Interviewee was successfully destroyed"
  end
end
