class CreateCalendarItems < ActiveRecord::Migration[7.0]
  def change
    create_table :calendar_items do |t|
      t.belongs_to :interviewee
      t.belongs_to :interviewer, null: false, foreign_key: true
      t.timestamp :start_time
      t.integer :duration
      t.integer :status

      t.timestamps
    end
  end
end
