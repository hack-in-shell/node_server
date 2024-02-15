ALTER TABLE friends ADD CONSTRAINT unique_user_friend_pair UNIQUE (user_id, friend_id);
