package com.quizservice.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Random;
import org.springframework.stereotype.Component;


@Component
public class QuizCodeGenerator {
    private static final int RANDOM_LENGTH = 6;
    private static final String CODE_PATTERNS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    private final Random random = new Random();

    public String generate(String alterQuestionCodeToQuizCode) {

        String timePart = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("HHmmss"));
    
        String inputPart = alterQuestionCodeToQuizCode
                .substring(0, Math.min(4, alterQuestionCodeToQuizCode.length()))
                .toUpperCase();
    
        StringBuilder randomPart = new StringBuilder();
        for (int i = 0; i < RANDOM_LENGTH; i++) {
            int index = random.nextInt(CODE_PATTERNS.length());
            randomPart.append(CODE_PATTERNS.charAt(index));
        }
    
        return "quiz_" + timePart + "_" + inputPart + "_" + randomPart;
    }
}
