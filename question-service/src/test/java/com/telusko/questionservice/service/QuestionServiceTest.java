package com.telusko.questionservice.service;


import com.questionservice.dao.QuestionDao;
import com.questionservice.model.Question;
import com.questionservice.service.QuestionCodeGenerator;
import com.questionservice.service.QuestionService;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.http.HttpStatus;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class QuestionServiceTest {

    @InjectMocks
    private QuestionService questionService;

    @Mock
    private QuestionDao questionDao;

    @Mock
    private QuestionCodeGenerator generator;

    private final String CATEGORY = "Java";
    private final int NUM_QUESTIONS = 3;
    private final String GENERATED_CODE = "123456ABCDEF";

    @Test
    void testGetQuestionsForQuiz() {

        var mockIds = List.of(1, 2, 3);

        when(questionDao.findRandomQuestionsByCategory(CATEGORY, NUM_QUESTIONS))
                .thenReturn(mockIds);

        var response = questionService.getQuestionsForQuiz(CATEGORY, NUM_QUESTIONS);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(mockIds, response.getBody());
    }

    @Test
void testAddQuestion() {

    var q1 = new Question();
    var q2 = new Question();
    var questions = List.of(q1, q2);

    when(generator.generate()).thenReturn(GENERATED_CODE);

    var response = questionService.addQuestion(questions);

    assertEquals(HttpStatus.CREATED, response.getStatusCode());
    assertEquals(GENERATED_CODE, response.getBody());

    verify(questionDao, times(1)).saveAll(questions);

    assertEquals(GENERATED_CODE, q1.getQuestion_code());
    assertEquals(GENERATED_CODE, q2.getQuestion_code());
}
}