require "test_helper"

class IntervieweesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @interviewee = interviewees(:one)
  end

  test "should get index" do
    get interviewees_url
    assert_response :success
  end

  test "should get new" do
    get new_interviewee_url
    assert_response :success
  end

  test "should create interviewee" do
    assert_difference("Interviewee.count") do
      post interviewees_url, params: { interviewee: { name: @interviewee.name } }
    end

    assert_redirected_to interviewee_url(Interviewee.last)
  end

  test "should show interviewee" do
    get interviewee_url(@interviewee)
    assert_response :success
  end

  test "should get edit" do
    get edit_interviewee_url(@interviewee)
    assert_response :success
  end

  test "should update interviewee" do
    patch interviewee_url(@interviewee), params: { interviewee: { name: @interviewee.name } }
    assert_redirected_to interviewee_url(@interviewee)
  end

  test "should destroy interviewee" do
    assert_difference("Interviewee.count", -1) do
      delete interviewee_url(@interviewee)
    end

    assert_redirected_to interviewees_url
  end
end
