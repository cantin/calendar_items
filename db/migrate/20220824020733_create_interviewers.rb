class CreateInterviewers < ActiveRecord::Migration[7.0]
  def change
    create_table :interviewers do |t|
      t.string :name

      t.timestamps
    end
  end
end
