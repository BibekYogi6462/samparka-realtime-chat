//package com.bibek.Samparka.realtime_chat_application.contollers;
//
//
//import com.bibek.Samparka.realtime_chat_application.entities.Message;
//import com.bibek.Samparka.realtime_chat_application.entities.Room;
//import com.bibek.Samparka.realtime_chat_application.payload.MessageRequest;
//import com.bibek.Samparka.realtime_chat_application.repositories.RoomRepository;
//import org.springframework.messaging.handler.annotation.DestinationVariable;
//import org.springframework.messaging.handler.annotation.MessageMapping;
//import org.springframework.messaging.handler.annotation.SendTo;
//import org.springframework.stereotype.Controller;
//import org.springframework.web.bind.annotation.CrossOrigin;
//import org.springframework.web.bind.annotation.RequestBody;
//
//import java.time.LocalDateTime;
//
//@Controller
//@CrossOrigin("http://localhost:5173")
//public class ChatController {
//
//
//    private RoomRepository roomRepository;
//
//    public ChatController(RoomRepository roomRepository) {
//        this.roomRepository = roomRepository;
//    }
//
//    //for sending and receiving messages
//    @MessageMapping("/sendMessage/{roomId}")
//    @SendTo("/topic/room/{roomId}")
//    public Message sendMessage(
//            @DestinationVariable String roomId,
//            @RequestBody MessageRequest request
//    ) {
//
//     Room room = roomRepository.findByRoomId(request.getRoomId());
//     Message message = new Message();
//        message.setContent(request.getContent());
//        message.setSender(request.getSender());
//        message.setTimeStamp(LocalDateTime.now());
//
//        if(room != null){
//            room.getMessages().add(message);
//            roomRepository.save(room);
//        } else {
//
//            throw new RuntimeException("Room not found");
//        }
//
//        return message;
//
//
//
//}
//
//
//}
package com.bibek.Samparka.realtime_chat_application.contollers;

import com.bibek.Samparka.realtime_chat_application.entities.Message;
import com.bibek.Samparka.realtime_chat_application.entities.Room;
import com.bibek.Samparka.realtime_chat_application.payload.MessageRequest;
import com.bibek.Samparka.realtime_chat_application.repositories.RoomRepository;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.time.LocalDateTime;

@Controller
@CrossOrigin("http://localhost:5173")
public class ChatController {

    private RoomRepository roomRepository;

    public ChatController(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    // For sending and receiving messages
    @MessageMapping("/sendMessage/{roomId}")
    @SendTo("/topic/room/{roomId}")
    public Message sendMessage(
            @DestinationVariable String roomId,
            MessageRequest request  // Remove @RequestBody - not needed for WebSocket
    ) {
        System.out.println("Received message for room: " + roomId);
        System.out.println("Message content: " + request.getContent());
        System.out.println("Sender: " + request.getSender());

        // Find room by roomId from path variable
        Room room = roomRepository.findByRoomId(roomId);

        Message message = new Message();
        message.setContent(request.getContent());
        message.setSender(request.getSender());
        message.setTimeStamp(LocalDateTime.now());

        if (room != null) {
            room.getMessages().add(message);
            roomRepository.save(room);
            System.out.println("Message saved successfully for room: " + roomId);
        } else {
            System.err.println("Room not found: " + roomId);
            throw new RuntimeException("Room not found: " + roomId);
        }

        return message;
    }
}