package com.telusko.questionservice.service;

import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Random;

@Component
public class QuestionCodeGenerator {

    private static final String CODE_PATTERNS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-";
    private static final int RANDOM_LENGTH = 10;

    private final Random random = new Random();

    public String generate() {

        String timePart = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("HHmmss"));

        StringBuilder randomPart = new StringBuilder();
        for (int i = 0; i < RANDOM_LENGTH; i++) {
            int index = random.nextInt(CODE_PATTERNS.length());
            randomPart.append(CODE_PATTERNS.charAt(index));
        }

        return timePart + randomPart;
    }
}