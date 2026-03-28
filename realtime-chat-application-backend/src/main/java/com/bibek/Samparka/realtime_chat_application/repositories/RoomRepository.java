package com.bibek.Samparka.realtime_chat_application.repositories;

import com.bibek.Samparka.realtime_chat_application.entities.Room;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface RoomRepository extends MongoRepository<Room, String> {

    //get room using room id
    Room findByRoomId(String roomId);
}
