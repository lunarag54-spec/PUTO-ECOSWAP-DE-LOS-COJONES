package com.ecoswap.backend.controller;

import com.ecoswap.backend.entity.Message;
import com.ecoswap.backend.entity.User;
import com.ecoswap.backend.repository.MessageRepository;
import com.ecoswap.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    public MessageController(MessageRepository messageRepository, UserRepository userRepository) {
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<?> sendMessage(@RequestBody MessageRequest request) {
        try {
            String senderUsername = SecurityContextHolder.getContext().getAuthentication().getName();
            User sender = userRepository.findByUsername(senderUsername)
                    .orElseThrow(() -> new RuntimeException("Remitente no encontrado"));

            User recipient = userRepository.findByUsername(request.getRecipientUsername())
                    .orElseThrow(() -> new RuntimeException("Destinatario no encontrado"));

            if (sender.getId().equals(recipient.getId())) {
                return ResponseEntity.badRequest().body(Map.of("message", "No puedes enviarte un mensaje a ti mismo"));
            }

            if (request.getContent() == null || request.getContent().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "El mensaje no puede estar vacío"));
            }

            Message message = Message.builder()
                    .sender(sender)
                    .recipient(recipient)
                    .content(request.getContent().trim())
                    .build();

            Message savedMessage = messageRepository.save(message);
            return ResponseEntity.ok(savedMessage);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/chats")
    public ResponseEntity<List<User>> getChatPartners() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        List<User> partners = messageRepository.findChatPartners(user.getId());
        return ResponseEntity.ok(partners);
    }

    @GetMapping("/history/{username}")
    public ResponseEntity<List<Message>> getChatHistory(@PathVariable String username) {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        User otherUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Otro usuario no encontrado"));

        List<Message> history = messageRepository.findChatHistory(currentUser.getId(), otherUser.getId());
        return ResponseEntity.ok(history);
    }
}

class MessageRequest {
    private String recipientUsername;
    private String content;

    public String getRecipientUsername() { return recipientUsername; }
    public void setRecipientUsername(String recipientUsername) { this.recipientUsername = recipientUsername; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}
