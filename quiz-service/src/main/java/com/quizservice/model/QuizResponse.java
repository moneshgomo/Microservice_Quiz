package com.quizservice.model;

import java.util.List;

public class QuizResponse {

    private Long id;
    private String title;
    private List<QuestionWrapper> questions;

    public QuizResponse(Long quiz_id , String title, List<QuestionWrapper> questions) {
       this.id=quiz_id;
        this.title = title;
        this.questions = questions;
    }

    public String getTitle() {
        return title;
    }

    public List<QuestionWrapper> getQuestions() {
        return questions;
    }

    public Long getId() {
        return id;
    }
}

