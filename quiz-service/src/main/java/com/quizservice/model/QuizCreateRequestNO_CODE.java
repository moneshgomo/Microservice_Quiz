package com.quizservice.model;

import lombok.Data;

public record QuizCreateRequestNO_CODE   (
        String categoryName,
        Integer numQuestions,
        String title
) {}
