class CreateInterviewees < ActiveRecord::Migration[7.0]
  def change
    create_table :interviewees do |t|
      t.string :name

      t.timestamps
    end
  end
end
