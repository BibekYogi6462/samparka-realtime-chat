//package com.bibek.Samparka.realtime_chat_application.contollers;
//
//import com.bibek.Samparka.realtime_chat_application.entities.Message;
//import com.bibek.Samparka.realtime_chat_application.entities.Room;
//import com.bibek.Samparka.realtime_chat_application.repositories.RoomRepository;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//
//
//@RestController
//@RequestMapping("api/v1/rooms")
//@CrossOrigin("http://localhost:5173")
//public class RoomController {
//
//
//    private RoomRepository roomRepository;
//
//    public RoomController(RoomRepository roomRepository) {
//        this.roomRepository = roomRepository;
//    }
//
//
//    //create room
//    @PostMapping
//    public ResponseEntity<?> createRoom(@RequestBody String roomId) {
//        if (roomRepository.findByRoomId(roomId) != null) {
//            return ResponseEntity.badRequest().body("Room already exists");
//        }
//
//        Room room = new Room();
//        room.setRoomId(roomId);
//        Room savedRoom = roomRepository.save(room);
//        return ResponseEntity.status(HttpStatus.CREATED).body(savedRoom);
//
//    }
//
//
//    //getroom
//    @GetMapping("/{roomId}")
//    public ResponseEntity<?> joinRoom(
//            @PathVariable String roomId
//    ) {
//        Room room = roomRepository.findByRoomId(roomId);
//        if (room == null) {
//            return ResponseEntity.badRequest().body("Room not found");
//        }
//        return ResponseEntity.ok(room);
//    }
//
//
//    //get messages of a room
//    @GetMapping("/{roomId}/messages")
//    public ResponseEntity<List<Message>> getMessages(
//            @PathVariable String roomId,
//            @RequestParam(value = "page", defaultValue = "0", required = false) int page,
//            @RequestParam(value = "size", defaultValue = "10", required = false) int size
//    ) {
//        Room room = roomRepository.findByRoomId(roomId);
//        if (room == null) {
//            return ResponseEntity.badRequest().build();
//        }
//
//        List<Message> messages = room.getMessages();
//
//        int start = Math.max(0, messages.size() - (page + 1) * size);
//        int end = Math.min(messages.size(), start + size);
//
//        List<Message> paginatedMessages = messages.subList(start, end);
//        return ResponseEntity.ok(paginatedMessages);
//    }
//
//}

package com.bibek.Samparka.realtime_chat_application.contollers;

import com.bibek.Samparka.realtime_chat_application.entities.Message;
import com.bibek.Samparka.realtime_chat_application.entities.Room;
import com.bibek.Samparka.realtime_chat_application.repositories.RoomRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("api/v1/rooms")
@CrossOrigin("http://localhost:5173")
public class RoomController {

    private RoomRepository roomRepository;

    public RoomController(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    // Create room - Accept both JSON and plain text
    @PostMapping
    public ResponseEntity<?> createRoom(@RequestBody Map<String, String> request) {
        // Get roomId from JSON body
        String roomId = request.get("roomId");

        if (roomId == null || roomId.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Room ID is required");
        }

        if (roomRepository.findByRoomId(roomId) != null) {
            return ResponseEntity.badRequest().body("Room already exists");
        }

        Room room = new Room();
        room.setRoomId(roomId);
        Room savedRoom = roomRepository.save(room);

        // Return roomId in response
        return ResponseEntity.status(HttpStatus.CREATED).body(Collections.singletonMap("roomId", savedRoom.getRoomId()));
    }

    // Get room by ID
    @GetMapping("/{roomId}")
    public ResponseEntity<?> joinRoom(@PathVariable String roomId) {
        Room room = roomRepository.findByRoomId(roomId);
        if (room == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Room not found");
        }
        return ResponseEntity.ok(room);
    }

    // Get messages of a room
    @GetMapping("/{roomId}/messages")
    public ResponseEntity<List<Message>> getMessages(
            @PathVariable String roomId,
            @RequestParam(value = "page", defaultValue = "0", required = false) int page,
            @RequestParam(value = "size", defaultValue = "50", required = false) int size
    ) {
        Room room = roomRepository.findByRoomId(roomId);
        if (room == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        List<Message> messages = room.getMessages();
        if (messages == null || messages.isEmpty()) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        // Reverse to show newest first
        List<Message> reversedMessages = new java.util.ArrayList<>(messages);
        java.util.Collections.reverse(reversedMessages);

        int start = page * size;
        int end = Math.min(start + size, reversedMessages.size());

        if (start >= reversedMessages.size()) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        List<Message> paginatedMessages = reversedMessages.subList(start, end);
        return ResponseEntity.ok(paginatedMessages);
    }
}