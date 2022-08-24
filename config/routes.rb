Rails.application.routes.draw do

  resources :interviewees do
    member do
      post 'interviews', to: 'interviews#apply'
      post 'interviews/cancel'
    end
  end
  resources :interviewers do
    resources :calendar_items, controller: 'manage/calendar_items', only: [:create, :update] do
      member do
        post 'cancel'
      end
    end
  end
  resources :interviewees
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Defines the root path route ("/")
  # root "articles#index"
end
