package com.ecoswap.backend.repository;

import com.ecoswap.backend.entity.Message;
import com.ecoswap.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("SELECT m FROM Message m WHERE " +
           "(m.sender.id = :u1Id AND m.recipient.id = :u2Id) OR " +
           "(m.sender.id = :u2Id AND m.recipient.id = :u1Id) " +
           "ORDER BY m.createdAt ASC")
    List<Message> findChatHistory(@Param("u1Id") Long u1Id, @Param("u2Id") Long u2Id);

    @Query("SELECT DISTINCT u FROM User u WHERE u.id <> :userId AND " +
           "(u.id IN (SELECT m.sender.id FROM Message m WHERE m.recipient.id = :userId) OR " +
           " u.id IN (SELECT m.recipient.id FROM Message m WHERE m.sender.id = :userId))")
    List<User> findChatPartners(@Param("userId") Long userId);
}
