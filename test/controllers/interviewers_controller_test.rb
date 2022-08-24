require "test_helper"

class InterviewersControllerTest < ActionDispatch::IntegrationTest
  setup do
    @interviewer = interviewers(:one)
  end

  test "should get index" do
    get interviewers_url
    assert_response :success
  end

  test "should get new" do
    get new_interviewer_url
    assert_response :success
  end

  test "should create interviewer" do
    assert_difference("Interviewer.count") do
      post interviewers_url, params: { interviewer: { name: @interviewer.name } }
    end

    assert_redirected_to interviewer_url(Interviewer.last)
  end

  test "should show interviewer" do
    get interviewer_url(@interviewer)
    assert_response :success
  end

  test "should get edit" do
    get edit_interviewer_url(@interviewer)
    assert_response :success
  end

  test "should update interviewer" do
    patch interviewer_url(@interviewer), params: { interviewer: { name: @interviewer.name } }
    assert_redirected_to interviewer_url(@interviewer)
  end

  test "should destroy interviewer" do
    assert_difference("Interviewer.count", -1) do
      delete interviewer_url(@interviewer)
    end

    assert_redirected_to interviewers_url
  end
end
