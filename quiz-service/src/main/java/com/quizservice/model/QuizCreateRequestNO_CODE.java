package com.quizservice.model;


public record QuizCreateRequestNO_CODE   (
        String categoryName,
        Integer numQuestions,
        String title
) {}
