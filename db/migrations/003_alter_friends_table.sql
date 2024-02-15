ALTER TABLE friends
ADD CONSTRAINT fk_friends_people
FOREIGN KEY (friend_id) REFERENCES people(id);